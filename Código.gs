// ============================================
// ROTEAMENTO DE PÁGINAS
// ============================================

function doGet(e) {
  const page = e.parameter.page;
  
  // Rota Admin
  if (page === 'admin') {
    if (!isAdmin()) {
      return renderAccessDeniedPage();
    }
    return renderAdminPage();
  }
  
  // Rota Pública (padrão)
  return renderPublicPage();
}

// ============================================
// RENDERIZAÇÃO DE PÁGINAS
// ============================================

function renderPublicPage() {
  const template = HtmlService.createTemplateFromFile('organizador-de-convocacao');
  template.configPadraoInicial = JSON.stringify(carregarConfigPadrao());
  const env = getEnvironmentInfo();
  template.isOwnerInicial = env.isOwner;
  template.isAdminInicial = env.isAdmin;
  template.adminUrlInicial = env.adminUrl;
  return template.evaluate()
    .setTitle('Organizador de Convocação')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function renderAdminPage() {
  const template = HtmlService.createTemplateFromFile('admin');
  template.configPadraoInicial = JSON.stringify(carregarConfigPadrao());
  const env = getEnvironmentInfo();
  template.publicUrlInicial = env.publicUrl;
  template.adminUrlInicial = env.adminUrl;
  return template.evaluate()
    .setTitle('Admin - Configurações Padrão')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ============================================
// VERIFICAÇÃO DE PROPRIETÁRIO
// ============================================

function isOwner() {
  try {
    const activeEmail = Session.getActiveUser().getEmail();
    const effectiveEmail = Session.getEffectiveUser().getEmail();
    
    return activeEmail === effectiveEmail;
  } catch (error) {
    Logger.log('Erro ao verificar owner: ' + error);
    return false;
  }
}

function checkIfOwner() {
  return isOwner();
}

function isAdmin() {
  try {
    if (isOwner()) return true;
    const activeEmail = Session.getActiveUser().getEmail();
    if (!activeEmail) return false;
    const raw = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAILS');
    if (!raw) return false;
    const list = JSON.parse(raw);
    return list.includes(activeEmail.toLowerCase().trim());
  } catch (error) {
    Logger.log('Erro ao verificar admin: ' + error);
    return false;
  }
}

function appendLog(action, detalhes) {
  try {
    const id = PropertiesService.getScriptProperties().getProperty('LOG_SPREADSHEET_ID');
    if (!id) return;
    const sheet = SpreadsheetApp.openById(id).getSheetByName('logs');
    if (!sheet) return;
    sheet.appendRow([new Date().toISOString(), Session.getActiveUser().getEmail(), action, detalhes]);
  } catch (_) {}
}

function renderAccessDeniedPage() {
  return HtmlService.createHtmlOutputFromFile('acesso-negado')
    .setTitle('Acesso Negado')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Função auxiliar para obter email do usuário atual (para debug)
function getCurrentUserEmail() {
  return Session.getActiveUser().getEmail();
}

// ============================================
// GERENCIAMENTO DE PROPRIEDADES
// ============================================

function salvarConfigPadrao(config) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    PropertiesService.getScriptProperties().setProperty('CONFIG_PADRAO', JSON.stringify(config));
    appendLog('SALVAR_CONFIG', JSON.stringify(config));
    return { success: true, message: 'Configurações salvas com sucesso!' };
  } catch (error) {
    Logger.log('Erro ao salvar config: ' + error);
    return { success: false, message: 'Erro ao salvar: ' + error.message };
  } finally {
    lock.releaseLock();
  }
}

function carregarConfigPadrao() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const configString = scriptProperties.getProperty('CONFIG_PADRAO');
    
    if (configString) {
      return JSON.parse(configString);
    }
    
    // Retorna config default se não houver nada salvo
    return getConfigDefault();
  } catch (error) {
    Logger.log('Erro ao carregar config: ' + error);
    return getConfigDefault();
  }
}

function getConfigDefault() {
  return {
    percentuais: {
      AC: 60,
      PN: 30,
      PcD: 10
    },
    blocos: [
      {
        id: 1,
        quantidadeTotal: 10,
        percentuais: { AC: 60, PN: 30, PcD: 10 },
        padrao: [
          { tipo: 'AC', repeticoes: 2 },
          { tipo: 'PN', repeticoes: 1 },
          { tipo: 'AC', repeticoes: 1 },
          { tipo: 'PcD', repeticoes: 1 },
          { tipo: 'PN', repeticoes: 1 },
          { tipo: 'AC', repeticoes: 2 },
          { tipo: 'PN', repeticoes: 1 },
          { tipo: 'AC', repeticoes: 1 }
        ]
      },
      {
        id: 2,
        quantidadeTotal: null,
        percentuais: { AC: 60, PN: 30, PcD: 10 },
        padrao: [
          { tipo: 'AC', repeticoes: 1 },
          { tipo: 'PN', repeticoes: 1 },
          { tipo: 'AC', repeticoes: 2 },
          { tipo: 'PcD', repeticoes: 1 },
          { tipo: 'PN', repeticoes: 1 },
          { tipo: 'AC', repeticoes: 2 },
          { tipo: 'PN', repeticoes: 1 },
          { tipo: 'AC', repeticoes: 1 }
        ]
      }
    ]
  };
}

function restaurarFactoryDefault() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    PropertiesService.getScriptProperties().deleteProperty('CONFIG_PADRAO');
    appendLog('RESTAURAR_PADRAO', 'Configuração restaurada para padrão de fábrica');
    return { success: true, message: 'Configurações restauradas para padrão de fábrica!' };
  } catch (error) {
    Logger.log('Erro ao restaurar: ' + error);
    return { success: false, message: 'Erro ao restaurar: ' + error.message };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// FUNÇÕES AUXILIARES (DEBUG)
// ============================================

function getEnvironmentInfo() {
  return {
    isOwner: isOwner(),
    isAdmin: isAdmin(),
    userEmail: Session.getActiveUser().getEmail(),
    scriptId: ScriptApp.getScriptId(),
    publicUrl: ScriptApp.getService().getUrl(),
    adminUrl: ScriptApp.getService().getUrl() + '?page=admin'
  };
}