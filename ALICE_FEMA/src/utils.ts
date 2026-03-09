import { ValidRegistration, ALICECategory } from './types';

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

export function getHouseholdSize(reg: ValidRegistration): number {
  const size =
    parseInt(String(reg.occupantsUnderTwo || 0)) +
    parseInt(String(reg.occupants2to5 || 0)) +
    parseInt(String(reg.occupants6to18 || 0)) +
    parseInt(String(reg.occupants19to64 || 0)) +
    parseInt(String(reg.occupants65andOver || 0));

  return Math.max(size, 1);
}

export function parseIncomeBandToMidpoint(incomeBand: string | null): number | null {
  const incomeMap: Record<string, number> = {
    '0': 0,
    '<$15,000': 7500,
    '$15,000-$30,000': 22500,
    '$30,001-$60,000': 45000,
    '$60,001-$120,000': 90000,
    '$120,001-$175,000': 147500,
    '>$175,000': 175001
  };

  if (incomeBand === null || incomeBand === undefined) return null;

  const cleaned = String(incomeBand).trim();
  return incomeMap[cleaned] ?? null;
}

const POVERTY_BY_HH_SIZE: Record<number, number> = {
  1: 15060,
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
  6: 41960,
  7: 47340,
  8: 52720
};

const ALICE_BY_HH_SIZE: Record<number, number> = {
  1: 35000,
  2: 50000,
  3: 65000,
  4: 80000,
  5: 95000,
  6: 110000,
  7: 125000,
  8: 140000
};

function getThresholdForSize(table: Record<number, number>, hhSize: number): number {
  if (table[hhSize]) return table[hhSize];

  const maxDefined = Math.max(...Object.keys(table).map(Number));
  if (hhSize > maxDefined) {
    return table[maxDefined] + ((hhSize - maxDefined) * 12000);
  }

  return table[1];
}

export function getALICECategory(reg: ValidRegistration): ALICECategory {
  const hhSize = getHouseholdSize(reg);
  const incomeValue = parseIncomeBandToMidpoint(reg.grossIncome);

  if (incomeValue === null) return 'Unknown';

  const povertyThreshold = getThresholdForSize(POVERTY_BY_HH_SIZE, hhSize);
  const aliceThreshold = getThresholdForSize(ALICE_BY_HH_SIZE, hhSize);

  if (incomeValue < povertyThreshold) return 'Poverty';
  if (incomeValue < aliceThreshold) return 'ALICE';
  return 'Above ALICE';
}
