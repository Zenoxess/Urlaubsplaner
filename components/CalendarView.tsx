import React from 'react';
import type { VacationPlan, UserInput } from '../types';
import { NEXT_YEAR } from '../constants';

interface CalendarViewProps {
  plan: VacationPlan;
  userInput: UserInput;
  onEditSuggestion: (index: number) => void;
  selectionStart: string | null;
  onDateSelect: (dateString: string) => void;
}

const getDayInfo = (date: Date, plan: VacationPlan, userInput: UserInput, selectionStart: string | null): { className: string; title?: string, suggestionIndex?: number } => {
  const baseClass = 'w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors duration-200';
  const dayOfWeek = date.getUTCDay();
  const dateString = date.toISOString().split('T')[0];

  // 1. Blocked periods (highest priority)
  for (const period of userInput.blockedPeriods) {
      if (period.start && period.end) {
          const startDate = new Date(period.start + 'T00:00:00Z');
          const endDate = new Date(period.end + 'T00:00:00Z');
          
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              if (date >= startDate && date <= endDate) {
                  return {
                    className: `${baseClass} bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300 line-through cursor-not-allowed`,
                    title: 'Gesperrter Zeitraum'
                  };
              }
          }
      }
  }
  
  // Highlight for new selection
  if (selectionStart === dateString) {
    return {
      className: `${baseClass} bg-blue-300 text-blue-800 ring-2 ring-blue-500 dark:bg-blue-700 dark:text-blue-100 cursor-pointer`,
      title: 'Startdatum ausgewählt. Wählen Sie ein Enddatum.',
    };
  }

  const suggestionIndex = plan.suggestions.findIndex(s => dateString >= s.startDate && dateString <= s.endDate);
  const holiday = plan.publicHolidays?.find(h => h.date === dateString);
  const isWorkDay = userInput.workDays.includes(dayOfWeek);

  // 2. Vacation suggestions
  if (suggestionIndex !== -1) {
      const suggestion = plan.suggestions[suggestionIndex];
      const suggestionTitle = `${suggestion.title} (${suggestion.vacationDaysUsedFromCarryOver} Tage Übertrag, ${suggestion.vacationDaysUsedFromNew} Tage neu)`;

      if (isWorkDay && !holiday) {
          return {
            className: `${baseClass} bg-green-500 text-white font-bold shadow cursor-pointer hover:bg-green-600`,
            title: suggestionTitle,
            suggestionIndex: suggestionIndex
          };
      }
      
      if (holiday) {
          return {
            className: `${baseClass} bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-300 font-semibold cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-500/40`,
            title: `${holiday.name} (Teil von '${suggestion.title}')`,
            suggestionIndex: suggestionIndex
          };
      }

      if (!isWorkDay) {
          return {
            className: `${baseClass} bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer`,
            title: `Wochenende (Teil von '${suggestion.title}')`,
            suggestionIndex: suggestionIndex
          };
      }
  }

  // 3. Not in a vacation suggestion
  if (holiday) {
      return {
        className: `${baseClass} bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-300 font-semibold cursor-pointer`,
        title: holiday.name
      };
  }
  
  if (!isWorkDay) {
    return { className: `${baseClass} text-slate-400 dark:text-slate-500 cursor-pointer` };
  }

  // 4. Default workday
  return { className: `${baseClass} hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer` };
};

const Month: React.FC<{ month: number; plan: VacationPlan; userInput: UserInput; onEditSuggestion: (index: number) => void; selectionStart: string | null; onDateSelect: (dateString: string) => void; }> = ({ month, plan, userInput, onEditSuggestion, selectionStart, onDateSelect }) => {
  const date = new Date(NEXT_YEAR, month, 1);
  const monthName = date.toLocaleString('de-DE', { month: 'long' });
  
  const daysInMonth = new Date(NEXT_YEAR, month + 1, 0).getDate();
  const firstDayOfMonth = (new Date(NEXT_YEAR, month, 1).getDay() + 6) % 7; // 0=Monday

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekDays = ['Mo','Di','Mi','Do','Fr','Sa','So'];


  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <h3 className="font-bold text-center mb-2 text-slate-800 dark:text-slate-100">{monthName}</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400 mb-1">
        {weekDays.map(day => <div key={day} className="flex justify-center items-center font-semibold">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => <div key={`b-${b}`}></div>)}
        {days.map(day => {
          const currentDate = new Date(Date.UTC(NEXT_YEAR, month, day));
          const { className, title, suggestionIndex } = getDayInfo(currentDate, plan, userInput, selectionStart);
          return (
            <div 
                key={day} 
                className={className} 
                title={title}
                onClick={() => {
                    if (suggestionIndex !== undefined) {
                        onEditSuggestion(suggestionIndex);
                    } else if (!className.includes('cursor-not-allowed')) {
                        onDateSelect(currentDate.toISOString().split('T')[0]);
                    }
                }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ plan, userInput, onEditSuggestion, selectionStart, onDateSelect }) => {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
            Klicken Sie auf ein Start- und Enddatum, um einen neuen Urlaub hinzuzufügen.{' '}
            {selectionStart && <span className="font-semibold text-slate-700 dark:text-slate-200">Wählen Sie nun ein Enddatum.</span>}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mb-6 text-sm">
            <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
                <span>Urlaub</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-500/30"></span>
                <span>Feiertag</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-200 dark:bg-red-900/40"></span>
                <span>Sperrzeit</span>
            </div>
             <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-slate-500"></span>
                <span>Wochenende</span>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map(m => <Month key={m} month={m} plan={plan} userInput={userInput} onEditSuggestion={onEditSuggestion} selectionStart={selectionStart} onDateSelect={onDateSelect}/>)}
        </div>
    </div>
  );
};