// 回答シート名（シートのタブ名と完全一致） → ステージ名
// フォーム（ステージ）を追加したら、ここにも1行追加する
const STAGE_BY_SHEET = {
  "4/17 ステージ1": "4/17 ステージ1",
  "4/17 ステージ2": "4/17 ステージ2",
};

// 各ステージの定員（人数の合計）
const STAGE_CAPACITY = 157;

const MASTER_SHEET_NAME = "予約一覧";

// フォームの質問タイトル（フォーム側と完全一致させる）
const QUESTION_NAME = "名前";
const QUESTION_EMAIL = "メールアドレス";
const QUESTION_PEOPLE = "申込人数";
const REQUIRED_QUESTIONS = [QUESTION_NAME, QUESTION_EMAIL, QUESTION_PEOPLE];

const STATUS_ACCEPTED = "受付";
const STATUS_REJECTED = "申込不可";

// 定員の集計に含める状態（「申込不可」などは数えない）
const COUNTED_STATUSES = [STATUS_ACCEPTED];

// 定員に達してフォームを締め切ったときに表示するメッセージ
const CLOSED_FORM_MESSAGE =
  "このステージは定員に達したため、受付を終了しました。";

// 「予約一覧」の列（1始まり）
const COLUMN_STAGE = 3; // C列
const COLUMN_PEOPLE = 6; // F列
const COLUMN_STATUS = 7; // G列
const COLUMN_SOURCE_SHEET = 9; // I列
const COLUMN_SOURCE_ROW = 10; // J列
const COLUMN_COUNT = 10; // フォーム送信時に書き込む列数（A〜J列）
const COLUMN_SEAT = 11; // K列（席番号。手入力）

const SEAT_HEADER = "席番号";
// 席番号の区切りとして認める文字（半角・全角カンマ、読点、空白）
const SEAT_SEPARATOR = /[,，、\s]+/;
const SEAT_ERROR_COLOR = "#f4cccc";
const COLUMN_NAME = 4; // D列

// 座席表シート（見る専用。予約一覧の席番号から自動で作り直す）
const SEAT_MAP_SHEET_PREFIX = "座席表 ";
const SEAT_MAP_COLUMNS = 10; // 1行に並べる席の数
const SEAT_MAP_FIRST_ROW = 4; // 座席の並びを書き始める行
const SEAT_ASSIGNED_COLOR = "#d9ead3";
const SEAT_EMPTY_COLOR = "#ffffff";
// 編集されたら席番号を再チェックする列（ステージ・申込人数・状態・席番号）
const SEAT_RELATED_COLUMNS = [
  COLUMN_STAGE,
  COLUMN_PEOPLE,
  COLUMN_STATUS,
  COLUMN_SEAT,
];

// 同時送信時にロック解放を待つ最大時間（ミリ秒）
const LOCK_TIMEOUT_MS = 30000;

function onReservationSubmit(e) {
  if (!e || !e.range || !e.source) {
    throw new Error("フォーム送信トリガーから実行してください。");
  }

  const responseSheet = e.range.getSheet();
  const responseSheetName = responseSheet.getName();
  const stage = STAGE_BY_SHEET[responseSheetName];

  if (!stage) {
    throw new Error(`ステージ設定がありません: ${responseSheetName}`);
  }

  const spreadsheet = e.source;
  const masterSheet = spreadsheet.getSheetByName(MASTER_SHEET_NAME);

  if (!masterSheet) {
    throw new Error(`「${MASTER_SHEET_NAME}」シートが見つかりません。`);
  }

  const row = e.range.getRow();

  const answer = (questionTitle) =>
    (e.namedValues[questionTitle] || [""])[0].trim();

  // 入力は必須のため、空欄はフォームの質問タイトル変更などの設定ミスを意味する
  const missingQuestions = REQUIRED_QUESTIONS.filter(
    (questionTitle) => answer(questionTitle) === ""
  );

  if (missingQuestions.length > 0) {
    console.warn(
      `${responseSheetName} ${row}行目: 回答を取得できない項目: ${missingQuestions.join("、")}（質問タイトルがコードと一致しているか確認してください）`
    );
  }

  // 人数が分からないと定員を判定できないため、記録せずに止める（回答シートには残る）
  const people = parsePeopleCount(answer(QUESTION_PEOPLE));

  if (people === null) {
    throw new Error(
      `${responseSheetName} ${row}行目: 申込人数が正の整数ではありません。フォームの入力制限を確認してください。`
    );
  }

  // 同時送信で確認をすり抜けないよう、確認〜追記を排他制御する
  const lock = LockService.getScriptLock();
  lock.waitLock(LOCK_TIMEOUT_MS);

  let shouldCloseForm = false;

  try {
    const existingRows = getExistingRows(masterSheet);

    // 同じ回答行を二重に登録しないための確認
    const alreadyAdded = existingRows.some(
      (existingRow) =>
        existingRow[COLUMN_SOURCE_SHEET - 1] === responseSheetName &&
        Number(existingRow[COLUMN_SOURCE_ROW - 1]) === row
    );

    if (alreadyAdded) {
      return;
    }

    const reservedPeople = countReservedPeople(existingRows, stage);
    const remaining = Math.max(STAGE_CAPACITY - reservedPeople, 0);

    // 定員を超える申込は受け付けない
    const isRejected = people > remaining;
    const status = isRejected ? STATUS_REJECTED : STATUS_ACCEPTED;
    const note = isRejected
      ? `定員超過（申込${people}名／残り${remaining}名）`
      : "";

    if (isRejected) {
      // 個人情報は出さず、シート名・行番号・理由だけを記録する
      console.warn(`${responseSheetName} ${row}行目: ${status} ${note}`);
    }

    const reservationId = `TK-${Utilities.getUuid()}`;

    masterSheet.appendRow([
      new Date(),
      reservationId,
      stage,
      answer(QUESTION_NAME),
      answer(QUESTION_EMAIL),
      answer(QUESTION_PEOPLE),
      status,
      note,
      responseSheetName,
      row,
    ]);

    // ロック解放前に書き込みを確定させ、次の実行が最新の行を読めるようにする
    SpreadsheetApp.flush();

    const addedPeople = isRejected ? 0 : people;
    shouldCloseForm = reservedPeople + addedPeople >= STAGE_CAPACITY;
  } finally {
    lock.releaseLock();
  }

  if (shouldCloseForm) {
    closeForm(responseSheet, stage);
  }
}

/**
 * 「予約一覧」の見出し行を除く全データを返す。
 */
function getExistingRows(masterSheet) {
  const lastRow = masterSheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  return masterSheet.getRange(2, 1, lastRow - 1, COLUMN_COUNT).getValues();
}

/**
 * 指定ステージで定員に数える申込人数の合計を返す。
 */
function countReservedPeople(existingRows, stage) {
  return existingRows
    .filter(
      (existingRow) =>
        existingRow[COLUMN_STAGE - 1] === stage &&
        COUNTED_STATUSES.includes(existingRow[COLUMN_STATUS - 1])
    )
    .reduce(
      (total, existingRow) =>
        total + (parsePeopleCount(existingRow[COLUMN_PEOPLE - 1]) || 0),
      0
    );
}

/**
 * 申込人数を正の整数に変換する。変換できない場合は null を返す。
 */
function parsePeopleCount(value) {
  const count = Number(String(value).trim());
  return Number.isInteger(count) && count > 0 ? count : null;
}

/**
 * 回答シートにつながっているフォームの受付を締め切る。
 * 失敗しても予約の記録は済んでいるため、ログに残すだけにする。
 */
function closeForm(responseSheet, stage) {
  try {
    const formUrl = responseSheet.getFormUrl();

    if (!formUrl) {
      console.warn(`${stage}: 回答シートにフォームがつながっていません。`);
      return;
    }

    const form = FormApp.openByUrl(formUrl);

    if (form.isAcceptingResponses()) {
      form.setCustomClosedFormMessage(CLOSED_FORM_MESSAGE);
      form.setAcceptingResponses(false);
      console.log(`${stage}: 定員に達したためフォームを締め切りました。`);
    }
  } catch (error) {
    console.error(`${stage}: フォームの締め切りに失敗しました: ${error}`);
  }
}

/**
 * 各ステージの予約人数とフォームの受付状態をログに出す。
 * Apps Script エディタから手動で実行する（フォーム操作の権限承認にも使う）。
 */
function showCapacityStatus() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = spreadsheet.getSheetByName(MASTER_SHEET_NAME);

  if (!masterSheet) {
    throw new Error(`「${MASTER_SHEET_NAME}」シートが見つかりません。`);
  }

  const existingRows = getExistingRows(masterSheet);

  Object.entries(STAGE_BY_SHEET).forEach(([sheetName, stage]) => {
    const reservedPeople = countReservedPeople(existingRows, stage);
    const responseSheet = spreadsheet.getSheetByName(sheetName);
    const formUrl = responseSheet ? responseSheet.getFormUrl() : null;
    const accepting = formUrl
      ? FormApp.openByUrl(formUrl).isAcceptingResponses()
      : null;
    const formState =
      accepting === null ? "フォーム未接続" : accepting ? "受付中" : "締切";

    console.log(
      `${stage}: ${reservedPeople}/${STAGE_CAPACITY}名（${formState}）`
    );
  });
}

/**
 * スプレッドシートを開いたときにメニューを追加し、席番号の列を書式なしテキストにする。
 * （シンプルトリガーのため設定不要）
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("予約管理")
    .addItem("席番号をチェック・座席表を更新", "checkAllSeats")
    .addItem("定員の状況をログに出す", "showCapacityStatus")
    .addToUi();

  const masterSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MASTER_SHEET_NAME);

  if (masterSheet) {
    prepareSeatColumn(masterSheet);
  }
}

/**
 * 「予約一覧」の席番号に関わるセルが編集されたら、席番号をチェックする。
 * （シンプルトリガーのため設定不要）
 */
function onEdit(e) {
  if (!e || !e.range) {
    return;
  }

  const sheet = e.range.getSheet();

  if (sheet.getName() !== MASTER_SHEET_NAME || e.range.getLastRow() < 2) {
    return;
  }

  const firstColumn = e.range.getColumn();
  const lastColumn = e.range.getLastColumn();
  const isRelated = SEAT_RELATED_COLUMNS.some(
    (column) => firstColumn <= column && column <= lastColumn
  );

  if (!isRelated) {
    return;
  }

  const result = validateSeats(sheet);
  updateSeatMaps(e.source, result);
  const errorCount = result.errorCount;

  if (errorCount > 0) {
    e.source.toast(
      `問題のある席番号が${errorCount}件あります。赤いセルのメモを確認してください。`,
      "席番号チェック",
      5
    );
  }
}

/**
 * メニューから全件の席番号をチェックする（行の削除後などに使う）。
 */
function checkAllSeats() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = spreadsheet.getSheetByName(MASTER_SHEET_NAME);

  if (!masterSheet) {
    throw new Error(`「${MASTER_SHEET_NAME}」シートが見つかりません。`);
  }

  prepareSeatColumn(masterSheet);
  const result = validateSeats(masterSheet);
  updateSeatMaps(spreadsheet, result);
  const errorCount = result.errorCount;
  const message =
    errorCount > 0
      ? `問題のある席番号が${errorCount}件あります。赤いセルのメモを確認してください。`
      : "席番号に問題はありません。";

  spreadsheet.toast(message, "席番号チェック", 5);
}

/**
 * 席番号の列に見出しを付け、「1,2」が数値に変換されないよう書式なしテキストにする。
 */
function prepareSeatColumn(masterSheet) {
  const header = masterSheet.getRange(1, COLUMN_SEAT);

  if (header.getDisplayValue() === "") {
    header.setValue(SEAT_HEADER);
  }

  masterSheet
    .getRange(2, COLUMN_SEAT, masterSheet.getMaxRows() - 1, 1)
    .setNumberFormat("@");
}

/**
 * 「予約一覧」の全行の席番号をチェックし、問題のあるセルを赤くしてメモに理由を書く。
 * 問題がなくなったセルは色とメモを消す。
 * 戻り値: errorCount（問題のあるセルの数）、rows（予約一覧の値）、
 *        errorsByRow（行ごとの問題）、seatOwners（ステージ → 席番号 → 行の位置の配列）
 */
function validateSeats(masterSheet) {
  const lastRow = masterSheet.getLastRow();

  if (lastRow < 2) {
    return {
      errorCount: 0,
      rows: [],
      errorsByRow: [],
      rowErrorCounts: [],
      seatOwners: {},
    };
  }

  const rows = masterSheet
    .getRange(2, 1, lastRow - 1, COLUMN_SEAT)
    .getDisplayValues();
  const errorsByRow = rows.map(() => []);
  // ステージ → 席番号 → その席番号を持つ行の位置
  const seatOwners = {};

  rows.forEach((rowValues, index) => {
    const seatText = rowValues[COLUMN_SEAT - 1].trim();

    if (seatText === "") {
      return;
    }

    const errors = errorsByRow[index];
    const stage = rowValues[COLUMN_STAGE - 1];
    const status = rowValues[COLUMN_STATUS - 1];
    const seats = [];

    seatText.split(SEAT_SEPARATOR).forEach((token) => {
      const seat = Number(token);

      if (!Number.isInteger(seat) || seat < 1 || seat > STAGE_CAPACITY) {
        errors.push(`「${token}」は1〜${STAGE_CAPACITY}の番号ではありません`);
      } else if (seats.includes(seat)) {
        errors.push(`${seat}番が同じセルに2回入っています`);
      } else {
        seats.push(seat);
      }
    });

    if (status !== STATUS_ACCEPTED) {
      errors.push(`状態が「${status}」の申込に席番号が入っています`);
    }

    const people = parsePeopleCount(rowValues[COLUMN_PEOPLE - 1]);

    if (people !== null && seats.length !== people) {
      errors.push(`申込人数は${people}名ですが、席番号は${seats.length}個です`);
    }

    seatOwners[stage] = seatOwners[stage] || {};
    seats.forEach((seat) => {
      seatOwners[stage][seat] = seatOwners[stage][seat] || [];
      seatOwners[stage][seat].push(index);
    });
  });

  // 重複以外の問題（範囲外・人数違いなど）の件数。座席表で行全体を赤くするかの判定に使う
  const rowErrorCounts = errorsByRow.map((errors) => errors.length);

  // 同じステージ内で、別の行と同じ席番号を使っていないか確認する
  Object.values(seatOwners).forEach((owners) => {
    Object.entries(owners).forEach(([seat, indexes]) => {
      if (indexes.length < 2) {
        return;
      }

      indexes.forEach((index) => {
        const otherRows = indexes
          .filter((otherIndex) => otherIndex !== index)
          .map((otherIndex) => `${otherIndex + 2}行目`)
          .join("、");
        errorsByRow[index].push(`${seat}番が${otherRows}と重複しています`);
      });
    });
  });

  const backgrounds = errorsByRow.map((errors) => [
    errors.length > 0 ? SEAT_ERROR_COLOR : null,
  ]);
  const notes = errorsByRow.map((errors) => [errors.join("\n")]);
  const seatRange = masterSheet.getRange(2, COLUMN_SEAT, rows.length, 1);

  seatRange.setBackgrounds(backgrounds);
  seatRange.setNotes(notes);

  return {
    errorCount: errorsByRow.filter((errors) => errors.length > 0).length,
    rows,
    errorsByRow,
    rowErrorCounts,
    seatOwners,
  };
}

/**
 * ステージごとの「座席表」シートを作り直す（なければ作成する）。
 * 緑 = 割当済み、赤 = 要確認（重複・人数違いなど）、白 = 空席。
 */
function updateSeatMaps(spreadsheet, result) {
  const stages = [...new Set(Object.values(STAGE_BY_SHEET))];
  const activeSheet = spreadsheet.getActiveSheet();
  let createdSheet = false;

  stages.forEach((stage) => {
    const sheetName = `${SEAT_MAP_SHEET_PREFIX}${stage}`;
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
      // 見る専用: 編集しようとすると警告を出す
      sheet
        .protect()
        .setDescription("座席表は自動で作り直されます。席番号は予約一覧のK列に入力してください。")
        .setWarningOnly(true);
      createdSheet = true;
    }

    writeSeatMap(sheet, stage, result);
  });

  // 新しいシートを作るとそちらに画面が切り替わるため、元のシートに戻す
  if (createdSheet && activeSheet) {
    activeSheet.activate();
  }
}

/**
 * 1ステージ分の座席表を書き込む。
 */
function writeSeatMap(sheet, stage, result) {
  const owners = result.seatOwners[stage] || {};
  const gridRows = Math.ceil(STAGE_CAPACITY / SEAT_MAP_COLUMNS);
  const values = [];
  const backgrounds = [];
  let assignedCount = 0;
  let problemCount = 0;

  for (let gridRow = 0; gridRow < gridRows; gridRow++) {
    const valueRow = [];
    const backgroundRow = [];

    for (let gridColumn = 0; gridColumn < SEAT_MAP_COLUMNS; gridColumn++) {
      const seat = gridRow * SEAT_MAP_COLUMNS + gridColumn + 1;

      if (seat > STAGE_CAPACITY) {
        valueRow.push("");
        backgroundRow.push(null);
        continue;
      }

      const indexes = owners[seat] || [];

      if (indexes.length === 0) {
        valueRow.push(String(seat));
        backgroundRow.push(SEAT_EMPTY_COLOR);
        continue;
      }

      const names = indexes
        .map((index) => result.rows[index][COLUMN_NAME - 1] || "（名前なし）")
        .join("、");
      // この席が重複している、または持ち主の行に重複以外の問題がある
      const hasProblem =
        indexes.length > 1 ||
        indexes.some((index) => result.rowErrorCounts[index] > 0);

      valueRow.push(`${seat}\n${names}`);
      backgroundRow.push(hasProblem ? SEAT_ERROR_COLOR : SEAT_ASSIGNED_COLOR);
      assignedCount++;
      if (hasProblem) {
        problemCount++;
      }
    }

    values.push(valueRow);
    backgrounds.push(backgroundRow);
  }

  const updatedAt = Utilities.formatDate(
    new Date(),
    "Asia/Tokyo",
    "yyyy/MM/dd HH:mm:ss"
  );

  sheet.clear();
  sheet
    .getRange(1, 1, 3, 1)
    .setValues([
      [`${stage} 座席表（見る専用・自動更新）`],
      [
        `割当済み ${assignedCount}/${STAGE_CAPACITY}席　空き ${STAGE_CAPACITY - assignedCount}席　要確認 ${problemCount}席　（更新: ${updatedAt}）`,
      ],
      ["緑 = 割当済み　赤 = 要確認（予約一覧の赤いセルを確認）　白 = 空席"],
    ]);
  sheet.getRange(1, 1).setFontWeight("bold").setFontSize(14);

  sheet
    .getRange(SEAT_MAP_FIRST_ROW, 1, gridRows, SEAT_MAP_COLUMNS)
    .setValues(values)
    .setBackgrounds(backgrounds)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true)
    .setBorder(true, true, true, true, true, true);

  sheet.setColumnWidths(1, SEAT_MAP_COLUMNS, 90);
  sheet.setRowHeights(SEAT_MAP_FIRST_ROW, gridRows, 45);
}
