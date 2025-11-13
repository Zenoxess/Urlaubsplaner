import React, { useState, useEffect } from 'react';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { MonthlyDistributionChart } from './MonthlyDistributionChart';
import type { UserInput, VacationPlan, VacationSuggestion, ViewMode } from '../types';
import { ListIcon } from './icons/ListIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { EditSuggestionModal } from './EditSuggestionModal';
import { CreateSuggestionModal } from './CreateSuggestionModal';
import { NEXT_YEAR } from '../constants';

interface ResultsViewProps {
  plan: VacationPlan;
  userInput: UserInput;
  onReset: () => void;
}

const countWorkDays = (startDateStr: string, endDateStr: string, workDays: number[], publicHolidays: Set<string>): number => {
    let count = 0;
    const currentDate = new Date(startDateStr + 'T12:00:00Z');
    const endDate = new Date(endDateStr + 'T12:00:00Z');

    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getUTCDay();

        if (workDays.includes(dayOfWeek) && !publicHolidays.has(dateString)) {
            count++;
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return count;
};

const countTotalDaysOff = (startDateStr: string, endDateStr: string): number => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

// Recalculates the distribution of carry-over and new vacation days across all suggestions.
// This enforces the rule that carry-over days are always used first.
const recalculatePlanDays = (
    suggestions: VacationSuggestion[],
    userInput: UserInput,
    publicHolidays: Set<string>
): Omit<VacationPlan, 'publicHolidays'> => {
    let remainingCarryOver = userInput.vacationDaysCarryOver;
    let remainingNew = userInput.vacationDaysNew;

    const sortedSuggestions = [...suggestions].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const updatedSuggestions = sortedSuggestions.map(suggestion => {
        const workDaysInPeriod = countWorkDays(suggestion.startDate, suggestion.endDate, userInput.workDays, publicHolidays);
        
        const usedFromCarryOver = Math.min(workDaysInPeriod, remainingCarryOver);
        const usedFromNew = Math.min(workDaysInPeriod - usedFromCarryOver, remainingNew);

        remainingCarryOver -= usedFromCarryOver;
        remainingNew -= usedFromNew;

        return {
            ...suggestion,
            vacationDaysUsed: usedFromCarryOver + usedFromNew,
            vacationDaysUsedFromCarryOver: usedFromCarryOver,
            vacationDaysUsedFromNew: usedFromNew,
            totalDaysOff: countTotalDaysOff(suggestion.startDate, suggestion.endDate)
        };
    });
    
    return {
        suggestions: updatedSuggestions,
        remainingVacationDaysCarryOver: remainingCarryOver,
        remainingVacationDaysNew: remainingNew,
    };
};


export const ResultsView: React.FC<ResultsViewProps> = ({ plan, userInput, onReset }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editablePlan, setEditablePlan] = useState<VacationPlan>(plan);
  const [editingSuggestionIndex, setEditingSuggestionIndex] = useState<number | null>(null);

  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newVacationDates, setNewVacationDates] = useState<{ startDate: string; endDate: string } | null>(null);

  useEffect(() => {
    // Sanitize the plan from Gemini on load to enforce the carry-over rule client-side.
    // This corrects any inaccuracies from the AI and ensures consistency.
    const publicHolidaysSet = new Set(plan.publicHolidays.map(h => h.date));
    const recalculatedData = recalculatePlanDays(plan.suggestions, userInput, publicHolidaysSet);
    
    setEditablePlan({
        publicHolidays: plan.publicHolidays, // Keep the full holiday list from the original plan
        ...recalculatedData
    });
  }, [plan, userInput]);

  const totalDays = userInput.vacationDaysNew + userInput.vacationDaysCarryOver;
  const totalUsedDays = editablePlan.suggestions.reduce((sum, s) => sum + s.vacationDaysUsed, 0);

  const handleEditSuggestion = (index: number) => {
    setEditingSuggestionIndex(index);
  };

  const handleCloseModal = () => {
    setEditingSuggestionIndex(null);
  };

  const handleDateSelect = (dateString: string) => {
    if (!selectionStart) {
      setSelectionStart(dateString);
    } else {
      const start = new Date(selectionStart);
      const end = new Date(dateString);

      if (start <= end) {
        setNewVacationDates({ startDate: selectionStart, endDate: dateString });
      } else {
        setNewVacationDates({ startDate: dateString, endDate: selectionStart });
      }

      setCreateModalOpen(true);
      setSelectionStart(null); // Reset selection
    }
  };

  const handleCreateSuggestion = (newSuggestionData: { title: string; startDate: string; endDate: string }) => {
    const publicHolidaysSet = new Set(editablePlan.publicHolidays.map(h => h.date));
    const newSuggestions = [...editablePlan.suggestions];

    const newSuggestion: VacationSuggestion = {
      title: newSuggestionData.title,
      startDate: newSuggestionData.startDate,
      endDate: newSuggestionData.endDate,
      vacationDaysUsed: 0, // Will be calculated by recalculatePlanDays
      vacationDaysUsedFromCarryOver: 0, // Will be calculated
      vacationDaysUsedFromNew: 0, // Will be calculated
      totalDaysOff: 0, // Will be calculated
      relatedHoliday: 'Manuell hinzugefügt',
    };

    newSuggestions.push(newSuggestion);

    const recalculatedData = recalculatePlanDays(newSuggestions, userInput, publicHolidaysSet);

    setEditablePlan({
      ...editablePlan,
      ...recalculatedData,
    });

    setCreateModalOpen(false);
  };

  const handleSaveSuggestion = (updatedSuggestionData: { title: string; startDate: string; endDate: string }) => {
    if (editingSuggestionIndex === null) return;
    
    const publicHolidaysSet = new Set(editablePlan.publicHolidays.map(h => h.date));
    const newSuggestions = [...editablePlan.suggestions];
    const suggestionToUpdate = newSuggestions[editingSuggestionIndex];
    
    const updatedSuggestion: VacationSuggestion = {
        ...suggestionToUpdate,
        title: updatedSuggestionData.title,
        startDate: updatedSuggestionData.startDate,
        endDate: updatedSuggestionData.endDate,
    };
    
    newSuggestions[editingSuggestionIndex] = updatedSuggestion;
    
    const recalculatedData = recalculatePlanDays(newSuggestions, userInput, publicHolidaysSet);

    setEditablePlan({
        ...editablePlan,
        ...recalculatedData
    });

    handleCloseModal();
  };

  const handleDeleteSuggestion = () => {
    if (editingSuggestionIndex === null) return;

    const publicHolidaysSet = new Set(editablePlan.publicHolidays.map(h => h.date));
    const newSuggestions = editablePlan.suggestions.filter((_, index) => index !== editingSuggestionIndex);
    
    const recalculatedData = recalculatePlanDays(newSuggestions, userInput, publicHolidaysSet);

    setEditablePlan({
        ...editablePlan,
        ...recalculatedData
    });
    
    handleCloseModal();
  };
  
  const editingSuggestion = editingSuggestionIndex !== null ? editablePlan.suggestions[editingSuggestionIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Ihr Urlaubsplan für {NEXT_YEAR}</h2>
          <p className="text-slate-500 dark:text-slate-400">Generiert für {userInput.state}</p>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Neu planen
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Verfügbar</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalDays}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-lg text-center">
            <p className="text-sm text-green-700 dark:text-green-400">Verplant</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">{totalUsedDays}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-400">Übertrag (Alt)</p>
            <p className="text-lg font-bold text-orange-800 dark:text-orange-300">
                {userInput.vacationDaysCarryOver - editablePlan.remainingVacationDaysCarryOver} / {userInput.vacationDaysCarryOver}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{editablePlan.remainingVacationDaysCarryOver} übrig</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">Anspruch (Neu)</p>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                {userInput.vacationDaysNew - editablePlan.remainingVacationDaysNew} / {userInput.vacationDaysNew}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{editablePlan.remainingVacationDaysNew} übrig</p>
        </div>
      </div>


      <div className="my-8">
        <MonthlyDistributionChart plan={editablePlan} userInput={userInput} />
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
          <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`}>
            <ListIcon className="w-5 h-5" /> Liste
          </button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`}>
            <CalendarIcon className="w-5 h-5" /> Kalender
          </button>
        </div>
      </div>
      
      <div>
        {viewMode === 'list' ? (
          <ListView suggestions={editablePlan.suggestions} />
        ) : (
          <CalendarView
            plan={editablePlan}
            userInput={userInput}
            onEditSuggestion={handleEditSuggestion}
            selectionStart={selectionStart}
            onDateSelect={handleDateSelect}
          />
        )}
      </div>
      
      {editingSuggestion && (
        <EditSuggestionModal
            isOpen={editingSuggestionIndex !== null}
            onClose={handleCloseModal}
            onSave={handleSaveSuggestion}
            onDelete={handleDeleteSuggestion}
            suggestion={editingSuggestion}
        />
      )}

      {isCreateModalOpen && newVacationDates && (
        <CreateSuggestionModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setSelectionStart(null);
          }}
          onSave={handleCreateSuggestion}
          startDate={newVacationDates.startDate}
          endDate={newVacationDates.endDate}
        />
      )}
    </div>
  );
};