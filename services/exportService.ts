
import type { VacationPlan, UserInput } from '../types';
import { NEXT_YEAR } from '../constants';

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const generateCsvContent = (plan: VacationPlan, userInput: UserInput): string => {
    const totalDays = userInput.vacationDaysNew + userInput.vacationDaysCarryOver;
    const totalUsedDays = plan.suggestions.reduce((sum, s) => sum + s.vacationDaysUsed, 0);

    let csvContent = `Urlaubsplan für ${NEXT_YEAR}\n`;
    csvContent += `Bundesland;${userInput.state}\n`;
    csvContent += `\n`;
    csvContent += `Gesamt verfügbar;${totalDays}\n`;
    csvContent += `Verplant;${totalUsedDays}\n`;
    csvContent += `Resturlaub (Neu);${plan.remainingVacationDaysNew}\n`;
    csvContent += `Resturlaub (Übertrag);${plan.remainingVacationDaysCarryOver}\n`;
    csvContent += `\n`;

    csvContent += `Urlaubsvorschläge\n`;
    const headers = [
        "Titel",
        "Startdatum",
        "Enddatum",
        "Genutzte Urlaubstage",
        "davon Übertrag",
        "davon Neu",
        "Freie Tage Gesamt"
    ];
    csvContent += headers.join(';') + '\n';

    plan.suggestions.forEach(s => {
        const row = [
            `"${s.title.replace(/"/g, '""')}"`,
            formatDate(s.startDate),
            formatDate(s.endDate),
            s.vacationDaysUsed,
            s.vacationDaysUsedFromCarryOver,
            s.vacationDaysUsedFromNew,
            s.totalDaysOff
        ];
        csvContent += row.join(';') + '\n';
    });
    
    csvContent += `\n`;
    csvContent += `Gesetzliche Feiertage (${userInput.state})\n`;
    csvContent += `Feiertag;Datum\n`;
    plan.publicHolidays.forEach(h => {
        csvContent += `"${h.name.replace(/"/g, '""')}";${formatDate(h.date)}\n`;
    });


    return csvContent;
};

export const downloadCsv = (plan: VacationPlan, userInput: UserInput) => {
    const csvContent = generateCsvContent(plan, userInput);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `urlaubsplan-${NEXT_YEAR}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
