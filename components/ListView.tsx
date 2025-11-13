import React, { useState } from 'react';
import type { VacationSuggestion } from '../types';
import { getTravelSuggestion } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoadingSpinner } from './LoadingSpinner';

const TravelSuggestionDisplay: React.FC<{ suggestion: VacationSuggestion }> = ({ suggestion }) => {
    const [travelIdeas, setTravelIdeas] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchIdeas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ideas = await getTravelSuggestion(suggestion);
            setTravelIdeas(ideas);
        } catch (e) {
            setError("Konnte keine Reisevorschläge abrufen.");
        } finally {
            setIsLoading(false);
        }
    };

    if (travelIdeas) {
         // Simple markdown to HTML
        const formatText = (text: string) => {
            return text
                .split('\n')
                .map(line => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                        return `<p class="font-bold mt-2">${line.replace(/\*\*/g, '')}</p>`;
                    }
                    if (line.startsWith('- [')) {
                         const match = line.match(/- \[(.*?)\]\((.*?)\)/);
                         if (match) {
                           return `<li class="ml-4 list-disc"><a href="${match[2]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${match[1]}</a></li>`;
                         }
                    }
                    return `<p>${line}</p>`;
                })
                .join('');
        };
        return <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: formatText(travelIdeas) }} />;
    }

    return (
        <div className="mt-4">
            {isLoading ? (
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <LoadingSpinner />
                    <span className="ml-2">Suche nach Reiseideen...</span>
                </div>
            ) : (
                <button
                    onClick={handleFetchIdeas}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                >
                    <SparklesIcon className="w-4 h-4" />
                    Reiseideen erhalten
                </button>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};


export const ListView: React.FC<{ suggestions: VacationSuggestion[] }> = ({ suggestions }) => {
    
  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      // Adjust for timezone offset
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
      return adjustedDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
    
  return (
    <div className="space-y-4">
      {suggestions.map((s, index) => (
        <div key={index} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-lg transform transition-transform hover:scale-[1.01] hover:shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{s.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(s.startDate)} - {formatDate(s.endDate)}</p>
              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Basiert auf: {s.relatedHoliday}</p>
            </div>
            <div className="flex items-center gap-4 mt-3 md:mt-0 text-center md:text-right">
                <div>
                    <span className="block text-xl font-bold text-red-600 dark:text-red-500">{s.vacationDaysUsed}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Urlaubstage</span>
                    {(s.vacationDaysUsedFromCarryOver > 0 || s.vacationDaysUsedFromNew > 0) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">({s.vacationDaysUsedFromCarryOver} Alt + {s.vacationDaysUsedFromNew} Neu)</p>
                    )}
                </div>
                <div className="text-2xl font-light text-slate-300 dark:text-slate-600">→</div>
                 <div>
                    <span className="block text-xl font-bold text-green-600 dark:text-green-500">{s.totalDaysOff}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Tage frei</span>
                </div>
            </div>
          </div>
          <TravelSuggestionDisplay suggestion={s} />
        </div>
      ))}
    </div>
  );
};