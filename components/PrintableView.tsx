
import React from 'react';
import type { VacationPlan, UserInput } from '../types';
import { NEXT_YEAR } from '../constants';

interface PrintableViewProps {
    plan: VacationPlan;
    userInput: UserInput;
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const PrintableView: React.FC<PrintableViewProps> = ({ plan, userInput }) => {
    const totalDays = userInput.vacationDaysNew + userInput.vacationDaysCarryOver;
    const totalUsedDays = plan.suggestions.reduce((sum, s) => sum + s.vacationDaysUsed, 0);

    return (
        <div className="p-8 font-sans bg-white text-black">
            <h1 className="text-3xl font-bold mb-2">Urlaubsplan {NEXT_YEAR}</h1>
            <p className="text-gray-600 mb-6">Erstellt für das Bundesland: {userInput.state}</p>

            <div className="grid grid-cols-4 gap-4 mb-8 text-center">
                <div className="bg-gray-100 p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Verfügbar</p>
                    <p className="text-2xl font-bold text-gray-800">{totalDays}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">Verplant</p>
                    <p className="text-2xl font-bold text-green-800">{totalUsedDays}</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700">Rest (Übertrag)</p>
                    <p className="text-2xl font-bold text-orange-800">{plan.remainingVacationDaysCarryOver}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">Rest (Neu)</p>
                    <p className="text-2xl font-bold text-blue-800">{plan.remainingVacationDaysNew}</p>
                </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Urlaubsvorschläge</h2>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border font-semibold">Titel</th>
                        <th className="p-2 border font-semibold">Startdatum</th>
                        <th className="p-2 border font-semibold">Enddatum</th>
                        <th className="p-2 border text-center font-semibold">Urlaubstage</th>
                        <th className="p-2 border text-center font-semibold">Freie Tage</th>
                    </tr>
                </thead>
                <tbody>
                    {plan.suggestions.map((s, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-2 border">{s.title}</td>
                            <td className="p-2 border">{formatDate(s.startDate)}</td>
                            <td className="p-2 border">{formatDate(s.endDate)}</td>
                            <td className="p-2 border text-center">{s.vacationDaysUsed}</td>
                            <td className="p-2 border text-center">{s.totalDaysOff}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="mt-8 page-break-before-auto">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Gesetzliche Feiertage in {userInput.state}</h2>
                <ul className="columns-2 sm:columns-3 text-sm">
                    {plan.publicHolidays.map(h => (
                         <li key={h.date} className="mb-1 p-1">
                            <span className="font-semibold">{h.name}:</span> {formatDate(h.date)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
