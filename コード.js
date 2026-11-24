const STAGE_BY_SHEET = {
  "4/17 ステージ1": "4/17 ステージ1",
  "4/17 ステージ2": "4/17 ステージ2",
  // 実際の回答シート名とステージ名を追加する
};

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
  const masterSheet = spreadsheet.getSheetByName("予約一覧");

  if (!masterSheet) {
    throw new Error("「予約一覧」シートが見つかりません。");
  }

  const row = e.range.getRow();
  const lastRow = masterSheet.getLastRow();

  // 同じ回答行を二重に登録しないための確認
  if (lastRow >= 2) {
    const sourceRows = masterSheet.getRange(2, 9, lastRow - 1, 2).getValues();
    const alreadyAdded = sourceRows.some(
      ([sheetName, sourceRow]) =>
        sheetName === responseSheetName && Number(sourceRow) === row
    );

    if (alreadyAdded) {
      return;
    }
  }

  const answer = (questionTitle) =>
    (e.namedValues[questionTitle] || [""])[0].trim();

  const reservationId = `TK-${Utilities.getUuid()}`;

  masterSheet.appendRow([
    new Date(),
    reservationId,
    stage,
    answer("お名前"),
    answer("メールアドレス"),
    answer("申込人数"),
    "受付",
    "",
    responseSheetName,
    row,
  ]);
}