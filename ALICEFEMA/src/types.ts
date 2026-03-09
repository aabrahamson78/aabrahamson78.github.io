export interface DisasterDeclaration {
  id: string;
  disasterNumber: number;
  declarationDate: string;
  declarationTitle: string;
  state: string;
  designatedArea: string;
  ihProgramDeclared: boolean;
  incidentType: string;
  incidentBeginDate: string;
  incidentEndDate?: string;
}

export interface RegistrationSummary {
  disasterNumber: number;
  county: string;
  zipCode?: string;
  damagedZipCode?: string;
  totalValidRegistrations: number;
  ihpAmount: number;
  haAmount: number;
  onaAmount: number;
}

export interface ValidRegistration {
  id: string;
  disasterNumber: number;
  county: string;
  zipCode?: string;
  ownRent: 'O' | 'R' | string;
  grossIncome: string;
  ihpEligible: boolean;
  ihpAmount: number;
  haAmount: number;
  onaAmount: number;
  rentalAssistanceAmount: number;
  repairAmount: number;
  replacementAmount: number;
  personalPropertyAmount: number;
  occupantsUnderTwo: number;
  occupants2to5: number;
  occupants6to18: number;
  occupants19to64: number;
  occupants65andOver: number;
  applicantAge?: string;
  householdComposition?: string;
  residenceType?: string;
  renterDamageLevel?: string;
  selfAssessmentInformation?: string;
  homeOwnersInsurance?: boolean;
  floodInsurance?: boolean;
}

export type ALICECategory = 'Above ALICE' | 'ALICE' | 'Poverty' | 'Unknown';

export interface SocioeconomicData {
  total: number;
  approved: number;
  denied: number;
  ihpAmount: number;
  haAmount: number;
  onaAmount: number;
  rentalAmount: number;
  repairAmount: number;
  personalPropertyAmount: number;
  otherAmount: number;
  rentalCount: number;
  repairCount: number;
  propCount: number;
  otherCount: number;
  ownerAmount: number;
  renterAmount: number;
  ownerCount: number;
  renterCount: number;
}
