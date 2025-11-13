export interface UserInput {
  state: string;
  workDays: number[];
  vacationDaysNew: number;
  vacationDaysCarryOver: number;
  vacationDaysCarryOverExpires?: string;
  blockedPeriods: { start: string; end: string }[];
  holidayPreference: 'in-holidays' | 'outside-holidays' | 'no-preference';
  planningAmount: {
    type: 'percentage' | 'days';
    value: number;
  };
  maxConsecutiveDays?: number;
  seasonPreference: 'spring' | 'summer' | 'autumn' | 'winter' | 'no-preference';
}

export interface VacationSuggestion {
  title: string;
  startDate: string;
  endDate: string;
  vacationDaysUsed: number;
  vacationDaysUsedFromCarryOver: number;
  vacationDaysUsedFromNew: number;
  totalDaysOff: number;
  relatedHoliday: string;
}

export interface PublicHoliday {
    name: string;
    date: string;
}

export interface VacationPlan {
  suggestions: VacationSuggestion[];
  remainingVacationDaysNew: number;
  remainingVacationDaysCarryOver: number;
  publicHolidays: PublicHoliday[];
}

export type ViewMode = 'list' | 'calendar';