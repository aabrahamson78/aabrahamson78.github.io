import { DisasterDeclaration, RegistrationSummary, ValidRegistration } from '../types';

const API_BASE = "https://www.fema.gov/api/open/v2";

export const femaService = {
  async fetchDisasters(filters: { query?: string; year?: string; state?: string; county?: string }): Promise<DisasterDeclaration[]> {
    let filterParts = ["ihProgramDeclared eq true"];

    if (filters.query) {
      const cleanQuery = filters.query.replace(/'/g, "''");
      filterParts.push(`contains(declarationTitle, '${cleanQuery}')`);
    }

    if (filters.year) {
      filterParts.push(`declarationDate ge '${filters.year}-01-01T00:00:00.000Z' and declarationDate le '${filters.year}-12-31T23:59:59.000Z'`);
    }

    if (filters.state) {
      filterParts.push(`state eq '${filters.state}'`);
    }

    if (filters.state && filters.county) {
      filterParts.push(`contains(designatedArea, '${filters.county.replace(/'/g, "''")}')`);
    }

    const filter = filterParts.join(' and ');
    const response = await fetch(`${API_BASE}/DisasterDeclarationsSummaries?$filter=${encodeURIComponent(filter)}&$orderby=declarationDate desc&$top=1000`);
    const data = await response.json();
    const rawDisasters = data.DisasterDeclarationsSummaries || [];

    const seen = new Set();
    const uniqueDisasters: DisasterDeclaration[] = [];
    
    for (const d of rawDisasters) {
      if (!seen.has(d.disasterNumber)) {
        seen.add(d.disasterNumber);
        uniqueDisasters.push(d);
      }
      if (uniqueDisasters.length >= 100) break;
    }
    
    return uniqueDisasters;
  },

  async fetchRegistrationSummaries(disasterNumber: number, county?: string): Promise<RegistrationSummary[]> {
    let allSummaries: RegistrationSummary[] = [];
    let skip = 0;
    const top = 1000;

    let summaryFilter = `disasterNumber eq ${disasterNumber}`;
    if (county) {
      summaryFilter += ` and contains(county, '${county.replace(/'/g, "''")}')`;
    }

    while (true) {
      const response = await fetch(`${API_BASE}/RegistrationIntakeIndividualsHouseholdPrograms?$filter=${encodeURIComponent(summaryFilter)}&$top=${top}&$skip=${skip}`);
      const data = await response.json();
      const batch = data.RegistrationIntakeIndividualsHouseholdPrograms || [];
      allSummaries = allSummaries.concat(batch);
      if (batch.length < top) break;
      skip += top;
    }

    return allSummaries;
  },

  async fetchRegistrationSample(disasterNumber: number, county?: string): Promise<ValidRegistration[]> {
    let regFilter = `disasterNumber eq ${disasterNumber}`;
    if (county) {
      regFilter += ` and county eq '${county.replace(/'/g, "''")}'`;
    }
    const response = await fetch(`${API_BASE}/IndividualsAndHouseholdsProgramValidRegistrations?$filter=${encodeURIComponent(regFilter)}&$top=5000`);
    const data = await response.json();
    return data.IndividualsAndHouseholdsProgramValidRegistrations || [];
  },

  async fetchCountiesForState(state: string): Promise<string[]> {
    const response = await fetch(`${API_BASE}/DisasterDeclarationsSummaries?$filter=state eq '${state}' and ihProgramDeclared eq true&$select=designatedArea&$top=1000`);
    const data = await response.json();
    const areas = data.DisasterDeclarationsSummaries || [];
    return [...new Set(areas.map((a: any) => a.designatedArea))].sort() as string[];
  }
};
