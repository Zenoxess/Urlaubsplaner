
import React, { useState, useCallback } from 'react';
import { UserInputForm } from './components/UserInputForm';
import { ResultsView } from './components/ResultsView';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateVacationPlan } from './services/geminiService';
import type { UserInput, VacationPlan } from './types';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [vacationPlan, setVacationPlan] = useState<VacationPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanRequest = useCallback(async (input: UserInput) => {
    setIsLoading(true);
    setError(null);
    setVacationPlan(null);
    setUserInput(input);
    try {
      const plan = await generateVacationPlan(input);
      setVacationPlan(plan);
    } catch (e) {
      console.error(e);
      setError('Fehler bei der Erstellung des Urlaubsplans. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setUserInput(null);
    setVacationPlan(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-7xl">
        {!vacationPlan && !isLoading && <UserInputForm onSubmit={handlePlanRequest} />}
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <LoadingSpinner />
                <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Erstelle deinen optimalen Urlaubsplan...</p>
                <p className="text-slate-500 dark:text-slate-400">Dies kann einen Moment dauern.</p>
            </div>
        )}
        
        {error && !isLoading && (
            <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl shadow-lg">
                <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
                <button 
                    onClick={handleReset}
                    className="mt-4 px-6 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                    Erneut versuchen
                </button>
            </div>
        )}
        
        {vacationPlan && userInput && !isLoading && (
          <ResultsView plan={vacationPlan} userInput={userInput} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;