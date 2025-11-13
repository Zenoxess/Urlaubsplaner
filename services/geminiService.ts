import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, VacationPlan, VacationSuggestion } from '../types';
import { WEEKDAYS, NEXT_YEAR } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const vacationPlanSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      description: 'Eine Liste von vorgeschlagenen Urlaubszeiträumen.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Ein beschreibender Titel für den Urlaubszeitraum, z.B. "Osterurlaub".' },
          startDate: { type: Type.STRING, description: 'Startdatum des Urlaubs im Format YYYY-MM-DD.' },
          endDate: { type: Type.STRING, description: 'Enddatum des Urlaubs im Format YYYY-MM-DD.' },
          vacationDaysUsed: { type: Type.INTEGER, description: 'Anzahl der für diesen Zeitraum verbrauchten Urlaubstage aus dem Budget des Nutzers.' },
          vacationDaysUsedFromCarryOver: { type: Type.INTEGER, description: 'Anzahl der verwendeten Urlaubstage aus dem Vorjahresübertrag.' },
          vacationDaysUsedFromNew: { type: Type.INTEGER, description: 'Anzahl der verwendeten Urlaubstage aus dem neuen Jahresanspruch.' },
          totalDaysOff: { type: Type.INTEGER, description: 'Gesamtzahl der zusammenhängenden freien Tage, einschließlich Wochenenden und Feiertagen.' },
          relatedHoliday: { type: Type.STRING, description: 'Der/die gesetzliche(n) Feiertag(e), um den/die dieser Urlaubszeitraum herum aufgebaut ist.' },
        },
        required: ['title', 'startDate', 'endDate', 'vacationDaysUsed', 'vacationDaysUsedFromCarryOver', 'vacationDaysUsedFromNew', 'totalDaysOff', 'relatedHoliday']
      }
    },
    remainingVacationDaysNew: {
        type: Type.INTEGER,
        description: 'Die Anzahl der nach allen Vorschlägen verbleibenden neuen Urlaubstage.'
    },
    remainingVacationDaysCarryOver: {
        type: Type.INTEGER,
        description: 'Die Anzahl der nach allen Vorschlägen verbleibenden Urlaubstage aus dem Übertrag.'
    },
    publicHolidays: {
        type: Type.ARRAY,
        description: `Eine Liste aller gesetzlichen Feiertage im angegebenen Bundesland für das Jahr ${NEXT_YEAR}.`,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'Der Name des Feiertags.' },
                date: { type: Type.STRING, description: 'Das Datum des Feiertags im Format YYYY-MM-DD.' },
            },
            required: ['name', 'date']
        }
    }
  },
  required: ['suggestions', 'remainingVacationDaysNew', 'remainingVacationDaysCarryOver', 'publicHolidays']
};

export const generateVacationPlan = async (input: UserInput): Promise<VacationPlan> => {
  const totalVacationDays = input.vacationDaysNew + input.vacationDaysCarryOver;
  const workingDaysNames = input.workDays.map(dayId => WEEKDAYS.find(d => d.id === dayId)?.name).join(', ');

  const holidayPrefText = {
      'in-holidays': 'Bevorzuge Zeiträume innerhalb der Schulferien.',
      'outside-holidays': 'Bevorzuge Zeiträume außerhalb der Schulferien.',
      'no-preference': 'Keine Präferenz für Schulferien.'
  }[input.holidayPreference];
  
  const planningAmountText = input.planningAmount.type === 'percentage'
    ? `Versuche, ungefähr ${input.planningAmount.value}% der verfügbaren Urlaubstage zu verplanen.`
    : `Versuche, ungefähr ${input.planningAmount.value} Urlaubstage zu verplanen.`;
    
  const seasonPrefText = {
      'spring': 'Frühling (März-Mai)',
      'summer': 'Sommer (Juni-August)',
      'autumn': 'Herbst (September-November)',
      'winter': 'Winter (Dezember-Februar)',
      'no-preference': 'Keine Präferenz'
  }[input.seasonPreference];

  const prompt = `
    Erstelle einen optimierten Urlaubsplan für das Jahr ${NEXT_YEAR} für einen Nutzer in Deutschland.

    **Nutzerangaben:**
    - Bundesland: ${input.state}
    - Gesamt verfügbare Urlaubstage: ${totalVacationDays} (${input.vacationDaysNew} neue + ${input.vacationDaysCarryOver} Übertrag aus dem Vorjahr)
    - Regelmäßige Arbeitstage: ${workingDaysNames}
    - Gesperrte Zeiträume (nicht für Urlaub einplanen): ${input.blockedPeriods.length > 0 ? input.blockedPeriods.map(p => `${p.start} bis ${p.end}`).join(', ') : 'Keine'}
    - Präferenzen:
        - ${holidayPrefText}
        - ${planningAmountText}
        - Maximale freie Tage am Stück: ${input.maxConsecutiveDays ? input.maxConsecutiveDays : 'Keine Begrenzung'}
        - Bevorzugte Jahreszeit: ${seasonPrefText}

    **Aufgabe:**
    1.  Analysiere die gesetzlichen und regionalen Feiertage sowie die Schulferien für ${input.state} im Jahr ${NEXT_YEAR}.
    2.  Erstelle Vorschläge für Urlaubszeiträume, die die freien Tage des Nutzers maximieren, indem "Brückentage" geschickt genutzt werden.
    3.  **Wichtig:** Urlaubstage aus dem Übertrag (${input.vacationDaysCarryOver} Tage) müssen priorisiert und idealerweise bis zum 31. März ${NEXT_YEAR} aufgebraucht werden. Plane diese zuerst ein.
    4.  Berücksichtige ALLE Präferenzen des Nutzers: Schulferien, Umfang, maximale Urlaubslänge am Stück und bevorzugte Jahreszeit.
    5.  Gib für jeden Vorschlag an, wie viele Tage vom Übertrag ('vacationDaysUsedFromCarryOver') und wie viele vom neuen Anspruch ('vacationDaysUsedFromNew') verwendet werden. Die Summe dieser beiden Werte muss 'vacationDaysUsed' ergeben.
    6.  Plane so viele Urlaubstage wie möglich sinnvoll ein, aber überschreite nicht das Gesamtbudget von ${totalVacationDays} Tagen und halte dich an den gewünschten Planungsumfang.
    7.  Der Wert für "remainingVacationDaysNew" und "remainingVacationDaysCarryOver" muss korrekt berechnet werden.
    8.  Achte darauf, dass die vorgeschlagenen Urlaubstage nicht in die gesperrten Zeiträume fallen und auch nicht auf Tage fallen, an denen der Nutzer ohnehin nicht arbeitet (Wochenende oder Feiertage).
    9.  Gib das Ergebnis als JSON-Objekt zurück, das dem bereitgestellten Schema entspricht. Die Datumsangaben müssen im Format YYYY-MM-DD sein.
    10. Das JSON MUSS eine vollständige Liste aller gesetzlichen Feiertage für ${input.state} im Jahr ${NEXT_YEAR} im Feld "publicHolidays" enthalten.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: vacationPlanSchema,
        temperature: 0.2,
      },
    });

    const text = response.text.trim();
    // It should already be valid JSON due to responseSchema
    return JSON.parse(text) as VacationPlan;

  } catch (error) {
    console.error("Error generating vacation plan:", error);
    throw new Error("Failed to communicate with the planning service.");
  }
};


export const getTravelSuggestion = async (period: VacationSuggestion): Promise<string> => {
    const prompt = `
    Gib mir 3 verschiedene Reiseideen für einen Urlaub vom ${period.startDate} bis zum ${period.endDate}. 
    Der Urlaub findet im Jahr ${NEXT_YEAR} statt.
    Die Vorschläge sollten kurz und inspirierend sein, geeignet für eine Reise von Deutschland aus. 
    Nutze aktuelle Informationen. Gib am Ende die Quellen als Links an.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        let text = response.text;

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
            const sources = groundingChunks
                .map((chunk: any) => chunk.web?.uri)
                .filter(Boolean);
            
            if(sources.length > 0) {
                const uniqueSources = [...new Set(sources)];
                text += "\n\n**Quellen:**\n";
                uniqueSources.forEach(source => {
                    text += `- [${source}](${source})\n`;
                });
            }
        }
        
        return text;

    } catch (error) {
        console.error("Error getting travel suggestion:", error);
        throw new Error("Failed to get travel suggestions.");
    }
}