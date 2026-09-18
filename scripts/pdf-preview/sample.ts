// Dados de exemplo realistas para a pré-visualização do relatório hidrostático.
import { createEmptyHydrostaticTest } from "@/types/hydrostaticTest";

export function sampleHydrostatic() {
  const h = createEmptyHydrostaticTest();
  h.systemType = "sprinklers";
  h.systemName = "ÁREA 1";
  h.buildingType = "I-3 INDÚSTRIA E J-4 DEPÓSITO > 1200 MJ/M2";
  h.protectedArea = "SABOARIA - PRÉDIO ULTRA LOGISTIC (INTERNO / EXTERNO) - PRÉDIO FORMIGUINHAS (INTERNO / EXTERNO) E ANEXOS - ALMOXARIFADO CENTRAL E ANEXOS - TANCAGEM";
  h.normRefs = ["NFPA_13", "NFPA_14", "NFPA_25", "FM_GLOBAL", "NBR"] as any;
  h.fmDataSheet = "FMDS 2-0";
  h.nbrStandard = "10897";
  h.approvedBy = "CB" as any;
  h.testDate = "2026-09-15";
  h.startTime = "08:30";
  h.endTime = "13:00";
  h.weather = "ENSOLARADO" as any;

  h.owner = { corporateName: "JONEL ENGENHARIA LTDA", address: "AV. INDUSTRIAL, 1200 - DISTRITO INDUSTRIAL - CAMPINAS/SP", localResponsible: "CARLOS EDUARDO RAMOS", role: "GERENTE DE MANUTENÇÃO", contact: "(19) 99999-1234" };
  h.executorCompany = { corporateName: "FIRESAFE SERVIÇOS DE ENGENHARIA LTDA", cnpj: "12.345.678/0001-90", address: "RUA DAS ACÁCIAS, 45 - CENTRO - CAMPINAS/SP", technicalResponsible: { name: "ENG. MARIANA COSTA", creaCau: "CREA-SP 5069871234", artRrt: "ART 28027230251234567" } };
  h.inspector = { name: "CLEITON TOLENTINO", role: "INSPETOR NFPA 25", signedAt: "2026-09-15T13:10:00.000Z" };

  h.preChecks = { installedAsApprovedProject: true, pipesAnchoredAndSupported: true, valvesCorrectlyInstalled: true, visibleConnectionsAccessible: true, untestedSectionsIsolated: true, sensitiveEquipmentProtected: false };
  h.instrumentation = { manometerBrand: "WIKA", manometerModel: "233.50", measurementRange: "0 A 600 PSI", calibrationCertificate: "CAL-2026-0456", pressureReadingPoint: "HIGHEST_POINT" as any };
  h.filling = { method: "GRADUAL" as any, airElimination: { reliefValvesOpen: true, purgersUsed: true } };
  h.pressure = { workingPressureValue: "150", workingPressureUnit: "PSI" as any, testPressureValue: "200", testPressureUnit: "PSI" as any, normativeCriteriaText: "PRESSÃO DE TESTE = PRESSÃO DE TRABALHO + 50 PSI, MANTIDA POR 2 HORAS SEM PERDA DE PRESSÃO (NFPA 13, CAP. 25).", minimumTestTimeValue: "2", minimumTestTimeUnit: "HOURS" as any };
  h.monitoring = { stabilizationStartTime: "09:15", testEndTime: "11:15", initialPressureValue: "200", initialPressureUnit: "PSI" as any, finalPressureValue: "199", finalPressureUnit: "PSI" as any, pressureVariationValue: "1", pressureVariationUnit: "PSI" as any };
  h.results = { noLeaks: true, noPressureDrop: true, noVisibleDeformation: true, leaksFound: false, pressureDropAboveAllowed: false, structuralFailure: false };
  h.conclusion = { status: "APPROVED" as any, technicalConclusionText: "O SISTEMA FOI SUBMETIDO AO ENSAIO HIDROSTÁTICO CONFORME OS CRITÉRIOS NORMATIVOS APLICÁVEIS, NÃO APRESENTANDO VAZAMENTOS, QUEDA DE PRESSÃO ACIMA DO ADMISSÍVEL OU DEFORMAÇÕES VISÍVEIS. O SISTEMA ESTÁ APTO PARA OPERAÇÃO." };
  h.observations = "DURANTE O ENSAIO FOI NECESSÁRIO ISOLAR O TRECHO DO ALMOXARIFADO CENTRAL POR INDISPONIBILIDADE DE ACESSO. O TRECHO SERÁ ENSAIADO EM DATA COMPLEMENTAR.";
  h.signatures = { dates: { technicalResponsibleDate: "2026-09-15", inspectorDate: "2026-09-15", ownerRepDate: "2026-09-15" } };
  h.geoLocation = { latitude: -22.9099, longitude: -47.0626, accuracy: 8, timestamp: "2026-09-15T08:32:00.000Z" } as any;
  h.photoEvidence = {
    initialGaugePhotoIds: ["p1"], initialGeneralPhotoIds: ["p2"], duringTestPhotoIds: [], finalGaugePhotoIds: ["p3"], finalGeneralPhotoIds: ["p4"],
  };
  return h;
}

// PNG 1x1 cinza (as fotos reais entram como data URI da mesma forma).
const PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

export function samplePhotos() {
  return ["p1", "p2", "p3", "p4"].map((id, i) => ({
    id, uri: "", base64: PIXEL, caption: ["initialGaugePhotoIds", "initialGeneralPhotoIds", "finalGaugePhotoIds", "finalGeneralPhotoIds"][i],
    timestamp: "2026-09-15T09:00:00.000Z",
  }));
}

export function sampleInspection(h: any) {
  return {
    id: "insp-preview", type: "hydrostatic_test", status: "completed",
    propertyId: "", propertyName: h.owner.corporateName, propertyAddress: h.owner.address, propertyPhone: h.owner.contact,
    inspectorName: h.inspector.name, contractNo: "CT-2026-118", date: h.testDate, frequency: "annually",
    checklist: [], observations: "", signature: null, photos: samplePhotos(),
    geoLocation: h.geoLocation, hydrostaticTest: h,
    createdAt: "2026-09-15T08:00:00.000Z", updatedAt: "2026-09-15T13:10:00.000Z",
  };
}
