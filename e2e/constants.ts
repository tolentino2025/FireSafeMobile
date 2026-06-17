// Constantes compartilhadas por todos os specs E2E.
// Todos os dados criados nos testes usam o prefixo P = "PLAYWRIGHT_TEST_".
// Isso permite localizar e limpar dados de teste sem afetar dados reais.

export const P = "PLAYWRIGHT_TEST_";

// ---------------------------------------------------------------------------
// Dados de teste — entidades criadas durante os specs
// ---------------------------------------------------------------------------

export const TEST_COMPANY = {
  name: `${P}Empresa SA`,
  cnpj: "00.000.000/0001-00",
  address: "Rua do Playwright, 100",
  city: "São Paulo",
  state: "SP",
  zipCode: "01310-100",
  contactName: `${P}Contato`,
  contactPhone: "(11) 9999-0001",
  contactEmail: "pwtest@firesafe.test",
};

export const TEST_CONTRACTOR = {
  name: `${P}Prestadora Ltda`,
  licenseNumber: "PW-LIC-001",
  address: "Av. do Playwright, 200",
  city: "São Paulo",
  state: "SP",
  zipCode: "01310-200",
  phone: "(11) 9999-0002",
  fax: "(11) 9999-0009",
  email: "prestadora.pw@firesafe.test",
};

export const TEST_PROPERTY = {
  name: `${P}Edificio Alpha`,
  address: "Praça do Teste, 1",
  phone: "(11) 9999-0003",
  contact: `${P}Zelador`,
};

export const TEST_INSPECTOR = {
  name: `${P}Inspetor Joao`,
  email: "inspetor.pw@firesafe.test",
  phone: "(11) 9999-0004",
  role: "inspector",
};

export const TEST_TECH = {
  name: `${P}Engenheiro Silva`,
  creaCAU: "CREA-PW-12345",
  email: "engenheiro.pw@firesafe.test",
  phone: "(11) 9999-0005",
  role: "Engenheiro de Segurança",
};

export const TEST_PUMP = {
  tag: `${P}PUMP-001`,
  manufacturer: "PW Manufacturer",
  model: "PW Model X1",
  serialNumber: "PW-SN-001",
  ratedFlowGpm: "500",
  ratedPressurePsi: "150",
};

export const TEST_JOB_SITE = {
  jobName: `${P}Canteiro Alpha`,
  jobNumber: "PW-JOB-001",
  address: "Rua do Canteiro, 1",
  city: "São Paulo",
  state: "SP",
  testLocation: "Subsolo B1",
  testMethod: "Pitot",
};

// ---------------------------------------------------------------------------
// Credenciais de usuários de teste (injetadas via env vars)
// Para rodar os testes de isolamento com autenticação real:
//   PW_USER_A_EMAIL=playwright_a@teste.com
//   PW_USER_A_PASSWORD=Playwright@123
//   PW_USER_B_EMAIL=playwright_b@teste.com
//   PW_USER_B_PASSWORD=Playwright@123
// Esses usuários devem existir no projeto Supabase.
// ---------------------------------------------------------------------------

export const AUTH_USER_A = {
  email: process.env.PW_USER_A_EMAIL ?? "playwright_a@teste.com",
  password: process.env.PW_USER_A_PASSWORD ?? "Playwright@123",
  name: `${P}User A`,
};

export const AUTH_USER_B = {
  email: process.env.PW_USER_B_EMAIL ?? "playwright_b@teste.com",
  password: process.env.PW_USER_B_PASSWORD ?? "Playwright@123",
  name: `${P}User B`,
};

// ---------------------------------------------------------------------------
// Feature flags detectados em runtime
// ---------------------------------------------------------------------------

export const SUPABASE_CONFIGURED = !!(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

export const AUTH_TEST_USERS_CONFIGURED = !!(
  process.env.PW_USER_A_EMAIL &&
  process.env.PW_USER_A_PASSWORD &&
  process.env.PW_USER_B_EMAIL &&
  process.env.PW_USER_B_PASSWORD
);

// ---------------------------------------------------------------------------
// Strings PT-BR exatas da UI (de constants/i18n.ts)
// ---------------------------------------------------------------------------

export const UI = {
  tabs: {
    home: "Inicio",
    inspections: "Inspeções",
    schedule: "Agenda",
    registrations: "Cadastros",
    profile: "Perfil",
  },
  registrations: {
    companies: "Empresas",
    inspectors: "Inspetores",
    techResp: "Responsáveis Técnicos",
    pumps: "Bombas de Incêndio",
    contractors: "Prestadoras de Serviço",
    jobSites: "Locais de Trabalho",
    properties: "Propriedades",
  },
  form: {
    save: "Salvar",
    cancel: "Cancelar",
  },
  profile: {
    logout: "Sair",
  },
  itm: {
    title: "Agenda ITM",
    newPlan: "Novo Plano",
  },
  inspections: {
    title: "Inspeções",
    search: "Buscar inspeções...",
    new: "Nova Inspeção",
  },
  noResults: "Nenhum resultado encontrado",
} as const;
