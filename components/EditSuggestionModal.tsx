import React, { useState, useEffect } from 'react';
import type { VacationSuggestion } from '../types';

interface EditSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSuggestion: { title: string; startDate: string; endDate: string }) => void;
  onDelete: () => void;
  suggestion: VacationSuggestion;
}

export const EditSuggestionModal: React.FC<EditSuggestionModalProps> = ({ isOpen, onClose, onSave, onDelete, suggestion }) => {
  const [title, setTitle] = useState(suggestion.title);
  const [startDate, setStartDate] = useState(suggestion.startDate);
  const [endDate, setEndDate] = useState(suggestion.endDate);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(suggestion.title);
    setStartDate(suggestion.startDate);
    setEndDate(suggestion.endDate);
    setError('');
  }, [suggestion]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (new Date(endDate) < new Date(startDate)) {
        setError('Das Enddatum darf nicht vor dem Startdatum liegen.');
        return;
    }
    if (!title.trim()) {
        setError('Der Titel darf nicht leer sein.');
        return;
    }
    setError('');
    onSave({ title, startDate, endDate });
  };

  const handleDelete = () => {
    if (window.confirm(`Möchten Sie den Urlaub "${suggestion.title}" wirklich löschen?`)) {
        onDelete();
    }
  }
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  }

  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Urlaub bearbeiten</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{suggestion.title}</p>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titel</label>
                <input
                    type="text"
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500"
                />
            </div>
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Startdatum</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500"
                />
            </div>
             <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enddatum</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500"
                />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center rounded-b-xl">
            <button
                onClick={handleDelete}
                type="button"
                className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border border-transparent rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
            >
                Löschen
            </button>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                    Abbrechen
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-800 dark:bg-slate-200 dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-white transition-colors"
                >
                    Speichern
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};