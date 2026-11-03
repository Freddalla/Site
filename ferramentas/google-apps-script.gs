/**
 * Dipa · recebe os formulários do site e grava numa Planilha Google.
 *
 * Cada formulário manda um campo "lista" com o nome da aba (por exemplo,
 * "Manhã Dipa"). A aba é criada sozinha na primeira vez, e as colunas são
 * criadas conforme os campos chegam. Passo a passo em ferramentas/README.md.
 */
function doPost(e) {
  const p = (e && e.parameter) || {};
  const nomeAba = String(p.lista || 'Lista').slice(0, 60);
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(nomeAba) || planilha.insertSheet(nomeAba);

  let colunas = aba.getLastRow() > 0 ? aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0] : ['data'];
  Object.keys(p).forEach(k => { if (k !== 'lista' && colunas.indexOf(k) === -1) colunas.push(k); });
  aba.getRange(1, 1, 1, colunas.length).setValues([colunas]);

  aba.appendRow(colunas.map(c => c === 'data' ? new Date() : (p[c] || '')));
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
