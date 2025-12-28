
export interface Vaccine {
  name: string;
  hindiName: string;
  dueDate: Date;
  age: string;
  description: string;
}

export interface CalculationResult {
  lmp?: Date;
  edd?: Date;
  gestationalAgeWeeks?: number;
  gestationalAgeDays?: number;
  vaccines?: Vaccine[];
}

export enum TabType {
  PREGNANCY = 'pregnancy',
  VACCINATION = 'vaccination',
  TOOLS = 'tools',
  ASSISTANT = 'assistant'
}
