import React, { useState } from 'react';

interface CreateSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSuggestion: { title: string; startDate: string; endDate: string }) => void;
  startDate: string;
  endDate: string;
}

export const CreateSuggestionModal: React.FC<CreateSuggestionModalProps> = ({ isOpen, onClose, onSave, startDate, endDate }) => {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;
  
  const handleSave = () => {
    if (!title.trim()) {
        alert('Bitte geben Sie einen Titel für den Urlaub ein.');
        return;
    }
    onSave({ title, startDate, endDate });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  }

  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T12:00:00Z');
      return date.toLocaleDateString('de-DE', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Neuen Urlaub erstellen</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(startDate)} - {formatDate(endDate)}</p>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titel des Urlaubs</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500"
                    placeholder="z.B. Sommerurlaub in Italien"
                    autoFocus
                />
            </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-xl">
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
  );
};