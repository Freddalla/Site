/**
 * Travessia · recebe os cadastros da lista de espera e grava numa Planilha Google.
 * Passo a passo no README.md desta pasta.
 */
const COLUNAS = ['data','nome','idade','email','whatsapp','adiando','preco','atrai','cocriar',
  'perfil','pontuacao','utm_source','utm_medium','utm_campaign','utm_content','utm_term','pagina'];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Lista')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Lista');
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUNAS);
  const p = e.parameter || {};
  sheet.appendRow(COLUNAS.map(c => c === 'data' ? new Date() : (p[c] || '')));
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
