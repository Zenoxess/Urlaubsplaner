import React from 'react';
import type { VacationPlan, UserInput } from '../types';

interface MonthlyDistributionChartProps {
  plan: VacationPlan;
  userInput: UserInput;
}

interface MonthlyUsage {
    carryOver: number;
    new: number;
    total: number;
}

const calculateMonthlyUsage = (plan: VacationPlan, userInput: UserInput): MonthlyUsage[] => {
    const monthlyUsage: MonthlyUsage[] = Array(12).fill(0).map(() => ({ carryOver: 0, new: 0, total: 0 }));
    const publicHolidays = new Set(plan.publicHolidays.map(h => h.date));
    
    // Create a daily map of vacation type
    const vacationDayMap = new Map<string, 'carryOver' | 'new'>();

    const sortedSuggestions = [...plan.suggestions].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    let carryOverDaysToAssign = userInput.vacationDaysCarryOver - plan.remainingVacationDaysCarryOver;
    let newDaysToAssign = userInput.vacationDaysNew - plan.remainingVacationDaysNew;

    for (const suggestion of sortedSuggestions) {
        let currentDate = new Date(suggestion.startDate + 'T12:00:00Z');
        const endDate = new Date(suggestion.endDate + 'T12:00:00Z');
        
        while(currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getUTCDay();

            if (userInput.workDays.includes(dayOfWeek) && !publicHolidays.has(dateString)) {
                if (carryOverDaysToAssign > 0) {
                    vacationDayMap.set(dateString, 'carryOver');
                    carryOverDaysToAssign--;
                } else if (newDaysToAssign > 0) {
                    vacationDayMap.set(dateString, 'new');
                    newDaysToAssign--;
                }
            }
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
    }
    
    // Aggregate daily data into monthly buckets
    for (const [dateString, type] of vacationDayMap.entries()) {
        const month = new Date(dateString + 'T12:00:00Z').getUTCMonth();
        if (type === 'carryOver') {
            monthlyUsage[month].carryOver++;
        } else {
            monthlyUsage[month].new++;
        }
        monthlyUsage[month].total++;
    }

    return monthlyUsage;
};


export const MonthlyDistributionChart: React.FC<MonthlyDistributionChartProps> = ({ plan, userInput }) => {
  const monthlyUsage = calculateMonthlyUsage(plan, userInput);
  const maxUsage = Math.max(...monthlyUsage.map(m => m.total), 1);
  const months = ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Verteilung der Urlaubstage</h3>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-orange-400 dark:bg-orange-500"></span>
                    <span className="text-slate-600 dark:text-slate-400">Übertrag (Alt)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-600"></span>
                    <span className="text-slate-600 dark:text-slate-400">Anspruch (Neu)</span>
                </div>
            </div>
        </div>
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-end h-40 space-x-1 md:space-x-2">
          {monthlyUsage.map((monthData, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end group h-full">
               <div className="relative w-full h-full flex items-end justify-center" title={`Gesamt: ${monthData.total} Tage\nAlt: ${monthData.carryOver} Tage\nNeu: ${monthData.new} Tage`}>
                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {monthData.total}
                 </div>
                 <div
                    className="w-3/4 rounded-t-md flex flex-col justify-end transition-all duration-300 ease-out"
                    style={{ height: `${(monthData.total / maxUsage) * 100}%` }}
                 >
                    <div className="bg-blue-400 dark:bg-blue-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-500 transition-colors" style={{ height: `${(monthData.new / monthData.total) * 100}%`}}></div>
                    <div className="bg-orange-400 dark:bg-orange-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-400 transition-colors" style={{ height: `${(monthData.carryOver / monthData.total) * 100}%`}}></div>
                 </div>
              </div>
              <span className="mt-2 text-xs text-slate-500 dark:text-slate-400 select-none">{months[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};