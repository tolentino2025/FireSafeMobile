import { HydrostaticTest } from "@/types/hydrostaticTest";

export interface ValidationError {
  field: string;
  messageKey: string;
  message: string;
}

export function validateHydrostaticTest(
  data: HydrostaticTest,
  language: "en" | "pt-BR" = "pt-BR"
): ValidationError[] {
  const errors: ValidationError[] = [];

  const msg = (key: string, ptBR: string, en: string) => 
    language === "pt-BR" ? ptBR : en;

  if (!data.systemType) {
    errors.push({
      field: "systemType",
      messageKey: "systemTypeRequired",
      message: msg("systemTypeRequired", "Tipo de sistema obrigatório", "System type is required"),
    });
  }

  if (!data.normRefs || data.normRefs.length === 0) {
    errors.push({
      field: "normRefs",
      messageKey: "normRefsRequired",
      message: msg("normRefsRequired", "Selecione pelo menos uma norma de referência", "Select at least one reference standard"),
    });
  }

  if (!data.testDate) {
    errors.push({
      field: "testDate",
      messageKey: "testDateRequired",
      message: msg("testDateRequired", "Data do teste obrigatória", "Test date is required"),
    });
  }

  if (!data.startTime) {
    errors.push({
      field: "startTime",
      messageKey: "startTimeRequired",
      message: msg("startTimeRequired", "Hora de início obrigatória", "Start time is required"),
    });
  }

  if (!data.endTime) {
    errors.push({
      field: "endTime",
      messageKey: "endTimeRequired",
      message: msg("endTimeRequired", "Hora de término obrigatória", "End time is required"),
    });
  }

  if (!data.owner.corporateName) {
    errors.push({
      field: "owner.corporateName",
      messageKey: "ownerCorporateNameRequired",
      message: msg("ownerCorporateNameRequired", "Razão social do proprietário obrigatória", "Owner corporate name is required"),
    });
  }

  if (!data.owner.address) {
    errors.push({
      field: "owner.address",
      messageKey: "ownerAddressRequired",
      message: msg("ownerAddressRequired", "Endereço do proprietário obrigatório", "Owner address is required"),
    });
  }

  if (!data.owner.localResponsible) {
    errors.push({
      field: "owner.localResponsible",
      messageKey: "ownerResponsibleRequired",
      message: msg("ownerResponsibleRequired", "Responsável local obrigatório", "Local responsible is required"),
    });
  }

  if (!data.owner.role) {
    errors.push({
      field: "owner.role",
      messageKey: "ownerRoleRequired",
      message: msg("ownerRoleRequired", "Cargo do responsável obrigatório", "Responsible role is required"),
    });
  }

  if (!data.owner.contact) {
    errors.push({
      field: "owner.contact",
      messageKey: "ownerContactRequired",
      message: msg("ownerContactRequired", "Contato do responsável obrigatório", "Responsible contact is required"),
    });
  }

  if (!data.executorCompany.corporateName) {
    errors.push({
      field: "executorCompany.corporateName",
      messageKey: "executorCorporateNameRequired",
      message: msg("executorCorporateNameRequired", "Razão social da empresa executora obrigatória", "Executor company name is required"),
    });
  }

  if (!data.executorCompany.cnpj) {
    errors.push({
      field: "executorCompany.cnpj",
      messageKey: "executorCnpjRequired",
      message: msg("executorCnpjRequired", "CNPJ da empresa executora obrigatório", "Executor company CNPJ is required"),
    });
  }

  if (!data.executorCompany.address) {
    errors.push({
      field: "executorCompany.address",
      messageKey: "executorAddressRequired",
      message: msg("executorAddressRequired", "Endereço da empresa executora obrigatório", "Executor company address is required"),
    });
  }

  if (!data.executorCompany.technicalResponsible.name) {
    errors.push({
      field: "executorCompany.technicalResponsible.name",
      messageKey: "technicalResponsibleNameRequired",
      message: msg("technicalResponsibleNameRequired", "Nome do responsável técnico obrigatório", "Technical responsible name is required"),
    });
  }

  if (!data.executorCompany.technicalResponsible.creaCau) {
    errors.push({
      field: "executorCompany.technicalResponsible.creaCau",
      messageKey: "technicalResponsibleCreaCauRequired",
      message: msg("technicalResponsibleCreaCauRequired", "CREA/CAU do responsável técnico obrigatório", "Technical responsible CREA/CAU is required"),
    });
  }

  if (!data.inspector.name) {
    errors.push({
      field: "inspector.name",
      messageKey: "inspectorNameRequired",
      message: msg("inspectorNameRequired", "Nome do inspetor obrigatório", "Inspector name is required"),
    });
  }

  if (!data.inspector.role) {
    errors.push({
      field: "inspector.role",
      messageKey: "inspectorRoleRequired",
      message: msg("inspectorRoleRequired", "Cargo do inspetor obrigatório", "Inspector role is required"),
    });
  }

  if (!data.conclusion.technicalConclusionText) {
    errors.push({
      field: "conclusion.technicalConclusionText",
      messageKey: "technicalConclusionRequired",
      message: msg("technicalConclusionRequired", "Parecer técnico obrigatório", "Technical conclusion is required"),
    });
  }

  if (!data.declarationAccepted) {
    errors.push({
      field: "declarationAccepted",
      messageKey: "declarationRequired",
      message: msg("declarationRequired", "Declaração deve ser aceita", "Declaration must be accepted"),
    });
  }

  if (!data.photoEvidence.initialGaugePhotoIds || data.photoEvidence.initialGaugePhotoIds.length === 0) {
    errors.push({
      field: "photoEvidence.initialGaugePhotoIds",
      messageKey: "initialGaugePhotoRequired",
      message: msg("initialGaugePhotoRequired", "Foto inicial do manômetro obrigatória", "Initial gauge photo is required"),
    });
  }

  if (!data.photoEvidence.initialGeneralPhotoIds || data.photoEvidence.initialGeneralPhotoIds.length === 0) {
    errors.push({
      field: "photoEvidence.initialGeneralPhotoIds",
      messageKey: "initialGeneralPhotoRequired",
      message: msg("initialGeneralPhotoRequired", "Foto geral inicial obrigatória", "Initial general photo is required"),
    });
  }

  if (!data.photoEvidence.finalGaugePhotoIds || data.photoEvidence.finalGaugePhotoIds.length === 0) {
    errors.push({
      field: "photoEvidence.finalGaugePhotoIds",
      messageKey: "finalGaugePhotoRequired",
      message: msg("finalGaugePhotoRequired", "Foto final do manômetro obrigatória", "Final gauge photo is required"),
    });
  }

  if (!data.photoEvidence.finalGeneralPhotoIds || data.photoEvidence.finalGeneralPhotoIds.length === 0) {
    errors.push({
      field: "photoEvidence.finalGeneralPhotoIds",
      messageKey: "finalGeneralPhotoRequired",
      message: msg("finalGeneralPhotoRequired", "Foto geral final obrigatória", "Final general photo is required"),
    });
  }

  return errors;
}

export function isHydrostaticTestValid(data: HydrostaticTest, language: "en" | "pt-BR" = "pt-BR"): boolean {
  return validateHydrostaticTest(data, language).length === 0;
}
