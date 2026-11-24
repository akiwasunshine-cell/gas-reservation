// ===== 基本設定 =====
const MASTER_SHEET_NAME = "予約一覧";
const TIME_ZONE = "Asia/Tokyo";

// ===== ステージ設定シート =====
// ステージの追加・日時・座席・定員は、このシートに書く（コードの変更は不要）
const STAGE_SHEET_NAME = "ステージ設定";
const STAGE_SHEET_HEADERS = [
  "回答シート名",
  "ステージ名",
  "開催日",
  "時間",
  "座席",
  "定員（空欄なら席数）",
];
// 「ステージ設定」シートの列（0始まり）
const STAGE_COLUMN_RESPONSE_SHEET = 0; // A列: 回答シートのタブ名と完全一致
const STAGE_COLUMN_NAME = 1; // B列: 予約一覧のC列に入る名前（空欄なら回答シート名）
const STAGE_COLUMN_DATE = 2; // C列: 開催日
const STAGE_COLUMN_TIME = 3; // D列: 時間（メールにそのまま載る）
const STAGE_COLUMN_SEATS = 4; // E列: 例「1-132」「1-132,A-L」
const STAGE_COLUMN_CAPACITY = 5; // F列: 空欄なら席数
// 「ステージ設定」シートが無いときに作る初期の行
const DEFAULT_STAGE_ROWS = [
  ["4/17 ステージ1", "4/17 ステージ1", new Date(2027, 3, 17), "11:00〜", "1-132,A-L", ""],
  ["4/17 ステージ2", "4/17 ステージ2", new Date(2027, 3, 17), "11:00〜", "1-132,A-L", ""],
];
const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

// フォームの質問タイトル（フォーム側と完全一致させる）
const QUESTION_NAME = "名前";
const QUESTION_EMAIL = "メールアドレス";
const QUESTION_PEOPLE = "申込人数";
const REQUIRED_QUESTIONS = [QUESTION_NAME, QUESTION_EMAIL, QUESTION_PEOPLE];

const STATUS_ACCEPTED = "受付";
const STATUS_REJECTED = "申込不可";
const STATUS_CANCELLED = "キャンセル";

// 定員の集計に含める状態（「申込不可」などは数えない）
const COUNTED_STATUSES = [STATUS_ACCEPTED];

// 定員に達してフォームを締め切ったときに表示するメッセージ
const CLOSED_FORM_MESSAGE =
  "このステージは定員に達したため、受付を終了しました。";

// 「予約一覧」の列（1始まり）
const COLUMN_RESERVATION_ID = 2; // B列
const COLUMN_STAGE = 3; // C列
const COLUMN_NAME = 4; // D列
const COLUMN_EMAIL = 5; // E列
const COLUMN_PEOPLE = 6; // F列
const COLUMN_STATUS = 7; // G列
const COLUMN_MEMO = 8; // H列
const COLUMN_SOURCE_SHEET = 9; // I列
const COLUMN_SOURCE_ROW = 10; // J列
const COLUMN_COUNT = 10; // フォーム送信時に書き込む列数（A〜J列）
const COLUMN_SEAT = 11; // K列（席番号。手入力）
const COLUMN_SEAT_NOTIFIED = 12; // L列（席番号の通知を送った日時）
const COLUMN_REMINDED = 13; // M列（リマインドを送った日時）

const SEAT_HEADER = "席番号";
const SEAT_NOTIFIED_HEADER = "席番号通知日時";
const REMINDED_HEADER = "リマインド送信日時";
// 席番号の区切りとして認める文字（全角は半角にそろえてから分ける）
const SEAT_SEPARATOR = /[,、\s]+/;
const SEAT_ERROR_COLOR = "#f4cccc";

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

// ===== メール（席番号の通知・リマインド） =====
// 文言はここを書き換える（日時はステージ設定シートから入る）
const EVENT_NAME = "東京キモノショー";
const VENUE_TEXT = "ブルーミング中西ビル";
const MAIL_SENDER_NAME = "東京キモノショー実行委員会";
// 各ステージの開催日の何日前からリマインドを送るか（前日まで毎朝、未送信の人に送る）
const REMINDER_DAYS_BEFORE = 3;
const REMINDER_HOUR = 9; // 9時台に実行される
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== キャンセルフォーム =====
// フォームはメニュー「キャンセルフォームを作成・更新」でコードが作る
const CANCEL_FORM_TITLE = `${EVENT_NAME} キャンセルフォーム`;
const CANCEL_SHEET_NAME = "キャンセル受付"; // キャンセルフォームの回答シート
const CANCEL_LOG_SHEET_NAME = "キャンセル処理結果";
const CANCEL_LOG_HEADERS = [
  "処理日時",
  "キャンセル受付の行",
  "ステージ",
  "メールアドレス",
  "キャンセル人数",
  "結果",
  "予約一覧の行",
  "予約ID",
  "完了メール",
];
const CANCEL_LOG_COLUMN_RESPONSE_ROW = 2; // B列
const CANCEL_LOG_COLUMN_MAIL = 9; // I列
const CANCEL_QUESTION_EMAIL = "メールアドレス";
const CANCEL_QUESTION_STAGE = "ステージ";
const CANCEL_QUESTION_PEOPLE = "キャンセルする人数";
const CANCEL_FORM_DESCRIPTION =
  "ご予約のときに入力したメールアドレスと、ステージを選んでください。";
const CANCEL_CONFIRMATION_MESSAGE =
  "キャンセルのお申し出を受け付けました。手続きが終わると、確認のメールをお送りします。\nメールが届かない場合は、お手数ですが実行委員会までお問い合わせください。";
// スクリプトプロパティのキー（フォームを作ったときに保存する）
const CANCEL_FORM_ID_KEY = "CANCEL_FORM_ID";
const CANCEL_FORM_URL_KEY = "CANCEL_FORM_URL";

function onReservationSubmit(e) {
  if (!e || !e.range || !e.source) {
    throw new Error("フォーム送信トリガーから実行してください。");
  }

  const spreadsheet = e.source;
  const responseSheet = e.range.getSheet();
  const responseSheetName = responseSheet.getName();

  // フォーム送信トリガーは全フォーム共通のため、キャンセルフォームはここで振り分ける
  if (responseSheetName === CANCEL_SHEET_NAME) {
    onCancelSubmit(e);
    return;
  }

  const stageInfo = loadStages(spreadsheet);
  const stage = stageInfo.byResponseSheet[responseSheetName];

  if (!stage) {
    throw new Error(
      `「${STAGE_SHEET_NAME}」シートに回答シート「${responseSheetName}」の正しい設定がありません。${stageInfo.errors.join(" / ")}`
    );
  }

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

    const reservedPeople = countReservedPeople(existingRows, stage.name);
    const remaining = Math.max(stage.capacity - reservedPeople, 0);

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
      stage.name,
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
    shouldCloseForm = reservedPeople + addedPeople >= stage.capacity;
  } finally {
    lock.releaseLock();
  }

  if (shouldCloseForm) {
    closeForm(responseSheet, stage.name);
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
function countReservedPeople(existingRows, stageName) {
  return existingRows
    .filter(
      (existingRow) =>
        existingRow[COLUMN_STAGE - 1] === stageName &&
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
function closeForm(responseSheet, stageName) {
  try {
    const formUrl = responseSheet.getFormUrl();

    if (!formUrl) {
      console.warn(`${stageName}: 回答シートにフォームがつながっていません。`);
      return;
    }

    const form = FormApp.openByUrl(formUrl);

    if (form.isAcceptingResponses()) {
      form.setCustomClosedFormMessage(CLOSED_FORM_MESSAGE);
      form.setAcceptingResponses(false);
      console.log(`${stageName}: 定員に達したためフォームを締め切りました。`);
    }
  } catch (error) {
    console.error(`${stageName}: フォームの締め切りに失敗しました: ${error}`);
  }
}

/**
 * 各ステージの予約人数とフォームの受付状態をログに出す。
 * Apps Script エディタから手動で実行する（フォーム操作の権限承認にも使う）。
 */
function showCapacityStatus() {
  const { spreadsheet, masterSheet } = getMasterSheet();
  const stageInfo = loadStages(spreadsheet);
  const existingRows = getExistingRows(masterSheet);

  stageInfo.errors.forEach((error) => console.warn(error));

  stageInfo.stages.forEach((stage) => {
    const reservedPeople = countReservedPeople(existingRows, stage.name);
    const responseSheet = spreadsheet.getSheetByName(stage.responseSheet);
    const formUrl = responseSheet ? responseSheet.getFormUrl() : null;
    const accepting = formUrl
      ? FormApp.openByUrl(formUrl).isAcceptingResponses()
      : null;
    const formState =
      accepting === null ? "フォーム未接続" : accepting ? "受付中" : "締切";

    console.log(
      `${stage.name}: ${reservedPeople}/${stage.capacity}名（${formState}）`
    );
  });
}

// ===== ステージ設定の読み込み =====

/**
 * 「ステージ設定」シートが無ければ、見出しと初期の行を入れて作る。
 */
function ensureStageSheet(spreadsheet) {
  const existing = spreadsheet.getSheetByName(STAGE_SHEET_NAME);

  if (existing) {
    return existing;
  }

  const activeSheet = spreadsheet.getActiveSheet();
  const sheet = spreadsheet.insertSheet(STAGE_SHEET_NAME, 0);
  const columnCount = STAGE_SHEET_HEADERS.length;

  // 「11:00〜」「1-132」が日付や数値に変換されないよう、時間・座席の列を書式なしテキストにする
  sheet.getRange(2, STAGE_COLUMN_TIME + 1, sheet.getMaxRows() - 1, 2).setNumberFormat("@");
  sheet.getRange(2, STAGE_COLUMN_DATE + 1, sheet.getMaxRows() - 1, 1).setNumberFormat("yyyy/mm/dd");
  sheet.getRange(1, 1, 1, columnCount).setValues([STAGE_SHEET_HEADERS]).setFontWeight("bold");
  sheet
    .getRange(2, 1, DEFAULT_STAGE_ROWS.length, columnCount)
    .setValues(DEFAULT_STAGE_ROWS);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, columnCount, 140);

  if (activeSheet) {
    activeSheet.activate();
  }

  return sheet;
}

/**
 * 「ステージ設定」シートを読み込む。
 * 戻り値: stages（正しく読めたステージ）、errors（問題のある行の説明）、
 *        byResponseSheet（回答シート名 → ステージ）、byName（ステージ名 → ステージ）
 * 問題のある行は stages に含めない（ほかのステージは動き続ける）。
 */
function loadStages(spreadsheet) {
  const sheet = ensureStageSheet(spreadsheet);
  const stages = [];
  const errors = [];
  const lastRow = sheet.getLastRow();
  const columnCount = STAGE_SHEET_HEADERS.length;
  const range =
    lastRow >= 2 ? sheet.getRange(2, 1, lastRow - 1, columnCount) : null;
  const values = range ? range.getValues() : [];
  const displayValues = range ? range.getDisplayValues() : [];

  values.forEach((rowValues, index) => {
    const texts = displayValues[index].map((value) => String(value).trim());

    if (texts.every((text) => text === "")) {
      return;
    }

    const rowErrors = [];
    const responseSheet = texts[STAGE_COLUMN_RESPONSE_SHEET];
    const name = texts[STAGE_COLUMN_NAME] || responseSheet;
    const date = parseStageDate(rowValues[STAGE_COLUMN_DATE]);
    const seatSpec = texts[STAGE_COLUMN_SEATS];
    const parsedSeats = parseSeatSpec(seatSpec);
    let capacity = parsedSeats.seats.length;

    if (responseSheet === "") {
      rowErrors.push("回答シート名が空欄です");
    }

    if (stages.some((stage) => stage.responseSheet === responseSheet)) {
      rowErrors.push(`回答シート名「${responseSheet}」がほかの行と重複しています`);
    }

    if (stages.some((stage) => stage.name === name)) {
      rowErrors.push(`ステージ名「${name}」がほかの行と重複しています`);
    }

    if (!date) {
      rowErrors.push("開催日が日付になっていません");
    }

    if (seatSpec === "") {
      rowErrors.push("座席が空欄です");
    }

    rowErrors.push(...parsedSeats.errors);

    if (texts[STAGE_COLUMN_CAPACITY] !== "") {
      const customCapacity = parsePeopleCount(texts[STAGE_COLUMN_CAPACITY]);

      if (customCapacity === null) {
        rowErrors.push("定員が正の整数ではありません");
      } else if (customCapacity > parsedSeats.seats.length) {
        rowErrors.push(`定員が席数（${parsedSeats.seats.length}席）より多くなっています`);
      } else {
        capacity = customCapacity;
      }
    }

    if (rowErrors.length > 0) {
      errors.push(`${STAGE_SHEET_NAME} ${index + 2}行目: ${rowErrors.join("、")}`);
      return;
    }

    const weekday = WEEKDAYS[Number(Utilities.formatDate(date, TIME_ZONE, "u")) - 1];
    const reminderDate = new Date(
      date.getTime() - REMINDER_DAYS_BEFORE * 24 * 60 * 60 * 1000
    );

    stages.push({
      responseSheet,
      name,
      dateKey: Utilities.formatDate(date, TIME_ZONE, "yyyy-MM-dd"),
      reminderKey: Utilities.formatDate(reminderDate, TIME_ZONE, "yyyy-MM-dd"),
      dateText: `${Utilities.formatDate(date, TIME_ZONE, "yyyy年M月d日")}（${weekday}）`,
      time: texts[STAGE_COLUMN_TIME],
      seatSpec,
      seats: parsedSeats.seats,
      seatSet: new Set(parsedSeats.seats),
      capacity,
    });
  });

  return {
    stages,
    errors,
    byResponseSheet: Object.fromEntries(
      stages.map((stage) => [stage.responseSheet, stage])
    ),
    byName: Object.fromEntries(stages.map((stage) => [stage.name, stage])),
  };
}

/**
 * 開催日のセルの値を日付にする。日付でなければ null を返す。
 */
function parseStageDate(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return isNaN(value.getTime()) ? null : value;
  }

  const match = String(value).trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);

  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : null;
}

/**
 * 全角の英数字・記号を半角にし、英字を大文字にする（「ａ」「Ａ」「１」→「A」「A」「1」）。
 */
function normalizeSeatText(text) {
  return String(text)
    .replace(/[０-９Ａ-Ｚａ-ｚ]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    .replace(/[，]/g, ",")
    .replace(/[－ー―‐〜～~]/g, "-")
    .toUpperCase();
}

/**
 * 1つの席番号をそろえる（「01」→「1」）。
 */
function normalizeSeatId(token) {
  return /^\d+$/.test(token) ? String(Number(token)) : token;
}

/**
 * 「1-132,A-L」のような座席の書き方を、席番号の配列にする。
 * 書ける形: 数字の範囲（1-132）、英字1文字の範囲（A-L）、単独の数字・英字。カンマ区切り。
 */
function parseSeatSpec(spec) {
  const seats = [];
  const errors = [];
  const maxSeats = 10000;

  normalizeSeatText(spec)
    .split(SEAT_SEPARATOR)
    .filter((part) => part !== "")
    .forEach((part) => {
      const numberRange = part.match(/^(\d+)-(\d+)$/);
      const letterRange = part.match(/^([A-Z])-([A-Z])$/);
      const added = [];

      if (numberRange) {
        const first = Number(numberRange[1]);
        const last = Number(numberRange[2]);

        if (first < 1 || last < first || last - first >= maxSeats) {
          errors.push(`座席「${part}」の範囲が正しくありません`);
          return;
        }

        for (let seat = first; seat <= last; seat++) {
          added.push(String(seat));
        }
      } else if (letterRange) {
        const first = letterRange[1].charCodeAt(0);
        const last = letterRange[2].charCodeAt(0);

        if (last < first) {
          errors.push(`座席「${part}」の範囲が正しくありません`);
          return;
        }

        for (let code = first; code <= last; code++) {
          added.push(String.fromCharCode(code));
        }
      } else if (/^\d+$/.test(part) && Number(part) >= 1) {
        added.push(normalizeSeatId(part));
      } else if (/^[A-Z]$/.test(part)) {
        added.push(part);
      } else {
        errors.push(`座席「${part}」の書き方が正しくありません（例: 1-132,A-L）`);
        return;
      }

      added.forEach((seat) => {
        if (seats.includes(seat)) {
          errors.push(`座席の${seat}番が2回書かれています`);
        } else {
          seats.push(seat);
        }
      });
    });

  return { seats, errors: [...new Set(errors)] };
}

// ===== メニュー・席番号チェック =====

/**
 * スプレッドシートを開いたときにメニューを追加し、席番号の列を書式なしテキストにする。
 * （シンプルトリガーのため設定不要）
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("予約管理")
    .addItem("席番号をチェック・座席表を更新", "checkAllSeats")
    .addItem("定員の状況をログに出す", "showCapacityStatus")
    .addSeparator()
    .addItem("席番号の通知メールを送る", "sendSeatNotices")
    .addItem("テストメールを自分に送る", "sendTestMails")
    .addItem("リマインドの自動送信を設定", "setupReminderTrigger")
    .addSeparator()
    .addItem("キャンセルフォームを作成・更新", "setupCancelForm")
    .addSeparator()
    .addItem("ステージごとのCSVをダウンロード", "showCsvDialog")
    .addSeparator()
    .addItem("使い方シートを作り直す", "rebuildUsageSheet")
    .addToUi();

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = spreadsheet.getSheetByName(MASTER_SHEET_NAME);

  ensureStageSheet(spreadsheet);

  if (!spreadsheet.getSheetByName(USAGE_SHEET_NAME)) {
    writeUsageSheet(spreadsheet);
  }

  if (masterSheet) {
    prepareSeatColumn(masterSheet);
  }
}

/**
 * 「予約一覧」の席番号に関わるセル、または「ステージ設定」が編集されたら、席番号をチェックする。
 * （シンプルトリガーのため設定不要）
 */
function onEdit(e) {
  if (!e || !e.range) {
    return;
  }

  const sheetName = e.range.getSheet().getName();

  if (sheetName === MASTER_SHEET_NAME) {
    if (e.range.getLastRow() < 2) {
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
  } else if (sheetName !== STAGE_SHEET_NAME) {
    return;
  }

  const { stageInfo, result } = refreshSeats(e.source);
  const messages = [];

  if (stageInfo.errors.length > 0) {
    messages.push(`ステージ設定に問題が${stageInfo.errors.length}件あります。メニュー「席番号をチェック・座席表を更新」で内容を確認してください。`);
  }

  if (result.errorCount > 0) {
    messages.push(`問題のある席番号が${result.errorCount}件あります。赤いセルのメモを確認してください。`);
  }

  if (messages.length > 0) {
    e.source.toast(messages.join("\n"), "席番号チェック", 8);
  }
}

/**
 * メニューから全件の席番号をチェックする（行の削除後などに使う）。
 */
function checkAllSeats() {
  const { spreadsheet, masterSheet } = getMasterSheet();

  prepareSeatColumn(masterSheet);
  const { stageInfo, result } = refreshSeats(spreadsheet);

  if (stageInfo.errors.length > 0) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      "ステージ設定に問題があります",
      `次の行は使われません（そのステージの予約受付も止まります）。\n\n${stageInfo.errors.join("\n")}`,
      ui.ButtonSet.OK
    );
  }

  const message =
    result.errorCount > 0
      ? `問題のある席番号が${result.errorCount}件あります。赤いセルのメモを確認してください。`
      : "席番号に問題はありません。";

  spreadsheet.toast(message, "席番号チェック", 5);
}

/**
 * ステージ設定を読み、席番号をチェックして、座席表を作り直す。
 */
function refreshSeats(spreadsheet) {
  const masterSheet = spreadsheet.getSheetByName(MASTER_SHEET_NAME);

  if (!masterSheet) {
    throw new Error(`「${MASTER_SHEET_NAME}」シートが見つかりません。`);
  }

  const stageInfo = loadStages(spreadsheet);
  const result = validateSeats(masterSheet, stageInfo);
  updateSeatMaps(spreadsheet, result, stageInfo);

  return { stageInfo, result };
}

/**
 * 席番号・メール送信日時の列に見出しを付け、席番号の列は「1,2」が数値に変換されないよう書式なしテキストにする。
 */
function prepareSeatColumn(masterSheet) {
  const maxColumns = masterSheet.getMaxColumns();

  if (maxColumns < COLUMN_REMINDED) {
    masterSheet.insertColumnsAfter(maxColumns, COLUMN_REMINDED - maxColumns);
  }

  [
    [COLUMN_SEAT, SEAT_HEADER],
    [COLUMN_SEAT_NOTIFIED, SEAT_NOTIFIED_HEADER],
    [COLUMN_REMINDED, REMINDED_HEADER],
  ].forEach(([column, title]) => {
    const header = masterSheet.getRange(1, column);

    if (header.getDisplayValue() === "") {
      header.setValue(title);
    }
  });

  masterSheet
    .getRange(2, COLUMN_SEAT, masterSheet.getMaxRows() - 1, 1)
    .setNumberFormat("@");
}

/**
 * 「予約一覧」の全行の席番号をチェックし、問題のあるセルを赤くしてメモに理由を書く。
 * 問題がなくなったセルは色とメモを消す。
 * 戻り値: errorCount（問題のあるセルの数）、rows（予約一覧の値）、
 *        errorsByRow（行ごとの問題）、rowErrorCounts（重複以外の問題の数）、
 *        seatsByRow（行ごとの席番号）、seatOwners（ステージ名 → 席番号 → 行の位置の配列）
 */
function validateSeats(masterSheet, stageInfo) {
  const lastRow = masterSheet.getLastRow();

  if (lastRow < 2) {
    return {
      errorCount: 0,
      rows: [],
      errorsByRow: [],
      rowErrorCounts: [],
      seatsByRow: [],
      seatOwners: {},
    };
  }

  const rows = masterSheet
    .getRange(2, 1, lastRow - 1, COLUMN_SEAT)
    .getDisplayValues();
  const errorsByRow = rows.map(() => []);
  const seatsByRow = rows.map(() => []);
  // ステージ名 → 席番号 → その席番号を持つ行の位置
  const seatOwners = {};

  rows.forEach((rowValues, index) => {
    const seatText = normalizeSeatText(rowValues[COLUMN_SEAT - 1]).trim();

    if (seatText === "") {
      return;
    }

    const errors = errorsByRow[index];
    const stageName = rowValues[COLUMN_STAGE - 1];
    const stage = stageInfo.byName[stageName];
    const status = rowValues[COLUMN_STATUS - 1];
    const seats = seatsByRow[index];

    if (!stage) {
      errors.push(`ステージ「${stageName}」が「${STAGE_SHEET_NAME}」にありません（または設定に問題があります）`);
    } else {
      seatText
        .split(SEAT_SEPARATOR)
        .filter((token) => token !== "")
        .forEach((token) => {
          const seat = normalizeSeatId(token);

          if (!stage.seatSet.has(seat)) {
            errors.push(`「${token}」は${stage.name}の席番号ではありません（座席: ${stage.seatSpec}）`);
          } else if (seats.includes(seat)) {
            errors.push(`${seat}番が同じセルに2回入っています`);
          } else {
            seats.push(seat);
          }
        });
    }

    if (status !== STATUS_ACCEPTED) {
      errors.push(`状態が「${status}」の申込に席番号が入っています`);
    }

    const people = parsePeopleCount(rowValues[COLUMN_PEOPLE - 1]);

    if (stage && people !== null && seats.length !== people) {
      errors.push(`申込人数は${people}名ですが、席番号は${seats.length}個です`);
    }

    if (stage) {
      seatOwners[stage.name] = seatOwners[stage.name] || {};
      seats.forEach((seat) => {
        seatOwners[stage.name][seat] = seatOwners[stage.name][seat] || [];
        seatOwners[stage.name][seat].push(index);
      });
      seats.sort((a, b) => stage.seats.indexOf(a) - stage.seats.indexOf(b));
    }
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
    seatsByRow,
    seatOwners,
  };
}

// ===== 座席表 =====

/**
 * ステージごとの「座席表」シートを作り直す（なければ作成する）。
 * 緑 = 割当済み、赤 = 要確認（重複・人数違いなど）、白 = 空席。
 */
function updateSeatMaps(spreadsheet, result, stageInfo) {
  const activeSheet = spreadsheet.getActiveSheet();
  let createdSheet = false;

  stageInfo.stages.forEach((stage) => {
    const sheetName = `${SEAT_MAP_SHEET_PREFIX}${stage.name}`;
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
 * 1ステージ分の座席表を書き込む。数字の席を先に並べ、英字の席は1行あけて下に並べる。
 */
function writeSeatMap(sheet, stage, result) {
  const owners = result.seatOwners[stage.name] || {};
  const blocks = [
    stage.seats.filter((seat) => /^\d+$/.test(seat)),
    stage.seats.filter((seat) => !/^\d+$/.test(seat)),
  ].filter((block) => block.length > 0);
  let assignedCount = 0;
  let problemCount = 0;

  const blockGrids = blocks.map((block) => {
    const values = [];
    const backgrounds = [];

    for (let start = 0; start < block.length; start += SEAT_MAP_COLUMNS) {
      const valueRow = [];
      const backgroundRow = [];

      for (let offset = 0; offset < SEAT_MAP_COLUMNS; offset++) {
        const seat = block[start + offset];

        if (seat === undefined) {
          valueRow.push("");
          backgroundRow.push(null);
          continue;
        }

        const indexes = owners[seat] || [];

        if (indexes.length === 0) {
          valueRow.push(seat);
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

    return { values, backgrounds };
  });

  const seatCount = stage.seats.length;
  const updatedAt = Utilities.formatDate(
    new Date(),
    TIME_ZONE,
    "yyyy/MM/dd HH:mm:ss"
  );

  sheet.clear();
  sheet
    .getRange(1, 1, 3, 1)
    .setValues([
      [`${stage.name}（${stage.dateText} ${stage.time}）座席表（見る専用・自動更新）`],
      [
        `割当済み ${assignedCount}/${seatCount}席　空き ${seatCount - assignedCount}席　要確認 ${problemCount}席　（更新: ${updatedAt}）`,
      ],
      ["緑 = 割当済み　赤 = 要確認（予約一覧の赤いセルを確認）　白 = 空席"],
    ]);
  sheet.getRange(1, 1).setFontWeight("bold").setFontSize(14);

  let row = SEAT_MAP_FIRST_ROW;

  blockGrids.forEach(({ values, backgrounds }) => {
    sheet
      .getRange(row, 1, values.length, SEAT_MAP_COLUMNS)
      .setValues(values)
      .setBackgrounds(backgrounds)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setWrap(true)
      .setBorder(true, true, true, true, true, true);
    sheet.setRowHeights(row, values.length, 45);
    // ブロックの間は1行あける
    row += values.length + 1;
  });

  sheet.setColumnWidths(1, SEAT_MAP_COLUMNS, 90);
}

// ===== メール（席番号の通知・リマインド） =====

/**
 * メニューから実行: 席番号が入っていて、まだ通知していない「受付」の人に席番号を知らせる。
 */
function sendSeatNotices() {
  const ui = SpreadsheetApp.getUi();
  const { spreadsheet, masterSheet } = getMasterSheet();

  prepareSeatColumn(masterSheet);
  const { stageInfo, result } = refreshSeats(spreadsheet);

  const { targets, skipped } = collectMailTargets(
    masterSheet,
    result,
    stageInfo,
    COLUMN_SEAT_NOTIFIED,
    { requireSeats: true, stageFilter: () => true }
  );
  const skippedText = formatSkipped(skipped);

  if (targets.length === 0) {
    ui.alert("席番号の通知", `送る相手がいません。${skippedText}`, ui.ButtonSet.OK);
    return;
  }

  const quota = MailApp.getRemainingDailyQuota();
  const quotaText =
    targets.length > quota
      ? `\n※今日送れるのは残り${quota}通です。残りは明日以降にもう一度実行してください。`
      : "";
  const answer = ui.alert(
    "席番号の通知",
    `${targets.length}件に席番号の通知メールを送ります。よろしいですか？${skippedText}${quotaText}`,
    ui.ButtonSet.OK_CANCEL
  );

  if (answer !== ui.Button.OK) {
    return;
  }

  const outcome = sendMailsWithLock(
    masterSheet,
    targets,
    COLUMN_SEAT_NOTIFIED,
    buildSeatNoticeMail
  );

  if (outcome === null) {
    ui.alert("席番号の通知", "ほかのメール送信が実行中です。少し待ってからやり直してください。", ui.ButtonSet.OK);
    return;
  }

  ui.alert("席番号の通知", formatOutcome(outcome), ui.ButtonSet.OK);
}

/**
 * 時間主導トリガーから実行: 開催日の REMINDER_DAYS_BEFORE 日前〜前日のステージについて、
 * まだリマインドしていない「受付」の人に送る。全ステージの開催日を過ぎたら自分のトリガーを削除する。
 */
function sendReminders() {
  const today = Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd");
  const { spreadsheet, masterSheet } = getMasterSheet();
  const stageInfo = loadStages(spreadsheet);
  const lastDateKey = stageInfo.stages
    .map((stage) => stage.dateKey)
    .sort()
    .pop();

  if (lastDateKey && today >= lastDateKey) {
    deleteReminderTriggers();
    console.log("最後のステージの開催日になったため、リマインドの自動送信を終了しました。");
    return;
  }

  const activeStageNames = stageInfo.stages
    .filter((stage) => stage.reminderKey <= today && today < stage.dateKey)
    .map((stage) => stage.name);

  if (activeStageNames.length === 0) {
    return;
  }

  const result = validateSeats(masterSheet, stageInfo);
  updateSeatMaps(spreadsheet, result, stageInfo);

  const { targets, skipped } = collectMailTargets(
    masterSheet,
    result,
    stageInfo,
    COLUMN_REMINDED,
    {
      requireSeats: false,
      stageFilter: (stage) => activeStageNames.includes(stage.name),
    }
  );

  if (targets.length === 0 && Object.keys(skipped).length === 0) {
    return;
  }

  const outcome = sendMailsWithLock(
    masterSheet,
    targets,
    COLUMN_REMINDED,
    buildReminderMail
  );

  if (outcome === null) {
    console.warn("ほかのメール送信が実行中のため、リマインドは明日に回します。");
    return;
  }

  const settingErrors =
    stageInfo.errors.length > 0
      ? `\n\nステージ設定の問題（この行のステージには送っていません）:\n${stageInfo.errors.join("\n")}`
      : "";
  const summary = `対象: ${activeStageNames.join("、")}\n${formatOutcome(outcome)}${formatSkipped(skipped)}${settingErrors}`;
  console.log(`リマインド: ${summary}`);

  // 実行したアカウントに結果を知らせる（未送信がある場合に気づけるように）
  if (MailApp.getRemainingDailyQuota() < 1) {
    return;
  }

  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: `【${EVENT_NAME}】リマインド送信結果 ${today}`,
    body: `リマインドの送信結果です。\n\n${summary}\n\n送れなかった分は、直してから翌朝に自動で送られます（各ステージの開催日の前日まで）。\n${spreadsheet.getUrl()}`,
    name: MAIL_SENDER_NAME,
  });
}

/**
 * メニューから実行: 通知とリマインドの見本を、実行したアカウント宛てに送る。
 */
function sendTestMails() {
  const ui = SpreadsheetApp.getUi();
  const stageInfo = loadStages(SpreadsheetApp.getActiveSpreadsheet());
  const stage = stageInfo.stages[0];

  if (!stage) {
    ui.alert("テストメール", `「${STAGE_SHEET_NAME}」に正しく設定されたステージがありません。`, ui.ButtonSet.OK);
    return;
  }

  const to = Session.getEffectiveUser().getEmail();
  const sample = {
    name: "テスト 太郎",
    email: to,
    stage,
    people: 2,
    seatsText: formatSeats(stage.seats.slice(0, 2)),
    reservationId: "TK-TEST",
  };

  [buildSeatNoticeMail(sample), buildReminderMail(sample)].forEach((mail) => {
    MailApp.sendEmail({
      to,
      subject: `[テスト] ${mail.subject}`,
      body: mail.body,
      name: MAIL_SENDER_NAME,
    });
  });

  ui.alert("テストメール", `${to} に見本を2通送りました。`, ui.ButtonSet.OK);
}

/**
 * メニューから実行: 毎朝リマインドを確認するトリガーを作る（既存のものは作り直す）。
 * メールは、これを実行したアカウントから送られる。
 */
function setupReminderTrigger() {
  const ui = SpreadsheetApp.getUi();

  deleteReminderTriggers();
  ScriptApp.newTrigger("sendReminders")
    .timeBased()
    .everyDays(1)
    .atHour(REMINDER_HOUR)
    .create();

  ui.alert(
    "リマインドの自動送信",
    `設定しました。各ステージの開催日の${REMINDER_DAYS_BEFORE}日前から前日まで、毎日${REMINDER_HOUR}時台に未送信の人へ送ります。\n送信元: ${Session.getEffectiveUser().getEmail()}`,
    ui.ButtonSet.OK
  );
}

function deleteReminderTriggers() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "sendReminders")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
}

function getMasterSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = spreadsheet.getSheetByName(MASTER_SHEET_NAME);

  if (!masterSheet) {
    throw new Error(`「${MASTER_SHEET_NAME}」シートが見つかりません。`);
  }

  return { spreadsheet, masterSheet };
}

/**
 * メールを送る相手を集める。
 * requireSeats が true なら席番号の入力が必要（通知用）。false なら未入力でも送る（リマインド用）。
 * stageFilter が false を返すステージの行は対象外。席番号に問題がある行は、直すまで送らない。
 */
function collectMailTargets(masterSheet, result, stageInfo, sentColumn, options) {
  const targets = [];
  const skipped = {};
  const skip = (reason) => {
    skipped[reason] = (skipped[reason] || 0) + 1;
  };

  if (result.rows.length === 0) {
    return { targets, skipped };
  }

  const sentValues = masterSheet
    .getRange(2, sentColumn, result.rows.length, 1)
    .getDisplayValues();

  result.rows.forEach((rowValues, index) => {
    if (rowValues[COLUMN_STATUS - 1] !== STATUS_ACCEPTED) {
      return;
    }

    if (sentValues[index][0].trim() !== "") {
      return;
    }

    const stage = stageInfo.byName[rowValues[COLUMN_STAGE - 1]];

    if (!stage) {
      skip("ステージがステージ設定にない（または設定に問題あり）");
      return;
    }

    if (!options.stageFilter(stage)) {
      return;
    }

    if (options.requireSeats && rowValues[COLUMN_SEAT - 1].trim() === "") {
      skip("席番号が未入力");
      return;
    }

    if (result.errorsByRow[index].length > 0) {
      skip("席番号に問題あり（赤いセル）");
      return;
    }

    const email = rowValues[COLUMN_EMAIL - 1].trim();

    if (!EMAIL_PATTERN.test(email)) {
      skip("メールアドレスが正しくない");
      return;
    }

    targets.push({
      rowNumber: index + 2,
      name: rowValues[COLUMN_NAME - 1].trim(),
      email,
      stage,
      people: rowValues[COLUMN_PEOPLE - 1],
      seatsText: formatSeats(result.seatsByRow[index]),
      reservationId: rowValues[COLUMN_RESERVATION_ID - 1],
    });
  });

  return { targets, skipped };
}

/**
 * 1件ずつ送り、送れたら送信日時を記録する（途中で止まっても二重に送らない）。
 * ほかの送信が実行中なら null を返す。
 * フォーム送信のロックとは別のロックを使い、送信中も予約の受付を止めない。
 */
function sendMailsWithLock(masterSheet, targets, sentColumn, buildMail) {
  const lock = LockService.getDocumentLock();

  if (!lock.tryLock(1000)) {
    return null;
  }

  const outcome = { sent: 0, failed: 0, notSent: 0 };

  try {
    targets.forEach((target) => {
      if (MailApp.getRemainingDailyQuota() < 1) {
        outcome.notSent++;
        return;
      }

      try {
        const mail = buildMail(target);
        MailApp.sendEmail({
          to: target.email,
          subject: mail.subject,
          body: mail.body,
          name: MAIL_SENDER_NAME,
        });
        masterSheet.getRange(target.rowNumber, sentColumn).setValue(new Date());
        SpreadsheetApp.flush();
        outcome.sent++;
      } catch (error) {
        // 個人情報は出さず、行番号だけを記録する
        console.error(`${target.rowNumber}行目: メール送信に失敗しました: ${error}`);
        outcome.failed++;
      }
    });
  } finally {
    lock.releaseLock();
  }

  return outcome;
}

/**
 * 席番号の配列（並べ替え済み）を「1番、2番、A番」の形にする。
 */
function formatSeats(seats) {
  return seats.map((seat) => `${seat}番`).join("、");
}

function formatOutcome(outcome) {
  const lines = [`送信: ${outcome.sent}件`];

  if (outcome.failed > 0) {
    lines.push(`失敗: ${outcome.failed}件（実行ログを確認してください）`);
  }

  if (outcome.notSent > 0) {
    lines.push(`送信上限のため未送信: ${outcome.notSent}件`);
  }

  return lines.join("\n");
}

function formatSkipped(skipped) {
  const entries = Object.entries(skipped);

  if (entries.length === 0) {
    return "";
  }

  return `\n\n送らない人:\n${entries
    .map(([reason, count]) => `・${reason}: ${count}件`)
    .join("\n")}`;
}

function buildEventLines(target) {
  return [
    `■ ステージ: ${target.stage.name}`,
    `■ 日時: ${target.stage.dateText} ${target.stage.time}`,
    `■ 会場: ${VENUE_TEXT}`,
    `■ 人数: ${target.people}名`,
    `■ 席番号: ${target.seatsText || "当日受付でご案内します"}`,
    `■ 予約ID: ${target.reservationId}`,
  ].join("\n");
}

function buildMailFooter() {
  const cancelLines = ["キャンセルの場合は、キャンセルフォームからお手続きください。"];
  const cancelFormUrl = getCancelFormUrl();

  if (cancelFormUrl) {
    cancelLines.push(cancelFormUrl);
  }

  return `${cancelLines.join("\n")}\n\n${MAIL_SENDER_NAME}`;
}

function buildSeatNoticeMail(target) {
  return {
    subject: `【${EVENT_NAME}】席番号のお知らせ（${target.stage.name}）`,
    body: [
      `${target.name} 様`,
      "",
      `${EVENT_NAME}にお申し込みいただき、ありがとうございます。`,
      "お席が決まりましたので、お知らせします。",
      "",
      buildEventLines(target),
      "",
      "当日のご来場を心よりお待ちしております。",
      "",
      buildMailFooter(),
    ].join("\n"),
  };
}

function buildReminderMail(target) {
  return {
    subject: `【${EVENT_NAME}】ご来場のご案内（${target.stage.name}）`,
    body: [
      `${target.name} 様`,
      "",
      `${EVENT_NAME}の開催日が近づいてまいりましたので、ご案内いたします。`,
      "",
      buildEventLines(target),
      "",
      "皆さまのご来場を心よりお待ちしております。",
      "",
      buildMailFooter(),
    ].join("\n"),
  };
}

// ===== キャンセル =====

/**
 * メニューから実行: キャンセルフォームを作る（作成済みなら、ステージの選択肢を「ステージ設定」に合わせて更新する）。
 * フォームは実行したアカウントのドライブに作られ、回答先はこのスプレッドシートの「キャンセル受付」シートになる。
 */
function setupCancelForm() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const stageInfo = loadStages(spreadsheet);
  const stageNames = stageInfo.stages.map((stage) => stage.name);

  if (stageNames.length === 0) {
    ui.alert("キャンセルフォーム", `「${STAGE_SHEET_NAME}」に正しく設定されたステージがありません。`, ui.ButtonSet.OK);
    return;
  }

  const properties = PropertiesService.getScriptProperties();
  const savedFormId = properties.getProperty(CANCEL_FORM_ID_KEY);
  let form = null;

  if (savedFormId) {
    try {
      form = FormApp.openById(savedFormId);
    } catch (error) {
      const answer = ui.alert(
        "キャンセルフォーム",
        `作成済みのキャンセルフォームを開けません（削除された、または今のアカウントに編集権限がない）。\n新しいキャンセルフォームを作りますか？\n\n${error}`,
        ui.ButtonSet.OK_CANCEL
      );

      if (answer !== ui.Button.OK) {
        return;
      }
    }
  }

  const isNew = !form;

  if (isNew) {
    form = createCancelForm(spreadsheet);
  }

  const stageItem = form
    .getItems(FormApp.ItemType.LIST)
    .find((item) => item.getTitle() === CANCEL_QUESTION_STAGE);

  if (!stageItem) {
    throw new Error(`キャンセルフォームに「${CANCEL_QUESTION_STAGE}」の質問（プルダウン）がありません。`);
  }

  stageItem.asListItem().setChoiceValues(stageNames);

  let url = form.getPublishedUrl();

  try {
    url = form.shortenFormUrl(url);
  } catch (error) {
    console.warn(`フォームの短縮URLを作れませんでした: ${error}`);
  }

  properties.setProperty(CANCEL_FORM_URL_KEY, url);
  ensureCancelLogSheet(spreadsheet);

  const errorsText =
    stageInfo.errors.length > 0
      ? `\n\n次の行は設定に問題があるため、選択肢に入れていません。\n${stageInfo.errors.join("\n")}`
      : "";

  ui.alert(
    "キャンセルフォーム",
    `${isNew ? "キャンセルフォームを作りました。" : "ステージの選択肢を更新しました。"}\n\nURL（メールに自動で載ります）:\n${url}\n\nステージ: ${stageNames.join("、")}\n\nステージ設定を変えたら、もう一度このメニューを実行してください。${errorsText}`,
    ui.ButtonSet.OK
  );
}

/**
 * キャンセルフォームを新しく作り、回答シートを「キャンセル受付」にする。
 */
function createCancelForm(spreadsheet) {
  const form = FormApp.create(CANCEL_FORM_TITLE);

  form
    .setDescription(CANCEL_FORM_DESCRIPTION)
    .setConfirmationMessage(CANCEL_CONFIRMATION_MESSAGE)
    .setAllowResponseEdits(false);
  form
    .addTextItem()
    .setTitle(CANCEL_QUESTION_EMAIL)
    .setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  form
    .addListItem()
    .setTitle(CANCEL_QUESTION_STAGE)
    .setRequired(true)
    .setChoiceValues(["（準備中）"]);
  form
    .addTextItem()
    .setTitle(CANCEL_QUESTION_PEOPLE)
    .setHelpText("全員キャンセルする場合は、申し込んだ人数を入力してください。")
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .setHelpText("数字で入力してください。")
        .requireWholeNumber()
        .build()
    );

  // 途中で失敗しても作ったフォームを見失わないよう、先に保存する
  PropertiesService.getScriptProperties().setProperty(CANCEL_FORM_ID_KEY, form.getId());

  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  SpreadsheetApp.flush();

  // 回答先にした直後のシートは、開き直さないと見えないことがある
  const refreshed = SpreadsheetApp.openById(spreadsheet.getId());
  const oldSheet = refreshed.getSheetByName(CANCEL_SHEET_NAME);

  if (oldSheet) {
    // 前のキャンセルフォームの回答シートは残し、名前だけ変える（このシートへの回答は処理されなくなる）
    oldSheet.setName(
      `${CANCEL_SHEET_NAME}（旧 ${Utilities.formatDate(new Date(), TIME_ZONE, "yyyyMMdd-HHmm")}）`
    );
  }

  const responseSheet = refreshed.getSheets().find((sheet) => {
    const formUrl = sheet.getFormUrl();

    if (!formUrl) {
      return false;
    }

    try {
      return FormApp.openByUrl(formUrl).getId() === form.getId();
    } catch (error) {
      return false;
    }
  });

  if (!responseSheet) {
    throw new Error(`キャンセルフォームは作りましたが、回答シートが見つかりません。新しくできた「フォームの回答」シートのタブ名を「${CANCEL_SHEET_NAME}」に変えてください。`);
  }

  responseSheet.setName(CANCEL_SHEET_NAME);
  return form;
}

/**
 * 「キャンセル処理結果」シートが無ければ作る。
 */
function ensureCancelLogSheet(spreadsheet) {
  const existing = spreadsheet.getSheetByName(CANCEL_LOG_SHEET_NAME);

  if (existing) {
    return existing;
  }

  const sheet = spreadsheet.insertSheet(CANCEL_LOG_SHEET_NAME, spreadsheet.getNumSheets());
  sheet
    .getRange(1, 1, 1, CANCEL_LOG_HEADERS.length)
    .setValues([CANCEL_LOG_HEADERS])
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
  return sheet;
}

function getCancelFormUrl() {
  return PropertiesService.getScriptProperties().getProperty(CANCEL_FORM_URL_KEY) || "";
}

/**
 * キャンセルフォームの送信時（onReservationSubmit から呼ばれる）。
 * メールアドレスとステージが一致する「受付」の予約が1件だけなら、自動でキャンセルし、完了メールを送る。
 * 自動で処理できないときは予約一覧を変えず、実行したアカウント（トリガーを作った人）に知らせる。
 */
function onCancelSubmit(e) {
  const spreadsheet = e.source;
  const responseRow = e.range.getRow();
  const answer = (questionTitle) =>
    (e.namedValues[questionTitle] || [""])[0].trim();
  const request = {
    email: answer(CANCEL_QUESTION_EMAIL),
    stageName: answer(CANCEL_QUESTION_STAGE),
    cancelText: answer(CANCEL_QUESTION_PEOPLE),
  };
  const masterSheet = spreadsheet.getSheetByName(MASTER_SHEET_NAME);

  if (!masterSheet) {
    throw new Error(`「${MASTER_SHEET_NAME}」シートが見つかりません。`);
  }

  const logSheet = ensureCancelLogSheet(spreadsheet);
  const lock = LockService.getScriptLock();
  lock.waitLock(LOCK_TIMEOUT_MS);

  let outcome;
  let logRow;

  try {
    // 同じ回答を二重に処理しないための確認
    const processedRows =
      logSheet.getLastRow() >= 2
        ? logSheet
            .getRange(2, CANCEL_LOG_COLUMN_RESPONSE_ROW, logSheet.getLastRow() - 1, 1)
            .getValues()
            .map((row) => Number(row[0]))
        : [];

    if (processedRows.includes(responseRow)) {
      return;
    }

    outcome = applyCancel(masterSheet, request);
    logSheet.appendRow([
      new Date(),
      responseRow,
      request.stageName,
      request.email,
      request.cancelText,
      outcome.ok ? outcome.resultText : `自動で処理できません: ${outcome.reason}`,
      outcome.rowNumber || "",
      outcome.reservationId || "",
      "",
    ]);
    logRow = logSheet.getLastRow();
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  // 個人情報は出さず、行番号と結果だけを記録する
  console.log(`${CANCEL_SHEET_NAME} ${responseRow}行目: ${outcome.ok ? outcome.resultText : outcome.reason}`);

  const stageInfo = loadStages(spreadsheet);

  if (outcome.ok) {
    const mailCell = logSheet.getRange(logRow, CANCEL_LOG_COLUMN_MAIL);

    if (!EMAIL_PATTERN.test(outcome.email)) {
      mailCell.setValue("未送信（予約のメールアドレスが正しくない）");
    } else if (MailApp.getRemainingDailyQuota() < 1) {
      mailCell.setValue("未送信（今日の送信上限）");
    } else {
      try {
        const mail = buildCancelMail(outcome, stageInfo.byName[outcome.stageName]);
        MailApp.sendEmail({
          to: outcome.email,
          subject: mail.subject,
          body: mail.body,
          name: MAIL_SENDER_NAME,
        });
        mailCell.setValue(new Date());
      } catch (error) {
        console.error(`${CANCEL_SHEET_NAME} ${responseRow}行目: 完了メールの送信に失敗しました: ${error}`);
        mailCell.setValue("送信失敗（実行ログを確認）");
      }
    }
  } else {
    notifyCancelProblem(spreadsheet, responseRow, outcome.reason);
  }

  // 席番号のチェックと座席表を最新にする（失敗してもキャンセル自体は済んでいる）
  try {
    refreshSeats(spreadsheet);
  } catch (error) {
    console.error(`キャンセル後の座席表の更新に失敗しました: ${error}`);
  }
}

/**
 * 予約一覧でキャンセルを反映する。
 * 全員分: 状態を「キャンセル」にし、席番号を空ける（元の席番号はメモに残す）。
 * 一部: 申込人数を減らす。席番号が入っていれば、人数と合わなくなるので赤く警告され、スタッフが選び直す。
 */
function applyCancel(masterSheet, request) {
  const fail = (reason) => ({ ok: false, reason });
  const cancelCount = parsePeopleCount(request.cancelText);

  if (cancelCount === null) {
    return fail("キャンセルする人数が正の整数ではありません");
  }

  const lastRow = masterSheet.getLastRow();

  if (lastRow < 2) {
    return fail("予約がありません");
  }

  const rows = masterSheet
    .getRange(2, 1, lastRow - 1, COLUMN_SEAT)
    .getDisplayValues();
  const email = request.email.toLowerCase();
  const matches = rows
    .map((rowValues, index) => ({ rowValues, rowNumber: index + 2 }))
    .filter(
      ({ rowValues }) =>
        rowValues[COLUMN_STAGE - 1] === request.stageName &&
        rowValues[COLUMN_EMAIL - 1].trim().toLowerCase() === email &&
        rowValues[COLUMN_STATUS - 1] === STATUS_ACCEPTED
    );

  if (matches.length === 0) {
    return fail("メールアドレスとステージが一致する「受付」の予約がありません（入力の違い、またはキャンセル済み）");
  }

  if (matches.length > 1) {
    return fail(
      `メールアドレスとステージが一致する「受付」の予約が${matches.length}件あります（予約一覧 ${matches
        .map((match) => `${match.rowNumber}行目`)
        .join("、")}）。どれをキャンセルするか確認してください`
    );
  }

  const { rowValues, rowNumber } = matches[0];
  const people = parsePeopleCount(rowValues[COLUMN_PEOPLE - 1]);

  if (people === null) {
    return fail(`予約一覧 ${rowNumber}行目の申込人数が正しくありません`);
  }

  if (cancelCount > people) {
    return fail(`キャンセルする人数（${cancelCount}名）が申込人数（${people}名）より多くなっています（予約一覧 ${rowNumber}行目）`);
  }

  const stamp = Utilities.formatDate(new Date(), TIME_ZONE, "M/d HH:mm");
  const seatText = rowValues[COLUMN_SEAT - 1].trim();
  const remaining = people - cancelCount;
  let memo;
  let resultText;

  if (remaining === 0) {
    masterSheet.getRange(rowNumber, COLUMN_STATUS).setValue(STATUS_CANCELLED);
    masterSheet.getRange(rowNumber, COLUMN_SEAT).setValue("");
    memo = `${stamp} キャンセル（全員${people}名）${seatText ? `。元の席番号: ${seatText}` : ""}`;
    resultText = `キャンセル（全員${people}名）`;
  } else {
    masterSheet.getRange(rowNumber, COLUMN_PEOPLE).setValue(remaining);
    memo = `${stamp} ${cancelCount}名キャンセル（${people}名→${remaining}名）`;
    resultText = `一部キャンセル（${people}名→${remaining}名）`;

    if (seatText) {
      memo += `。席番号を${remaining}席に減らしてください`;
      resultText += "。席番号を減らしてください";
      // 席番号を直したら、通知メールで新しい席番号を送り直せるようにする
      masterSheet.getRange(rowNumber, COLUMN_SEAT_NOTIFIED).setValue("");
    }
  }

  const oldMemo = rowValues[COLUMN_MEMO - 1].trim();
  masterSheet
    .getRange(rowNumber, COLUMN_MEMO)
    .setValue(oldMemo ? `${oldMemo}\n${memo}` : memo);

  return {
    ok: true,
    resultText,
    rowNumber,
    reservationId: rowValues[COLUMN_RESERVATION_ID - 1],
    name: rowValues[COLUMN_NAME - 1].trim(),
    email: rowValues[COLUMN_EMAIL - 1].trim(),
    stageName: request.stageName,
    cancelCount,
    remaining,
    hadSeats: seatText !== "",
  };
}

/**
 * 自動で処理できなかったキャンセルを、実行したアカウント（トリガーを作った人）に知らせる。
 */
function notifyCancelProblem(spreadsheet, responseRow, reason) {
  if (MailApp.getRemainingDailyQuota() < 1) {
    return;
  }

  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: `【${EVENT_NAME}】要確認: キャンセルを自動で処理できませんでした`,
      body: [
        `「${CANCEL_SHEET_NAME}」シート ${responseRow}行目のキャンセルを、自動で処理できませんでした。`,
        "",
        `理由: ${reason}`,
        "",
        "予約一覧は変更していません。お客様にも自動のメールは送っていません。",
        `「${CANCEL_LOG_SHEET_NAME}」シートで内容を確認し、予約一覧を手で直して、お客様に連絡してください。`,
        spreadsheet.getUrl(),
      ].join("\n"),
      name: MAIL_SENDER_NAME,
    });
  } catch (error) {
    console.error(`キャンセルの要確認メールの送信に失敗しました: ${error}`);
  }
}

function buildCancelMail(outcome, stage) {
  const lines = [
    `${outcome.name} 様`,
    "",
    `${EVENT_NAME}のご予約のキャンセルを受け付けました。`,
    "",
    `■ ステージ: ${outcome.stageName}`,
  ];

  if (stage) {
    lines.push(`■ 日時: ${stage.dateText} ${stage.time}`);
  }

  lines.push(
    `■ キャンセルした人数: ${outcome.cancelCount}名`,
    `■ 残りのご予約: ${outcome.remaining > 0 ? `${outcome.remaining}名（このまま有効です）` : "なし"}`,
    `■ 予約ID: ${outcome.reservationId}`,
    ""
  );

  if (outcome.remaining > 0) {
    if (outcome.hadSeats) {
      lines.push("お席は、あらためてお知らせします。", "");
    }

    lines.push(buildMailFooter());
  } else {
    lines.push("またの機会をお待ちしております。", "", MAIL_SENDER_NAME);
  }

  return {
    subject: `【${EVENT_NAME}】キャンセルを受け付けました（${outcome.stageName}）`,
    body: lines.join("\n"),
  };
}

// ===== CSV出力 =====

const CSV_HEADERS = ["名前", "人数", "席番号"];

/**
 * メニューから実行: ステージごとの「受付」の予約を CSV でダウンロードする画面を出す。
 * ダイアログを開いた時点の内容で全ステージ分の CSV を作っておき、ボタンを押すとすぐにダウンロードする
 * （サーバーの応答を待ってからダウンロードすると、ブラウザに止められることがあるため）。
 */
function showCsvDialog() {
  const ui = SpreadsheetApp.getUi();
  const { spreadsheet, masterSheet } = getMasterSheet();
  const stageInfo = loadStages(spreadsheet);

  if (stageInfo.stages.length === 0) {
    ui.alert("CSV出力", `「${STAGE_SHEET_NAME}」に正しく設定されたステージがありません。`, ui.ButtonSet.OK);
    return;
  }

  const result = validateSeats(masterSheet, stageInfo);
  const createdAt = Utilities.formatDate(new Date(), TIME_ZONE, "yyyyMMdd-HHmm");
  const files = stageInfo.stages.map((stage) =>
    buildStageCsv(stage, result, createdAt)
  );
  const html = HtmlService.createHtmlOutput(buildCsvDialogHtml(files))
    .setWidth(460)
    .setHeight(520);

  ui.showModalDialog(html, "ステージごとのCSV（「受付」の予約）");
}

/**
 * 1ステージ分の CSV を作る。席番号の順に並べ、席番号が未入力の行は最後に登録順で並べる。
 * 席番号に問題がある行は、入力されたままの値に「要確認」を付ける。
 */
function buildStageCsv(stage, result, createdAt) {
  const entries = [];
  let people = 0;
  let problemCount = 0;

  result.rows.forEach((rowValues, index) => {
    if (
      rowValues[COLUMN_STAGE - 1] !== stage.name ||
      rowValues[COLUMN_STATUS - 1] !== STATUS_ACCEPTED
    ) {
      return;
    }

    const hasProblem = result.errorsByRow[index].length > 0;
    const seats = hasProblem ? [] : result.seatsByRow[index];
    const seatText = hasProblem
      ? `要確認: ${rowValues[COLUMN_SEAT - 1].trim()}`
      : seats.join("、");

    if (hasProblem) {
      problemCount++;
    }

    people += parsePeopleCount(rowValues[COLUMN_PEOPLE - 1]) || 0;
    entries.push({
      order: seats.length > 0 ? stage.seats.indexOf(seats[0]) : stage.seats.length,
      index,
      values: [
        rowValues[COLUMN_NAME - 1].trim(),
        rowValues[COLUMN_PEOPLE - 1],
        seatText,
      ],
    });
  });

  entries.sort((a, b) => a.order - b.order || a.index - b.index);

  const lines = [CSV_HEADERS, ...entries.map((entry) => entry.values)].map(
    (values) => values.map(toCsvCell).join(",")
  );

  return {
    stageName: stage.name,
    fileName: `${stage.name}_${createdAt}.csv`.replace(/[\/:*?"<>|]/g, "-"),
    csv: `${lines.join("\r\n")}\r\n`,
    count: entries.length,
    people,
    problemCount,
  };
}

/**
 * CSV の1セルにする。Excel で数式として実行されないよう、= + - @ で始まる値には ' を付ける。
 */
function toCsvCell(value) {
  let text = String(value === null || value === undefined ? "" : value);

  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsvDialogHtml(files) {
  // </script> などで HTML が壊れないよう、< をエスケープして埋め込む
  const data = JSON.stringify(files).replace(/</g, "\u003c");

  return `<!DOCTYPE html>
<html><head><base target="_top"><style>
  body { font-family: sans-serif; font-size: 14px; margin: 0; }
  .note { color: #555; font-size: 12px; margin: 0 0 12px; }
  .row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
  .info { font-size: 12px; color: #555; }
  .warn { color: #c00; }
  button { padding: 6px 12px; cursor: pointer; }
  .all { margin-top: 14px; width: 100%; padding: 8px; font-weight: bold; }
  #status { margin-top: 10px; font-size: 12px; color: #080; }
</style></head><body>
<p class="note">この画面を開いた時点の内容です。予約一覧を変えたら、メニューから開き直してください。<br>「すべて」を押して確認が出たら、複数ファイルのダウンロードを許可してください。</p>
<div id="list"></div>
<button class="all" id="all">すべてのステージをダウンロード</button>
<div id="status"></div>
<script>
  const files = ${data};
  const status = document.getElementById("status");
  function download(file) {
    const blob = new Blob(["\uFEFF" + file.csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    status.textContent = "ダウンロードしました: " + file.fileName;
  }
  const list = document.getElementById("list");
  files.forEach((file) => {
    const row = document.createElement("div");
    row.className = "row";
    const label = document.createElement("div");
    label.textContent = file.stageName;
    const info = document.createElement("div");
    info.className = "info";
    info.textContent = file.count + "件・" + file.people + "名";
    if (file.problemCount > 0) {
      const warn = document.createElement("span");
      warn.className = "warn";
      warn.textContent = "（席番号の要確認 " + file.problemCount + "件）";
      info.appendChild(warn);
    }
    label.appendChild(info);
    const button = document.createElement("button");
    button.textContent = "ダウンロード";
    button.onclick = () => download(file);
    row.appendChild(label);
    row.appendChild(button);
    list.appendChild(row);
  });
  document.getElementById("all").onclick = () => {
    files.forEach((file, i) => setTimeout(() => download(file), i * 400));
  };
</script>
</body></html>`;
}

// ===== 使い方シート =====

const USAGE_SHEET_NAME = "使い方";
const USAGE_COLUMN_WIDTHS = [220, 400, 260];
const USAGE_HEADING_COLOR = "#d9ead3";
const USAGE_TABLE_HEADER_COLOR = "#eeeeee";

/**
 * 「使い方」シートの内容。1要素が1行。
 * 種類: title（題名）、h（見出し）、p（文。長い文は1行に収まるよう分ける）、th（表の見出し）、t（表の行）、""（空行）
 */
function buildUsageLines() {
  return [
    ["title", `${EVENT_NAME} 予約管理の使い方`],
    ["p", "このシートは自動で作られます（メニュー「予約管理 → 使い方シートを作り直す」で最新にできます）。"],
    [""],
    ["h", "1. この仕組みでできること"],
    ["p", "・お客様がステージごとの予約フォームから申し込むと、「予約一覧」シートに自動で1行追加されます。"],
    ["p", "・定員を超える申込は「申込不可」になります。定員に達したステージのフォームは自動で締め切られます。"],
    ["p", "・スタッフが席番号を入力し、メニューから席番号の通知メールを送ります。"],
    ["p", `・開催日の${REMINDER_DAYS_BEFORE}日前から前日まで、毎朝${REMINDER_HOUR}時ごろにリマインドメールが自動で送られます。`],
    ["p", "・お客様はキャンセルフォームからキャンセルでき、予約一覧に自動で反映されます。"],
    ["p", "・ステージごとの名簿（名前・人数・席番号）をCSVでダウンロードできます。"],
    [""],
    ["h", "2. シートの一覧"],
    ["th", "シート", "内容", "編集してよいか"],
    ["t", USAGE_SHEET_NAME, "この説明", "編集しない（作り直すと消えます）"],
    ["t", MASTER_SHEET_NAME, "すべての予約。1行が1件の予約", "K列（席番号）を入力する。ほかの列は下の「よくある作業」のときだけ"],
    ["t", STAGE_SHEET_NAME, "ステージごとの日時・座席・定員", "ステージを追加・変更するときに編集する"],
    ["t", `${SEAT_MAP_SHEET_PREFIX}（ステージ名）`, "席の割り当て状況。緑 = 割当済み、赤 = 要確認、白 = 空席", "見るだけ（自動で作り直されます）"],
    ["t", "4/17 ステージ1 など", "各予約フォームの回答（元のデータ）", "編集しない。タブ名も変えない"],
    ["t", CANCEL_SHEET_NAME, "キャンセルフォームの回答（元のデータ）", "編集しない。タブ名も変えない"],
    ["t", CANCEL_LOG_SHEET_NAME, "キャンセルを自動で処理した結果", "見るだけ"],
    [""],
    ["h", `3. 「${MASTER_SHEET_NAME}」の列`],
    ["th", "列", "内容", "書き込む人"],
    ["t", "A 登録日時", "申込を受け付けた日時", "自動"],
    ["t", "B 予約ID", "予約ごとの番号（TK-…）。お客様へのメールにも載ります", "自動"],
    ["t", "C ステージ", "申し込んだステージ", "自動"],
    ["t", "D 名前 / E メールアドレス / F 申込人数", "フォームに入力された内容", "自動（人数の変更は手で）"],
    ["t", "G 状態", `${STATUS_ACCEPTED}：有効な予約 / ${STATUS_REJECTED}：定員超過 / ${STATUS_CANCELLED}：取り消し済み。定員に数えるのは「${STATUS_ACCEPTED}」だけ`, "自動（手でキャンセルするときは手で）"],
    ["t", "H メモ", "定員超過の理由、キャンセルの記録", "自動"],
    ["t", "I 元回答シート名 / J 元回答行番号", "二重登録を防ぐための記録", "自動。消さない"],
    ["t", "K 席番号", "割り当てた席番号", "スタッフが入力"],
    ["t", "L 席番号通知日時", "席番号の通知メールを送った日時", "自動"],
    ["t", "M リマインド送信日時", "リマインドメールを送った日時", "自動"],
    [""],
    ["h", "4. 席番号の入れ方（K列）"],
    ["p", "・申込人数と同じ数の番号を「1,2」「A,B」のように入力します（区切りはカンマ・読点・空白のどれでもOK）。"],
    ["p", `・使える番号は「${STAGE_SHEET_NAME}」の「座席」の列で決まります（例: 1-132,A-L）。全角や小文字でも大丈夫です。`],
    ["p", "・問題があるとセルが赤くなります。セルにマウスを乗せると、メモに理由が出ます。直すと赤色は消えます。"],
    ["p", "　赤くなる例: 座席にない番号、ほかの人と同じ番号、人数と番号の数が違う、「受付」以外の行に入力した"],
    ["p", "・K列には手で色を付けないでください（チェックのたびに自動で上書きされます）。"],
    ["p", "・行を削除したあとなどは、メニュー「席番号をチェック・座席表を更新」で全件をチェックし直せます。"],
    [""],
    ["h", "5. メニュー「予約管理」"],
    ["th", "メニュー", "すること", "使うアカウント"],
    ["t", "席番号をチェック・座席表を更新", "全件の席番号をチェックし、座席表シートを作り直す", "だれでも"],
    ["t", "定員の状況をログに出す", "ステージごとの予約人数を実行ログに出す（担当者向け）", "だれでも"],
    ["t", "席番号の通知メールを送る", "席番号が入っていて、まだ通知していない「受付」の人に送る。送る前に件数の確認が出る", "団体のアカウント"],
    ["t", "テストメールを自分に送る", "通知とリマインドの見本を、実行した人に送る", "団体のアカウント"],
    ["t", "リマインドの自動送信を設定", "毎朝のリマインドを開始する。本番前に1回だけ実行", "団体のアカウント"],
    ["t", "キャンセルフォームを作成・更新", "1回目はキャンセルフォームを作る。2回目からはステージの選択肢を最新にする", "担当者"],
    ["t", "ステージごとのCSVをダウンロード", "ステージごとの名簿（受付の人の名前・人数・席番号）をダウンロードする", "だれでも"],
    ["t", "使い方シートを作り直す", "このシートを最新の内容にする", "だれでも"],
    ["p", "※メールは、メニューを実行したアカウントから送られます。お客様へのメールは団体のアカウントで実行してください。"],
    [""],
    ["h", "6. よくある作業"],
    ["th", "やりたいこと", "手順", "注意"],
    ["t", "席番号を知らせる", `K列に席番号を入力 → 赤いセルがないか確認 → メニュー「席番号の通知メールを送る」`, "赤いセルの人には送られません。直してからもう一度実行"],
    ["t", "通知・リマインドを送り直す", "その人の L列（通知）または M列（リマインド）を空にして、もう一度送る", "席番号を変えても自動では送り直されません"],
    ["t", "電話などでキャンセルを受けた", `G列を「${STATUS_CANCELLED}」にし、K列の席番号を消す。H列に日付と理由をメモ`, "締め切ったフォームは自動で再開しません。再開するならフォームの「回答を受付中」をオンにする"],
    ["t", "人数を減らしたい", "F列の人数を直し、K列の席番号もその数に合わせる", "席番号を変えたら L列を空にして通知を送り直す"],
    ["t", "「要確認: キャンセルを自動で処理できませんでした」のメールが来た", `「${CANCEL_LOG_SHEET_NAME}」で内容を確認 → 予約一覧を手で直す → お客様に連絡`, "このときお客様には自動のメールは送られていません"],
    ["t", "ステージを追加する", `①「${STAGE_SHEET_NAME}」に1行追加 ②予約フォームを作り、回答先をこのスプレッドシートにする ③できた回答シートのタブ名を、ステージ設定のA列と同じにする ④メニュー「キャンセルフォームを作成・更新」`, `フォームの質問タイトルは「${QUESTION_NAME}」「${QUESTION_EMAIL}」「${QUESTION_PEOPLE}」と完全に同じにする（すべて必須）`],
    ["t", "A〜L席を使わないステージ", `「${STAGE_SHEET_NAME}」の座席を「1-132」にする`, "定員の列が空欄なら、席数がそのまま定員になる"],
    ["t", "名簿を印刷・共有したい", "メニュー「ステージごとのCSVをダウンロード」", "名前が入っているので、渡す相手と保存場所に注意"],
    [""],
    ["h", "7. やってはいけないこと"],
    ["p", `・「${MASTER_SHEET_NAME}」の列の順番を変えたり、途中に列を足したりしない（自動処理が壊れます）。`],
    ["p", "・予約フォームの質問タイトルや、回答シート・「キャンセル受付」のタブ名を変えない。"],
    ["p", `・受付を始めたあとに「${STAGE_SHEET_NAME}」のステージ名を変えない（既存の予約とのつながりが切れます）。`],
    ["p", "・I列・J列を消さない（同じ申込が二重に登録される原因になります）。"],
    ["p", "・お客様の名前やメールアドレスを、関係者以外に見せたり送ったりしない。"],
    [""],
    ["h", "8. 困ったとき"],
    ["th", "困りごと", "考えられる原因", "対処"],
    ["t", "申込が予約一覧に載らない", "ステージ設定の誤り、フォームの質問タイトル・タブ名の変更、権限の承認切れ", "回答シートには残っています。メニュー「席番号をチェック・座席表を更新」で設定の問題が表示されます。直らなければ担当者に連絡"],
    ["t", "メールが一部送れない", "1日の送信上限（無料Gmail 約100通、Google Workspace 約1,500通）", "翌日にもう一度メニューを実行する（送った人には二重に送られません）"],
    ["t", "座席表が古い", "自動で作り直すのは予約一覧やステージ設定を編集したとき", "メニュー「席番号をチェック・座席表を更新」"],
    ["t", "メニュー「予約管理」が出ない", "読み込みの途中", "スプレッドシートを再読み込みする（F5）"],
  ];
}

/**
 * 「使い方」シートを作り直す（なければ先頭に作る）。
 */
function writeUsageSheet(spreadsheet) {
  const lines = buildUsageLines();
  const columnCount = USAGE_COLUMN_WIDTHS.length;
  let sheet = spreadsheet.getSheetByName(USAGE_SHEET_NAME);

  if (!sheet) {
    const activeSheet = spreadsheet.getActiveSheet();
    sheet = spreadsheet.insertSheet(USAGE_SHEET_NAME, 0);
    sheet
      .protect()
      .setDescription("使い方シートは自動で作り直されます。内容はメニュー「使い方シートを作り直す」で更新してください。")
      .setWarningOnly(true);

    if (activeSheet) {
      activeSheet.activate();
    }
  }

  sheet.clear();

  const isTable = (type) => type === "th" || type === "t";
  const values = lines.map(([, ...cells]) =>
    Array.from({ length: columnCount }, (_, index) => cells[index] || "")
  );
  const style = (pick) => lines.map(([type]) => Array(columnCount).fill(pick(type)));

  sheet
    .getRange(1, 1, lines.length, columnCount)
    .setValues(values)
    .setVerticalAlignment("top")
    .setFontSizes(style((type) => (type === "title" ? 16 : type === "h" ? 12 : 10)))
    .setFontWeights(style((type) => (["title", "h", "th"].includes(type) ? "bold" : "normal")))
    .setBackgrounds(
      style((type) =>
        type === "h" ? USAGE_HEADING_COLOR : type === "th" ? USAGE_TABLE_HEADER_COLOR : null
      )
    )
    // 表は折り返し、文と見出しは右の空いたセルにはみ出して表示する
    .setWrapStrategies(
      style((type) =>
        isTable(type) ? SpreadsheetApp.WrapStrategy.WRAP : SpreadsheetApp.WrapStrategy.OVERFLOW
      )
    );

  lines.forEach(([type], index) => {
    if (isTable(type)) {
      sheet.getRange(index + 1, 1, 1, columnCount).setBorder(true, true, true, true, true, true);
    }
  });

  USAGE_COLUMN_WIDTHS.forEach((width, index) => sheet.setColumnWidth(index + 1, width));
  sheet.setHiddenGridlines(true);
  return sheet;
}

/**
 * メニューから実行: 「使い方」シートを最新の内容で作り直す。
 */
function rebuildUsageSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  writeUsageSheet(spreadsheet).activate();
  spreadsheet.toast("使い方シートを作り直しました。", "使い方", 5);
}
