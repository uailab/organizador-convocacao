// ============================================
// ROTEAMENTO DE PÁGINAS
// ============================================

function doGet(e) {
  const page = e.parameter.page;
  
  // Rota Admin
  if (page === 'admin') {
    if (!isOwner()) {
      // Mostra página de acesso negado
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
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('CONFIG_PADRAO', JSON.stringify(config));
    return { success: true, message: 'Configurações salvas com sucesso!' };
  } catch (error) {
    Logger.log('Erro ao salvar config: ' + error);
    return { success: false, message: 'Erro ao salvar: ' + error.message };
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
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.deleteProperty('CONFIG_PADRAO');
    return { success: true, message: 'Configurações restauradas para padrão de fábrica!' };
  } catch (error) {
    Logger.log('Erro ao restaurar: ' + error);
    return { success: false, message: 'Erro ao restaurar: ' + error.message };
  }
}

// ============================================
// FUNÇÕES AUXILIARES (DEBUG)
// ============================================

function getEnvironmentInfo() {
  return {
    isOwner: isOwner(),
    userEmail: Session.getActiveUser().getEmail(),
    scriptId: ScriptApp.getScriptId(),
    publicUrl: ScriptApp.getService().getUrl(),
    adminUrl: ScriptApp.getService().getUrl() + '?page=admin'
  };
}