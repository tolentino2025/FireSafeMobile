import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateUserManualPdf(language: 'pt-BR' | 'en' = 'pt-BR'): Promise<string | null> {
  const isPtBR = language === 'pt-BR';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1f2937;
      padding: 20px;
    }
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }
    .cover-logo {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #DC2626, #991B1B);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
    }
    .cover-logo-icon {
      font-size: 60px;
      color: white;
    }
    .cover h1 {
      font-size: 36pt;
      color: #DC2626;
      margin-bottom: 10px;
    }
    .cover h2 {
      font-size: 18pt;
      color: #6b7280;
      font-weight: normal;
      margin-bottom: 40px;
    }
    .cover .version {
      font-size: 12pt;
      color: #9ca3af;
    }
    .cover .nfpa-badge {
      margin-top: 40px;
      padding: 12px 24px;
      background: #dcfce7;
      border-radius: 8px;
      color: #166534;
      font-weight: 600;
    }
    h1 {
      font-size: 20pt;
      color: #DC2626;
      margin: 30px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #DC2626;
    }
    h2 {
      font-size: 14pt;
      color: #111827;
      margin: 20px 0 10px 0;
    }
    h3 {
      font-size: 12pt;
      color: #374151;
      margin: 15px 0 8px 0;
    }
    p {
      margin: 8px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 10px 0 10px 20px;
    }
    li {
      margin: 5px 0;
    }
    .section {
      page-break-inside: avoid;
      margin-bottom: 20px;
    }
    .important {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    .tip {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 12px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    .warning {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 12px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    .step-list {
      counter-reset: step-counter;
      list-style: none;
      margin-left: 0;
    }
    .step-list li {
      counter-increment: step-counter;
      position: relative;
      padding-left: 35px;
      margin: 12px 0;
    }
    .step-list li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0;
      width: 24px;
      height: 24px;
      background: #DC2626;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-size: 12px;
      font-weight: bold;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 15px 0;
    }
    .feature-item {
      padding: 10px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .toc {
      page-break-after: always;
    }
    .toc h2 {
      font-size: 18pt;
      margin-bottom: 20px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dotted #d1d5db;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 10pt;
    }
    @media print {
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-logo">
      <span class="cover-logo-icon">&#128737;</span>
    </div>
    <h1>FireSafe ITM</h1>
    <h2>${isPtBR ? 'Manual do Usuário' : 'User Manual'}</h2>
    <p class="version">${isPtBR ? 'Versão' : 'Version'} 1.0.0</p>
    <div class="nfpa-badge">${isPtBR ? 'Conforme NFPA 25' : 'NFPA 25 Compliant'}</div>
  </div>

  <!-- Table of Contents -->
  <div class="toc">
    <h2>${isPtBR ? 'Índice' : 'Table of Contents'}</h2>
    <div class="toc-item"><span>1. ${isPtBR ? 'Visão Geral' : 'Overview'}</span><span>3</span></div>
    <div class="toc-item"><span>2. ${isPtBR ? 'Requisitos do Sistema' : 'System Requirements'}</span><span>3</span></div>
    <div class="toc-item"><span>3. ${isPtBR ? 'Instalação do Aplicativo' : 'App Installation'}</span><span>4</span></div>
    <div class="toc-item"><span>4. ${isPtBR ? 'Ativação da Licença' : 'License Activation'}</span><span>5</span></div>
    <div class="toc-item"><span>5. ${isPtBR ? 'Primeiros Passos' : 'Getting Started'}</span><span>6</span></div>
    <div class="toc-item"><span>6. ${isPtBR ? 'Gerenciamento de Empresas' : 'Company Management'}</span><span>7</span></div>
    <div class="toc-item"><span>7. ${isPtBR ? 'Gerenciamento de Inspetores' : 'Inspector Management'}</span><span>8</span></div>
    <div class="toc-item"><span>8. ${isPtBR ? 'Gerenciamento de Propriedades' : 'Property Management'}</span><span>8</span></div>
    <div class="toc-item"><span>9. ${isPtBR ? 'Criando Inspeções' : 'Creating Inspections'}</span><span>9</span></div>
    <div class="toc-item"><span>10. ${isPtBR ? 'Tipos de Inspeção' : 'Inspection Types'}</span><span>10</span></div>
    <div class="toc-item"><span>11. ${isPtBR ? 'Preenchendo Checklists' : 'Filling Out Checklists'}</span><span>11</span></div>
    <div class="toc-item"><span>12. ${isPtBR ? 'Captura de Fotos' : 'Photo Capture'}</span><span>12</span></div>
    <div class="toc-item"><span>13. ${isPtBR ? 'Assinaturas Digitais' : 'Digital Signatures'}</span><span>12</span></div>
    <div class="toc-item"><span>14. ${isPtBR ? 'Gerando Relatórios PDF' : 'Generating PDF Reports'}</span><span>13</span></div>
    <div class="toc-item"><span>15. ${isPtBR ? 'Compartilhando Relatórios' : 'Sharing Reports'}</span><span>13</span></div>
    <div class="toc-item"><span>16. ${isPtBR ? 'Agenda de Inspeções' : 'Inspection Schedule'}</span><span>14</span></div>
    <div class="toc-item"><span>17. ${isPtBR ? 'Notificações' : 'Notifications'}</span><span>14</span></div>
    <div class="toc-item"><span>18. ${isPtBR ? 'Configurações' : 'Settings'}</span><span>15</span></div>
    <div class="toc-item"><span>19. ${isPtBR ? 'Backup de Dados' : 'Data Backup'}</span><span>16</span></div>
    <div class="toc-item"><span>20. ${isPtBR ? 'Solução de Problemas' : 'Troubleshooting'}</span><span>17</span></div>
  </div>

  <!-- Content -->
  <h1>1. ${isPtBR ? 'Visão Geral' : 'Overview'}</h1>
  <div class="section">
    <p>${isPtBR 
      ? 'O <strong>FireSafe ITM</strong> é um aplicativo completo para Inspeção, Teste e Manutenção (ITM) de sistemas de proteção contra incêndio, desenvolvido em total conformidade com as normas <strong>NFPA 25</strong>.'
      : '<strong>FireSafe ITM</strong> is a complete application for Inspection, Testing, and Maintenance (ITM) of fire protection systems, developed in full compliance with <strong>NFPA 25</strong> standards.'
    }</p>
    
    <h3>${isPtBR ? 'Principais Recursos' : 'Key Features'}</h3>
    <div class="feature-grid">
      <div class="feature-item">${isPtBR ? 'Inspeções de Sprinklers' : 'Sprinkler Inspections'}</div>
      <div class="feature-item">${isPtBR ? 'Bombas de Incêndio' : 'Fire Pumps'}</div>
      <div class="feature-item">${isPtBR ? 'Hidrantes e Tubulação' : 'Hydrants & Piping'}</div>
      <div class="feature-item">${isPtBR ? 'Tanques e Reservatórios' : 'Tanks & Reservoirs'}</div>
      <div class="feature-item">${isPtBR ? 'Relatórios PDF Profissionais' : 'Professional PDF Reports'}</div>
      <div class="feature-item">${isPtBR ? 'Captura de Fotos e Assinaturas' : 'Photos & Signatures'}</div>
      <div class="feature-item">${isPtBR ? 'Funcionamento 100% Offline' : '100% Offline Operation'}</div>
      <div class="feature-item">${isPtBR ? 'Suporte Bilíngue' : 'Bilingual Support'}</div>
    </div>
  </div>

  <h1>2. ${isPtBR ? 'Requisitos do Sistema' : 'System Requirements'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Dispositivos Móveis' : 'Mobile Devices'}</h3>
    <ul>
      <li><strong>iOS:</strong> iPhone ${isPtBR ? 'com' : 'with'} iOS 13.0 ${isPtBR ? 'ou superior' : 'or higher'}</li>
      <li><strong>Android:</strong> ${isPtBR ? 'Dispositivo com' : 'Device with'} Android 8.0 (API 26) ${isPtBR ? 'ou superior' : 'or higher'}</li>
      <li><strong>${isPtBR ? 'Espaço' : 'Storage'}:</strong> ${isPtBR ? 'Mínimo' : 'Minimum'} 100 MB</li>
      <li><strong>Internet:</strong> ${isPtBR ? 'Necessária apenas para ativação da licença' : 'Required only for license activation'}</li>
    </ul>
  </div>

  <div class="page-break"></div>
  <h1>3. ${isPtBR ? 'Instalação do Aplicativo' : 'App Installation'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Opção A: Via Expo Go (Recomendado para teste)' : 'Option A: Via Expo Go (Recommended for testing)'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Baixe o aplicativo <strong>Expo Go</strong> na loja de aplicativos (App Store ou Google Play)' : 'Download the <strong>Expo Go</strong> app from the app store (App Store or Google Play)'}</li>
      <li>${isPtBR ? 'Abra o Expo Go e escaneie o código QR fornecido pelo administrador' : 'Open Expo Go and scan the QR code provided by the administrator'}</li>
      <li>${isPtBR ? 'O aplicativo será carregado automaticamente' : 'The app will load automatically'}</li>
    </ol>

    <h3>${isPtBR ? 'Opção B: Via APK (Android)' : 'Option B: Via APK (Android)'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Receba o arquivo APK do administrador' : 'Receive the APK file from the administrator'}</li>
      <li>${isPtBR ? 'Vá em Configurações > Segurança > Fontes desconhecidas e ative' : 'Go to Settings > Security > Unknown sources and enable'}</li>
      <li>${isPtBR ? 'Localize o arquivo APK no gerenciador de arquivos' : 'Locate the APK file in the file manager'}</li>
      <li>${isPtBR ? 'Toque no arquivo APK para iniciar a instalação' : 'Tap the APK file to start installation'}</li>
      <li>${isPtBR ? 'Siga as instruções na tela' : 'Follow the on-screen instructions'}</li>
    </ol>

    <h3>${isPtBR ? 'Opção C: Via TestFlight (iOS)' : 'Option C: Via TestFlight (iOS)'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Receba o convite do TestFlight por email' : 'Receive the TestFlight invitation by email'}</li>
      <li>${isPtBR ? 'Baixe o aplicativo TestFlight na App Store' : 'Download the TestFlight app from the App Store'}</li>
      <li>${isPtBR ? 'Abra o email do convite e toque em "View in TestFlight"' : 'Open the invitation email and tap "View in TestFlight"'}</li>
      <li>${isPtBR ? 'Instale o FireSafe ITM pelo TestFlight' : 'Install FireSafe ITM through TestFlight'}</li>
    </ol>
  </div>

  <div class="page-break"></div>
  <h1>4. ${isPtBR ? 'Ativação da Licença' : 'License Activation'}</h1>
  <div class="section">
    <div class="important">
      <strong>${isPtBR ? 'Importante:' : 'Important:'}</strong> ${isPtBR 
        ? 'O FireSafe ITM requer uma licença válida para funcionamento. Após a ativação, o app funciona 100% offline.'
        : 'FireSafe ITM requires a valid license to operate. After activation, the app works 100% offline.'
      }
    </div>

    <h3>${isPtBR ? 'Passo 1: Obter a Chave de Licença' : 'Step 1: Get the License Key'}</h3>
    <p>${isPtBR 
      ? 'Entre em contato com o administrador ou vendedor para obter sua chave de licença. A chave tem o formato: <strong>XXXX-XXXX-XXXX-XXXX</strong>'
      : 'Contact the administrator or seller to get your license key. The key format is: <strong>XXXX-XXXX-XXXX-XXXX</strong>'
    }</p>

    <h3>${isPtBR ? 'Passo 2: Ativar no Aplicativo' : 'Step 2: Activate in the App'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Abra o aplicativo FireSafe ITM' : 'Open the FireSafe ITM app'}</li>
      <li>${isPtBR ? 'Na tela de ativação, insira sua chave de licença' : 'On the activation screen, enter your license key'}</li>
      <li>${isPtBR ? 'Toque em "Ativar Licença"' : 'Tap "Activate License"'}</li>
      <li>${isPtBR ? 'Aguarde a validação (requer internet)' : 'Wait for validation (requires internet)'}</li>
      <li>${isPtBR ? 'Após a ativação, o app funcionará offline' : 'After activation, the app will work offline'}</li>
    </ol>

    <div class="tip">
      <strong>${isPtBR ? 'Dicas:' : 'Tips:'}</strong>
      <ul>
        <li>${isPtBR ? 'Cada chave é válida por um período específico (1 a 99 meses)' : 'Each key is valid for a specific period (1 to 99 months)'}</li>
        <li>${isPtBR ? 'A licença é vinculada ao dispositivo' : 'The license is tied to the device'}</li>
        <li>${isPtBR ? 'Você receberá notificações quando estiver próximo do vencimento' : 'You will receive notifications when near expiration'}</li>
        <li>${isPtBR ? 'Para renovação: suporte@firesafeitm.com' : 'For renewal: suporte@firesafeitm.com'}</li>
      </ul>
    </div>
  </div>

  <div class="page-break"></div>
  <h1>5. ${isPtBR ? 'Primeiros Passos' : 'Getting Started'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Tela Inicial (Home)' : 'Home Screen'}</h3>
    <p>${isPtBR ? 'Ao abrir o aplicativo, você verá:' : 'When you open the app, you will see:'}</p>
    <ul>
      <li><strong>${isPtBR ? 'Estatísticas' : 'Statistics'}:</strong> ${isPtBR ? 'Número total de inspeções' : 'Total number of inspections'}</li>
      <li><strong>${isPtBR ? 'Atividade Recente' : 'Recent Activity'}:</strong> ${isPtBR ? 'Últimas inspeções realizadas' : 'Latest inspections performed'}</li>
      <li><strong>${isPtBR ? 'Botão Flutuante (+)' : 'Floating Button (+)'}:</strong> ${isPtBR ? 'Para criar nova inspeção' : 'To create new inspection'}</li>
    </ul>

    <h3>${isPtBR ? 'Navegação Principal' : 'Main Navigation'}</h3>
    <p>${isPtBR ? 'O aplicativo possui 4 abas na parte inferior:' : 'The app has 4 tabs at the bottom:'}</p>
    <ol>
      <li><strong>${isPtBR ? 'Início' : 'Home'}:</strong> Dashboard ${isPtBR ? 'com estatísticas' : 'with statistics'}</li>
      <li><strong>${isPtBR ? 'Inspeções' : 'Inspections'}:</strong> ${isPtBR ? 'Lista de todas as inspeções' : 'List of all inspections'}</li>
      <li><strong>${isPtBR ? 'Propriedades' : 'Properties'}:</strong> ${isPtBR ? 'Empresas, Inspetores e Propriedades' : 'Companies, Inspectors, and Properties'}</li>
      <li><strong>${isPtBR ? 'Perfil' : 'Profile'}:</strong> ${isPtBR ? 'Configurações e preferências' : 'Settings and preferences'}</li>
    </ol>
  </div>

  <h1>6. ${isPtBR ? 'Gerenciamento de Empresas' : 'Company Management'}</h1>
  <div class="section">
    <p>${isPtBR ? 'Antes de criar inspeções, cadastre as empresas clientes.' : 'Before creating inspections, register client companies.'}</p>
    
    <h3>${isPtBR ? 'Cadastrar Nova Empresa' : 'Register New Company'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Vá para a aba "Propriedades"' : 'Go to the "Properties" tab'}</li>
      <li>${isPtBR ? 'Selecione a sub-aba "Empresas"' : 'Select the "Companies" sub-tab'}</li>
      <li>${isPtBR ? 'Toque no botão "+" para adicionar empresa' : 'Tap the "+" button to add a company'}</li>
      <li>${isPtBR ? 'Preencha os campos: Nome, CNPJ, Endereço, Cidade, Estado, CEP, Contato, Telefone, Email' : 'Fill in the fields: Name, Tax ID, Address, City, State, Zip Code, Contact, Phone, Email'}</li>
      <li>${isPtBR ? 'Toque em "Salvar"' : 'Tap "Save"'}</li>
    </ol>
  </div>

  <div class="page-break"></div>
  <h1>7. ${isPtBR ? 'Gerenciamento de Inspetores' : 'Inspector Management'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Cadastrar Novo Inspetor' : 'Register New Inspector'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Vá para a aba "Propriedades"' : 'Go to the "Properties" tab'}</li>
      <li>${isPtBR ? 'Selecione a sub-aba "Inspetores"' : 'Select the "Inspectors" sub-tab'}</li>
      <li>${isPtBR ? 'Toque no botão "+"' : 'Tap the "+" button'}</li>
      <li>${isPtBR ? 'Preencha: Nome Completo, Email, Telefone, Função/Cargo' : 'Fill in: Full Name, Email, Phone, Role/Position'}</li>
      <li>${isPtBR ? 'Toque em "Salvar"' : 'Tap "Save"'}</li>
    </ol>
  </div>

  <h1>8. ${isPtBR ? 'Gerenciamento de Propriedades' : 'Property Management'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Cadastrar Nova Propriedade' : 'Register New Property'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Vá para a aba "Propriedades"' : 'Go to the "Properties" tab'}</li>
      <li>${isPtBR ? 'Selecione a sub-aba "Propriedades"' : 'Select the "Properties" sub-tab'}</li>
      <li>${isPtBR ? 'Toque no botão "+"' : 'Tap the "+" button'}</li>
      <li>${isPtBR ? 'Preencha: Nome, Endereço, Telefone, Contato, Empresa Vinculada' : 'Fill in: Name, Address, Phone, Contact, Linked Company'}</li>
      <li>${isPtBR ? 'Toque em "Salvar"' : 'Tap "Save"'}</li>
    </ol>
  </div>

  <div class="page-break"></div>
  <h1>9. ${isPtBR ? 'Criando Inspeções' : 'Creating Inspections'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Método 1: Botão Flutuante' : 'Method 1: Floating Button'}</h3>
    <p>${isPtBR ? 'Em qualquer tela, toque no botão "+" flutuante e selecione o tipo de inspeção.' : 'On any screen, tap the floating "+" button and select the inspection type.'}</p>

    <h3>${isPtBR ? 'Preenchendo a Inspeção' : 'Filling Out the Inspection'}</h3>
    <ol class="step-list">
      <li><strong>${isPtBR ? 'Selecionar Empresa' : 'Select Company'}:</strong> ${isPtBR ? 'Escolha a empresa no dropdown (dados preenchidos automaticamente)' : 'Choose the company from dropdown (data auto-filled)'}</li>
      <li><strong>${isPtBR ? 'Selecionar Inspetor' : 'Select Inspector'}:</strong> ${isPtBR ? 'Escolha o inspetor responsável' : 'Choose the responsible inspector'}</li>
      <li><strong>${isPtBR ? 'Dados da Propriedade' : 'Property Data'}:</strong> ${isPtBR ? 'Confirme ou edite os dados' : 'Confirm or edit the data'}</li>
      <li><strong>${isPtBR ? 'Data da Inspeção' : 'Inspection Date'}:</strong> ${isPtBR ? 'Selecione a data' : 'Select the date'}</li>
      <li><strong>${isPtBR ? 'Frequência' : 'Frequency'}:</strong> ${isPtBR ? 'Escolha: Diária, Semanal, Mensal, Trimestral, Semestral, Anual, 5 Anos' : 'Choose: Daily, Weekly, Monthly, Quarterly, Semi-annually, Annually, 5 Years'}</li>
      <li><strong>${isPtBR ? 'Detalhes do Equipamento' : 'Equipment Details'}:</strong> ${isPtBR ? 'Preencha conforme o tipo' : 'Fill in according to type'}</li>
      <li>${isPtBR ? 'Toque em "Continuar para Checklist"' : 'Tap "Continue to Checklist"'}</li>
    </ol>
  </div>

  <h1>10. ${isPtBR ? 'Tipos de Inspeção' : 'Inspection Types'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Sistemas de Sprinklers' : 'Sprinkler Systems'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Tubo Molhado' : 'Wet Pipe'}:</strong> ${isPtBR ? 'Sistema mais comum, sempre cheio de água' : 'Most common system, always filled with water'}</li>
      <li><strong>${isPtBR ? 'Tubo Seco' : 'Dry Pipe'}:</strong> ${isPtBR ? 'Para áreas com risco de congelamento' : 'For areas with freezing risk'}</li>
      <li><strong>${isPtBR ? 'Pré-Ação/Dilúvio' : 'Preaction/Deluge'}:</strong> ${isPtBR ? 'Para áreas de alto risco' : 'For high-risk areas'}</li>
      <li><strong>${isPtBR ? 'Água-Espuma' : 'Foam-Water'}:</strong> ${isPtBR ? 'Para líquidos inflamáveis' : 'For flammable liquids'}</li>
    </ul>

    <h3>${isPtBR ? 'Bombas de Incêndio' : 'Fire Pumps'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Inspeção Semanal' : 'Weekly Inspection'}:</strong> ${isPtBR ? 'Verificações visuais e operacionais' : 'Visual and operational checks'}</li>
      <li><strong>${isPtBR ? 'Inspeção Mensal' : 'Monthly Inspection'}:</strong> ${isPtBR ? 'Testes de funcionamento' : 'Operation tests'}</li>
      <li><strong>${isPtBR ? 'Inspeção Anual' : 'Annual Inspection'}:</strong> ${isPtBR ? 'Teste de performance completo' : 'Complete performance test'}</li>
    </ul>

    <h3>${isPtBR ? 'Hidrantes e Tubulação' : 'Hydrants and Piping'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Hidrantes de Pátio' : 'Yard Hydrants'}:</strong> ${isPtBR ? 'Externos' : 'External'}</li>
      <li><strong>${isPtBR ? 'Teste de Vazão' : 'Flow Test'}:</strong> ${isPtBR ? 'Medição de pressão e fluxo' : 'Pressure and flow measurement'}</li>
      <li><strong>${isPtBR ? 'Tubulação de Standpipe' : 'Standpipe System'}:</strong> ${isPtBR ? 'Sistema de mangueiras' : 'Hose system'}</li>
    </ul>
  </div>

  <div class="page-break"></div>
  <h1>11. ${isPtBR ? 'Preenchendo Checklists' : 'Filling Out Checklists'}</h1>
  <div class="section">
    <p>${isPtBR 
      ? 'Os checklists são baseados nas normas NFPA 25 e são filtrados automaticamente pela frequência selecionada.'
      : 'Checklists are based on NFPA 25 standards and are automatically filtered by the selected frequency.'
    }</p>

    <h3>${isPtBR ? 'Respostas Disponíveis' : 'Available Responses'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Sim' : 'Yes'}:</strong> ${isPtBR ? 'Item em conformidade' : 'Item in compliance'}</li>
      <li><strong>${isPtBR ? 'Não' : 'No'}:</strong> ${isPtBR ? 'Item com problema/não conforme' : 'Item with problem/non-compliant'}</li>
      <li><strong>N/A:</strong> ${isPtBR ? 'Não aplicável' : 'Not applicable'}</li>
    </ul>

    <h3>${isPtBR ? 'Campos Adicionais' : 'Additional Fields'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Valores PSI' : 'PSI Values'}:</strong> ${isPtBR ? 'Para medições de pressão' : 'For pressure measurements'}</li>
      <li><strong>${isPtBR ? 'Campos Numéricos' : 'Numeric Fields'}:</strong> ${isPtBR ? 'Vazão, RPM, Voltagem, etc.' : 'Flow rate, RPM, Voltage, etc.'}</li>
      <li><strong>${isPtBR ? 'Notas' : 'Notes'}:</strong> ${isPtBR ? 'Observações adicionais por item' : 'Additional observations per item'}</li>
    </ul>

    <div class="tip">
      <strong>${isPtBR ? 'Dicas:' : 'Tips:'}</strong>
      <ul>
        <li>${isPtBR ? 'O progresso é salvo automaticamente' : 'Progress is saved automatically'}</li>
        <li>${isPtBR ? 'Você pode sair e continuar depois' : 'You can exit and continue later'}</li>
        <li>${isPtBR ? 'Itens marcados como "Não" devem ter notas explicativas' : 'Items marked as "No" should have explanatory notes'}</li>
      </ul>
    </div>
  </div>

  <h1>12. ${isPtBR ? 'Captura de Fotos' : 'Photo Capture'}</h1>
  <div class="section">
    <ol class="step-list">
      <li>${isPtBR ? 'Na tela de detalhes da inspeção, toque em "Adicionar Foto"' : 'On the inspection details screen, tap "Add Photo"'}</li>
      <li>${isPtBR ? 'Escolha: Camera (tirar foto) ou Galeria (selecionar existente)' : 'Choose: Camera (take photo) or Gallery (select existing)'}</li>
      <li>${isPtBR ? 'Ajuste a foto se necessário' : 'Adjust the photo if needed'}</li>
      <li>${isPtBR ? 'Adicione uma descrição (opcional)' : 'Add a description (optional)'}</li>
      <li>${isPtBR ? 'Toque em "Salvar"' : 'Tap "Save"'}</li>
    </ol>
  </div>

  <h1>13. ${isPtBR ? 'Assinaturas Digitais' : 'Digital Signatures'}</h1>
  <div class="section">
    <ol class="step-list">
      <li>${isPtBR ? 'Na tela de conclusão da inspeção, toque na área de assinatura' : 'On the inspection completion screen, tap the signature area'}</li>
      <li>${isPtBR ? 'Use o dedo para assinar na tela' : 'Use your finger to sign on the screen'}</li>
      <li>${isPtBR ? 'Se precisar refazer, toque em "Limpar"' : 'If you need to redo, tap "Clear"'}</li>
      <li>${isPtBR ? 'Toque em "Confirmar" para salvar' : 'Tap "Confirm" to save'}</li>
    </ol>
  </div>

  <div class="page-break"></div>
  <h1>14. ${isPtBR ? 'Gerando Relatórios PDF' : 'Generating PDF Reports'}</h1>
  <div class="section">
    <ol class="step-list">
      <li>${isPtBR ? 'Abra a inspeção desejada' : 'Open the desired inspection'}</li>
      <li>${isPtBR ? 'Toque no botão "Gerar PDF" ou ícone de documento' : 'Tap the "Generate PDF" button or document icon'}</li>
      <li>${isPtBR ? 'Aguarde a geração' : 'Wait for generation'}</li>
      <li>${isPtBR ? 'O PDF será exibido para visualização' : 'The PDF will be displayed for viewing'}</li>
    </ol>

    <h3>${isPtBR ? 'Conteúdo do Relatório' : 'Report Contents'}</h3>
    <ul>
      <li>${isPtBR ? 'Cabeçalho com dados da empresa' : 'Header with company data'}</li>
      <li>${isPtBR ? 'Informações da propriedade e inspetor' : 'Property and inspector information'}</li>
      <li>${isPtBR ? 'Checklist completo com respostas' : 'Complete checklist with responses'}</li>
      <li>${isPtBR ? 'Medições e valores numéricos' : 'Measurements and numeric values'}</li>
      <li>${isPtBR ? 'Fotos anexadas e assinaturas' : 'Attached photos and signatures'}</li>
      <li>${isPtBR ? 'Conformidade NFPA 25' : 'NFPA 25 compliance'}</li>
    </ul>
  </div>

  <h1>15. ${isPtBR ? 'Compartilhando Relatórios' : 'Sharing Reports'}</h1>
  <div class="section">
    <p>${isPtBR ? 'Após gerar o PDF, toque em "Compartilhar" e escolha:' : 'After generating the PDF, tap "Share" and choose:'}</p>
    <ul>
      <li><strong>Email:</strong> ${isPtBR ? 'Enviar como anexo' : 'Send as attachment'}</li>
      <li><strong>WhatsApp:</strong> ${isPtBR ? 'Enviar para contato' : 'Send to contact'}</li>
      <li><strong>${isPtBR ? 'Salvar' : 'Save'}:</strong> ${isPtBR ? 'Salvar no dispositivo' : 'Save to device'}</li>
      <li><strong>${isPtBR ? 'Outros Apps' : 'Other Apps'}:</strong> ${isPtBR ? 'Qualquer app de compartilhamento' : 'Any sharing app'}</li>
    </ul>
  </div>

  <h1>16. ${isPtBR ? 'Agenda de Inspeções' : 'Inspection Schedule'}</h1>
  <div class="section">
    <p>${isPtBR 
      ? 'O aplicativo gerencia automaticamente a agenda de inspeções baseado na frequência NFPA 25.'
      : 'The app automatically manages the inspection schedule based on NFPA 25 frequency.'
    }</p>

    <h3>${isPtBR ? 'Visualizar Agenda' : 'View Schedule'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Vá para a aba "Inspeções"' : 'Go to the "Inspections" tab'}</li>
      <li>${isPtBR ? 'Toque no ícone de calendário no cabeçalho' : 'Tap the calendar icon in the header'}</li>
      <li>${isPtBR ? 'Visualize: Todas, Atrasadas (vermelho), Próximas (verde)' : 'View: All, Overdue (red), Upcoming (green)'}</li>
    </ol>

    <div class="tip">
      <strong>${isPtBR ? 'Agendamento Automático:' : 'Automatic Scheduling:'}</strong>
      <p>${isPtBR 
        ? 'Ao completar uma inspeção, a próxima é agendada automaticamente baseado na frequência selecionada.'
        : 'When completing an inspection, the next one is automatically scheduled based on the selected frequency.'
      }</p>
    </div>
  </div>

  <div class="page-break"></div>
  <h1>17. ${isPtBR ? 'Notificações' : 'Notifications'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Tipos de Notificações' : 'Notification Types'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Lembretes de Inspeção' : 'Inspection Reminders'}:</strong> ${isPtBR ? 'Inspeções próximas do vencimento' : 'Inspections near due date'}</li>
      <li><strong>${isPtBR ? 'Vencimento de Licença' : 'License Expiration'}:</strong> ${isPtBR ? 'Aviso quando a licença está expirando' : 'Warning when license is expiring'}</li>
    </ul>

    <h3>${isPtBR ? 'Configurar Notificações' : 'Configure Notifications'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Vá para a aba "Perfil"' : 'Go to the "Profile" tab'}</li>
      <li>${isPtBR ? 'Ative/desative as notificações' : 'Enable/disable notifications'}</li>
      <li>${isPtBR ? 'Permita as notificações quando solicitado' : 'Allow notifications when prompted'}</li>
    </ol>
  </div>

  <h1>18. ${isPtBR ? 'Configurações' : 'Settings'}</h1>
  <div class="section">
    <h3>${isPtBR ? 'Idioma' : 'Language'}</h3>
    <p>${isPtBR ? 'Português (Brasil) / English' : 'Portuguese (Brazil) / English'}</p>
    <p>${isPtBR ? 'Para alterar: Perfil > Idioma > Toque para alternar' : 'To change: Profile > Language > Tap to toggle'}</p>

    <h3>${isPtBR ? 'Tema' : 'Theme'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Claro' : 'Light'}:</strong> ${isPtBR ? 'Fundo branco' : 'White background'}</li>
      <li><strong>${isPtBR ? 'Escuro' : 'Dark'}:</strong> ${isPtBR ? 'Fundo escuro' : 'Dark background'}</li>
      <li><strong>${isPtBR ? 'Sistema' : 'System'}:</strong> ${isPtBR ? 'Segue configuração do dispositivo' : 'Follows device settings'}</li>
    </ul>
    <p>${isPtBR ? 'Para alterar: Perfil > Tema > Selecione a opção' : 'To change: Profile > Theme > Select option'}</p>

    <h3>${isPtBR ? 'Ajuda' : 'Help'}</h3>
    <p>${isPtBR ? 'Contato: suporte@firesafeitm.com' : 'Contact: suporte@firesafeitm.com'}</p>
  </div>

  <div class="page-break"></div>
  <h1>19. ${isPtBR ? 'Backup de Dados' : 'Data Backup'}</h1>
  <div class="section">
    <p>${isPtBR 
      ? 'O FireSafe ITM permite exportar e importar todos os seus dados, garantindo que você nunca perca suas inspeções.'
      : 'FireSafe ITM allows you to export and import all your data, ensuring you never lose your inspections.'
    }</p>

    <h3>${isPtBR ? 'Por que fazer Backup?' : 'Why Backup?'}</h3>
    <ul>
      <li><strong>${isPtBR ? 'Segurança' : 'Security'}:</strong> ${isPtBR ? 'Proteja seus dados contra perda acidental' : 'Protect your data against accidental loss'}</li>
      <li><strong>${isPtBR ? 'Atualização do App' : 'App Update'}:</strong> ${isPtBR ? 'Preserve seus dados ao atualizar o aplicativo' : 'Preserve your data when updating the app'}</li>
      <li><strong>${isPtBR ? 'Troca de Dispositivo' : 'Device Change'}:</strong> ${isPtBR ? 'Transfira seus dados para um novo celular' : 'Transfer your data to a new phone'}</li>
      <li><strong>${isPtBR ? 'Arquivamento' : 'Archiving'}:</strong> ${isPtBR ? 'Mantenha cópias de segurança em local seguro' : 'Keep backup copies in a safe location'}</li>
    </ul>

    <h3>${isPtBR ? 'Exportar Dados (Criar Backup)' : 'Export Data (Create Backup)'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Vá para a aba "Perfil"' : 'Go to the "Profile" tab'}</li>
      <li>${isPtBR ? 'Role até a seção "Backup de Dados"' : 'Scroll to the "Data Backup" section'}</li>
      <li>${isPtBR ? 'Toque em "Exportar Dados"' : 'Tap "Export Data"'}</li>
      <li>${isPtBR ? 'Escolha onde salvar: Email, WhatsApp, Google Drive, iCloud, ou Arquivos' : 'Choose where to save: Email, WhatsApp, Google Drive, iCloud, or Files'}</li>
    </ol>

    <h3>${isPtBR ? 'Importar Dados (Restaurar Backup)' : 'Import Data (Restore Backup)'}</h3>
    <ol class="step-list">
      <li>${isPtBR ? 'Vá para a aba "Perfil"' : 'Go to the "Profile" tab'}</li>
      <li>${isPtBR ? 'Role até a seção "Backup de Dados"' : 'Scroll to the "Data Backup" section'}</li>
      <li>${isPtBR ? 'Toque em "Importar Dados"' : 'Tap "Import Data"'}</li>
      <li>${isPtBR ? 'Confirme que deseja substituir os dados atuais' : 'Confirm that you want to replace current data'}</li>
      <li>${isPtBR ? 'Selecione o arquivo de backup (.json)' : 'Select the backup file (.json)'}</li>
    </ol>

    <div class="important">
      <strong>${isPtBR ? 'Dicas de Boas Práticas:' : 'Best Practice Tips:'}</strong>
      <ul>
        <li>${isPtBR ? 'Faça backup toda semana se usar o app frequentemente' : 'Backup every week if you use the app frequently'}</li>
        <li>${isPtBR ? 'Sempre exporte seus dados antes de atualizar o aplicativo' : 'Always export your data before updating the app'}</li>
        <li>${isPtBR ? 'Mantenha cópias em diferentes locais (email, nuvem, computador)' : 'Keep copies in different locations (email, cloud, computer)'}</li>
      </ul>
    </div>
  </div>

  <div class="page-break"></div>
  <h1>20. ${isPtBR ? 'Solução de Problemas' : 'Troubleshooting'}</h1>
  <div class="section">
    <div class="warning">
      <h3>${isPtBR ? 'App não abre' : 'App won\'t open'}</h3>
      <p>${isPtBR 
        ? 'Reinicie o dispositivo, verifique atualizações do sistema, ou reinstale o aplicativo.'
        : 'Restart the device, check for system updates, or reinstall the app.'
      }</p>
    </div>

    <div class="warning">
      <h3>${isPtBR ? 'Licença não ativa' : 'License won\'t activate'}</h3>
      <p>${isPtBR 
        ? 'Verifique a conexão com internet, confirme se a chave está correta, ou contate suporte@firesafeitm.com.'
        : 'Check internet connection, confirm the key is correct, or contact suporte@firesafeitm.com.'
      }</p>
    </div>

    <div class="warning">
      <h3>${isPtBR ? 'Fotos não salvam' : 'Photos won\'t save'}</h3>
      <p>${isPtBR 
        ? 'Verifique as permissões de câmera e armazenamento, libere espaço no dispositivo, ou reinicie o app.'
        : 'Check camera and storage permissions, free up device space, or restart the app.'
      }</p>
    </div>

    <div class="warning">
      <h3>${isPtBR ? 'PDF não gera' : 'PDF won\'t generate'}</h3>
      <p>${isPtBR 
        ? 'Verifique se a inspeção está completa, aguarde o processamento completo, ou tente novamente.'
        : 'Check if the inspection is complete, wait for full processing, or try again.'
      }</p>
    </div>

    <div class="warning">
      <h3>${isPtBR ? 'Notificações não chegam' : 'Notifications not arriving'}</h3>
      <p>${isPtBR 
        ? 'Verifique as permissões de notificação nas configurações do dispositivo e ative no app (Perfil > Notificações).'
        : 'Check notification permissions in device settings and enable in app (Profile > Notifications).'
      }</p>
    </div>

    <div class="warning">
      <h3>${isPtBR ? 'Dados perdidos' : 'Lost data'}</h3>
      <p>${isPtBR 
        ? 'Verifique se possui um arquivo de backup salvo. Vá em Perfil > Backup de Dados > Importar Dados para restaurar. Se não tiver backup, contate suporte@firesafeitm.com.'
        : 'Check if you have a saved backup file. Go to Profile > Data Backup > Import Data to restore. If you don\'t have a backup, contact suporte@firesafeitm.com.'
      }</p>
    </div>

    <div class="warning">
      <h3>${isPtBR ? 'Erro ao importar backup' : 'Error importing backup'}</h3>
      <p>${isPtBR 
        ? 'Verifique se o arquivo é um backup válido do FireSafe ITM (.json). Certifique-se de que o arquivo não foi corrompido.'
        : 'Verify the file is a valid FireSafe ITM backup (.json). Make sure the file is not corrupted.'
      }</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>FireSafe ITM</strong> - NFPA 25 Compliant</p>
    <p>${isPtBR ? 'Versão' : 'Version'} 1.0.0</p>
    <p>${isPtBR ? 'Suporte' : 'Support'}: suporte@firesafeitm.com</p>
    <p>Copyright 2025 - ${isPtBR ? 'Todos os Direitos Reservados' : 'All Rights Reserved'}</p>
  </div>
</body>
</html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    return uri;
  } catch (error) {
    console.error('Error generating manual PDF:', error);
    return null;
  }
}

export async function shareUserManualPdf(language: 'pt-BR' | 'en' = 'pt-BR'): Promise<boolean> {
  const pdfUri = await generateUserManualPdf(language);
  
  if (!pdfUri) {
    return false;
  }

  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: language === 'pt-BR' ? 'Compartilhar Manual' : 'Share Manual',
        UTI: 'com.adobe.pdf',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sharing manual PDF:', error);
    return false;
  }
}
