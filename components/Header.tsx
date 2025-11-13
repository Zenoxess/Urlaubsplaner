
import React from 'react';
import { CalendarIcon } from './icons/CalendarIcon';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center">
            <div className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 p-2 rounded-lg mr-4">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Urlaubsplaner Pro</h1>
              <p className="text-slate-500 dark:text-slate-400">Maximieren Sie Ihre Freizeit für ${new Date().getFullYear() + 1}</p>
            </div>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
};