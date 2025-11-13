import React, { useState } from 'react';
import type { UserInput } from '../types';
import { GERMAN_STATES, WEEKDAYS, NEXT_YEAR } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

interface UserInputFormProps {
  onSubmit: (data: UserInput) => void;
}

export const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit }) => {
  const [state, setState] = useState<string>(GERMAN_STATES[0]);
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [vacationDaysNew, setVacationDaysNew] = useState<number>(30);
  const [vacationDaysCarryOver, setVacationDaysCarryOver] = useState<number>(0);
  const [carryOverExpires, setCarryOverExpires] = useState<string>(`${NEXT_YEAR}-03-31`);
  const [blockedPeriods, setBlockedPeriods] = useState<{ start: string; end: string }[]>([]);
  
  const [holidayPreference, setHolidayPreference] = useState<'in-holidays' | 'outside-holidays' | 'no-preference'>('no-preference');
  const [planningAmountType, setPlanningAmountType] = useState<'percentage' | 'days'>('percentage');
  const [planningAmountValue, setPlanningAmountValue] = useState<number>(100);
  
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState<string>('');
  const [seasonPreference, setSeasonPreference] = useState<'spring' | 'summer' | 'autumn' | 'winter' | 'no-preference'>('no-preference');


  const handleWorkDayToggle = (dayId: number) => {
    setWorkDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const addBlockedPeriod = () => {
    setBlockedPeriods([...blockedPeriods, { start: '', end: '' }]);
  };

  const updateBlockedPeriod = (index: number, field: 'start' | 'end', value: string) => {
    const newPeriods = [...blockedPeriods];
    newPeriods[index][field] = value;
    setBlockedPeriods(newPeriods);
  };

  const removeBlockedPeriod = (index: number) => {
    setBlockedPeriods(blockedPeriods.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      state,
      workDays,
      vacationDaysNew,
      vacationDaysCarryOver,
      vacationDaysCarryOverExpires: vacationDaysCarryOver > 0 ? carryOverExpires : undefined,
      blockedPeriods: blockedPeriods.filter(p => p.start && p.end),
      holidayPreference,
      planningAmount: {
        type: planningAmountType,
        value: planningAmountValue,
      },
      maxConsecutiveDays: maxConsecutiveDays ? parseInt(maxConsecutiveDays, 10) : undefined,
      seasonPreference,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Ihre Angaben</h2>
            <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bundesland</label>
                <select id="state" value={state} onChange={e => setState(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500">
                {GERMAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ihre Arbeitstage</label>
                <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day => (
                    <button type="button" key={day.id} onClick={() => handleWorkDayToggle(day.id)} className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${workDays.includes(day.id) ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                    {day.name}
                    </button>
                ))}
                </div>
            </div>
        </div>
        
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Urlaubstage für {NEXT_YEAR}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vacationDaysNew" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Neue Tage</label>
                <input type="number" id="vacationDaysNew" value={vacationDaysNew} onChange={e => setVacationDaysNew(parseInt(e.target.value, 10))} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" min="0" />
              </div>
              <div>
                <label htmlFor="vacationDaysCarryOver" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Übertrag</label>
                <input type="number" id="vacationDaysCarryOver" value={vacationDaysCarryOver} onChange={e => setVacationDaysCarryOver(parseInt(e.target.value, 10))} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" min="0" />
              </div>
            </div>
             {vacationDaysCarryOver > 0 && (
                <div className="mt-4">
                    <label htmlFor="carryOverExpires" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Übertrag verfällt am</label>
                    <input type="date" id="carryOverExpires" value={carryOverExpires} onChange={e => setCarryOverExpires(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" />
                </div>
            )}
             <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">Gesamt verfügbar:</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{vacationDaysNew + vacationDaysCarryOver}</p>
            </div>
        </div>
      </div>
      
       <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Ihre Präferenzen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ferienzeiten</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'in-holidays', label: 'In den Ferien' },
                            { id: 'outside-holidays', label: 'Außerhalb der Ferien' },
                            { id: 'no-preference', label: 'Egal' }
                        ].map(opt => (
                            <button key={opt.id} type="button" onClick={() => setHolidayPreference(opt.id as any)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${holidayPreference === opt.id ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bevorzugte Jahreszeit</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'spring', label: 'Frühling' },
                            { id: 'summer', label: 'Sommer' },
                            { id: 'autumn', label: 'Herbst' },
                            { id: 'winter', label: 'Winter' },
                            { id: 'no-preference', label: 'Egal' }
                        ].map(opt => (
                            <button key={opt.id} type="button" onClick={() => setSeasonPreference(opt.id as any)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${seasonPreference === opt.id ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Umfang der Planung</label>
                     <div className="flex items-center gap-2">
                        <div className="flex items-center p-1 rounded-md bg-slate-200 dark:bg-slate-600">
                            <button type="button" onClick={() => setPlanningAmountType('percentage')} className={`px-2 py-0.5 rounded text-sm transition-colors ${planningAmountType === 'percentage' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Prozent</button>
                            <button type="button" onClick={() => setPlanningAmountType('days')} className={`px-2 py-0.5 rounded text-sm transition-colors ${planningAmountType === 'days' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Tage</button>
                        </div>
                        <input type="number" value={planningAmountValue} onChange={(e) => setPlanningAmountValue(Number(e.target.value))} className="w-24 p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" min="0" max={planningAmountType === 'percentage' ? 100 : undefined}/>
                        <span className="text-slate-600 dark:text-slate-400">{planningAmountType === 'percentage' ? '%' : 'Tage'}</span>
                    </div>
                </div>
                 <div>
                    <label htmlFor="maxConsecutiveDays" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max. freie Tage am Stück</label>
                    <input type="number" id="maxConsecutiveDays" value={maxConsecutiveDays} onChange={e => setMaxConsecutiveDays(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" min="0" placeholder="Keine Begrenzung" />
                </div>
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Sperrzeiten (optional)</h2>
        <div className="space-y-3">
          {blockedPeriods.map((period, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
              <input type="date" value={period.start} onChange={e => updateBlockedPeriod(index, 'start', e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
              <span className="text-slate-500">-</span>
              <input type="date" value={period.end} onChange={e => updateBlockedPeriod(index, 'end', e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
              <button type="button" onClick={() => removeBlockedPeriod(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">&times;</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addBlockedPeriod} className="mt-4 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium">+ Sperrzeitraum hinzufügen</button>
      </div>
      
      <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
        <button type="submit" className="w-full flex items-center justify-center gap-2 text-lg px-6 py-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-white">
          <SparklesIcon className="w-6 h-6" />
          Urlaubsplan erstellen
        </button>
      </div>
    </form>
  );
};