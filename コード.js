// 回答シート名（シートのタブ名と完全一致） → ステージ名
// フォーム（ステージ）を追加したら、ここにも1行追加する
const STAGE_BY_SHEET = {
  "フォームの回答 1": "4/17 ステージ1",
  "フォームの回答 2": "4/17 ステージ2",
};

const MASTER_SHEET_NAME = "予約一覧";

// フォームの質問タイトル（フォーム側と完全一致させる）
const QUESTION_NAME = "お名前";
const QUESTION_EMAIL = "メールアドレス";
const QUESTION_PEOPLE = "申込人数";
const REQUIRED_QUESTIONS = [QUESTION_NAME, QUESTION_EMAIL, QUESTION_PEOPLE];

const STATUS_ACCEPTED = "受付";
const STATUS_NEEDS_REVIEW = "要確認";

// 「予約一覧」で元の回答シート名・行番号を記録している列（I列・J列）
const SOURCE_SHEET_COLUMN = 9;

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

  // 質問タイトルの不一致・未回答を検出する（空欄のまま「受付」にしない）
  const missingQuestions = REQUIRED_QUESTIONS.filter(
    (questionTitle) => answer(questionTitle) === ""
  );
  const status =
    missingQuestions.length > 0 ? STATUS_NEEDS_REVIEW : STATUS_ACCEPTED;
  const note =
    missingQuestions.length > 0
      ? `回答を取得できない項目: ${missingQuestions.join("、")}`
      : "";

  if (missingQuestions.length > 0) {
    // 個人情報は出さず、シート名・行番号・項目名だけを記録する
    console.warn(
      `${responseSheetName} ${row}行目: ${note}（質問タイトルがコードと一致しているか確認してください）`
    );
  }

  // 同時送信で二重登録の確認をすり抜けないよう、確認〜追記を排他制御する
  const lock = LockService.getScriptLock();
  lock.waitLock(LOCK_TIMEOUT_MS);

  try {
    const lastRow = masterSheet.getLastRow();

    // 同じ回答行を二重に登録しないための確認
    if (lastRow >= 2) {
      const sourceRows = masterSheet
        .getRange(2, SOURCE_SHEET_COLUMN, lastRow - 1, 2)
        .getValues();
      const alreadyAdded = sourceRows.some(
        ([sheetName, sourceRow]) =>
          sheetName === responseSheetName && Number(sourceRow) === row
      );

      if (alreadyAdded) {
        return;
      }
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
  } finally {
    lock.releaseLock();
  }
}
