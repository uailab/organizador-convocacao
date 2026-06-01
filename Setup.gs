// ID da planilha de log. Deixe vazio ('') para desabilitar o log.
const LOG_SPREADSHEET_ID = '';

const LOG_SHEET_NAME = 'logs';
const LOG_SHEET_HEADERS = ['timestamp', 'userEmail', 'action', 'detalhes'];

function setup() {
  const props = PropertiesService.getScriptProperties();
  const errors = [];

  console.log('============================================================');
  console.log('  SETUP — Organizador de Convocação');
  console.log('============================================================');

  // Admin emails
  try {
    const normalized = ADMIN_EMAILS.map(e => e.toLowerCase().trim()).filter(Boolean);
    props.setProperty('ADMIN_EMAILS', JSON.stringify(normalized));
    console.log('[OK] ADMIN_EMAILS salvo (' + normalized.length + ' email(s)): ' + (normalized.join(', ') || '(nenhum)'));
  } catch (e) {
    errors.push('Falha ao salvar ADMIN_EMAILS: ' + e.message);
  }

  // Log spreadsheet
  if (LOG_SPREADSHEET_ID.trim()) {
    try {
      props.setProperty('LOG_SPREADSHEET_ID', LOG_SPREADSHEET_ID.trim());
      console.log('[OK] LOG_SPREADSHEET_ID salvo.');

      const ss = SpreadsheetApp.openById(LOG_SPREADSHEET_ID.trim());
      let sheet = ss.getSheetByName(LOG_SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(LOG_SHEET_NAME);
        sheet.getRange(1, 1, 1, LOG_SHEET_HEADERS.length).setValues([LOG_SHEET_HEADERS]);
        SpreadsheetApp.flush();
        console.log('[OK] Aba "' + LOG_SHEET_NAME + '" criada com cabeçalhos.');
      } else {
        console.log('[OK] Aba "' + LOG_SHEET_NAME + '" já existe.');
      }
    } catch (e) {
      errors.push('Falha ao configurar planilha de log: ' + e.message);
    }
  } else {
    props.deleteProperty('LOG_SPREADSHEET_ID');
    console.log('[OK] LOG_SPREADSHEET_ID não configurado — log desabilitado.');
  }

  console.log('------------------------------------------------------------');
  if (errors.length === 0) {
    console.log('[SETUP CONCLUÍDO] Configurações aplicadas com sucesso.');
  } else {
    console.log('[SETUP COM ERROS] Corrija os problemas abaixo e execute novamente:');
    errors.forEach((msg, i) => console.log('  ' + (i + 1) + '. ' + msg));
  }
  console.log('============================================================');
}

// Sincroniza apenas a lista de admins sem passar pelo fluxo completo.
function setupSyncAdmins() {
  console.log('============================================================');
  console.log('  SETUP — Sincronizando admins');
  console.log('============================================================');
  try {
    const normalized = ADMIN_EMAILS.map(e => e.toLowerCase().trim()).filter(Boolean);
    PropertiesService.getScriptProperties().setProperty('ADMIN_EMAILS', JSON.stringify(normalized));
    console.log('[OK] ADMIN_EMAILS atualizado (' + normalized.length + ' email(s)): ' + (normalized.join(', ') || '(nenhum)'));
  } catch (e) {
    console.error('[ERRO] ' + e.message);
  }
  console.log('============================================================');
}

// Aplica formatação visual à aba de logs (cabeçalho destacado, linhas alternadas, colunas ajustadas).
function setupFormatLogs() {
  console.log('============================================================');
  console.log('  SETUP — Formatando aba de logs');
  console.log('============================================================');
  try {
    const id = PropertiesService.getScriptProperties().getProperty('LOG_SPREADSHEET_ID');
    if (!id) {
      console.log('[AVISO] LOG_SPREADSHEET_ID não configurado. Execute setup() primeiro.');
      return;
    }
    const sheet = SpreadsheetApp.openById(id).getSheetByName(LOG_SHEET_NAME);
    if (!sheet) {
      console.log('[AVISO] Aba "' + LOG_SHEET_NAME + '" não encontrada. Execute setup() primeiro.');
      return;
    }
    const numCols = LOG_SHEET_HEADERS.length;
    const lastRow = Math.max(sheet.getMaxRows(), 2);

    sheet.getBandings().forEach(b => b.remove());
    const banding = sheet.getRange(1, 1, lastRow, numCols)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    banding.setHeaderRowColor('#2C5282');
    banding.setFirstRowColor('#FFFFFF');
    banding.setSecondRowColor('#F7FAFC');
    banding.setFooterRowColor(null);

    sheet.getRange(1, 1, 1, numCols).setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.getRange(1, 1, lastRow, numCols)
      .setBorder(true, true, true, true, true, true, '#CBD5E0', SpreadsheetApp.BorderStyle.SOLID);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, numCols);
    SpreadsheetApp.flush();

    console.log('[OK] Aba "' + LOG_SHEET_NAME + '" formatada.');
  } catch (e) {
    console.error('[ERRO] ' + e.message);
  }
  console.log('============================================================');
}
