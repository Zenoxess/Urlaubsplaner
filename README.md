
# Urlaubsplaner Pro 🗓️✨

Eine intelligente Web-Anwendung zur optimierten Urlaubsplanung für das kommende Jahr in Deutschland. Die App nutzt die Google Gemini API, um unter Berücksichtigung regionaler Feiertage, Schulferien und persönlicher Präferenzen den idealen Urlaubsplan zu erstellen.

![Screenshot der Urlaubsplaner Pro App](https://storage.googleapis.com/aistudio-marketplace/project-broll/urlaubsplaner-pro.gif)

## ⭐ Features

- **Intelligente Planung**: Nutzt die Gemini API zur Erstellung von Urlaubsplänen, die Brückentage optimal ausnutzen.
- **Regionale Anpassung**: Berücksichtigt gesetzliche Feiertage und Schulferien für alle 16 deutschen Bundesländer.
- **Hohe Personalisierbarkeit**:
    - Angabe von Arbeitstagen, Urlaubsanspruch (neue und Übertragstage).
    - Definition von Sperrzeiten, in denen kein Urlaub genommen werden kann.
    - Präferenzen für Schulferien, Jahreszeiten, Planungsumfang und maximale Urlaubslänge.
- **Interaktive Ergebnisansicht**:
    - **Dashboard**: Klare Übersicht über verplante und verfügbare Urlaubstage.
    - **Monats-Chart**: Visuelle Darstellung der Verteilung der Urlaubstage über das Jahr.
    - **Listen- & Kalenderansicht**: Zwei Darstellungsmodi für den Urlaubsplan.
- **Dynamische Anpassung**:
    - Bestehende Urlaubsvorschläge können direkt in der App bearbeitet oder gelöscht werden.
    - Neue Urlaubszeiträume können einfach über den Kalender hinzugefügt werden.
- **KI-gestützte Reiseideen**: Erhalten Sie auf Knopfdruck passende Reisevorschläge für jeden Urlaubszeitraum (gestützt durch Google Search).
- **Export-Funktionen**:
    - Download des Plans als **CSV-Datei**.
    - Druckfreundliche **PDF-Ansicht**.
- **Modernes UI/UX**:
    - Responsives Design für Desktop und Mobilgeräte.
    - Helles und dunkles Anzeigedesign (Theme-Switcher).

---

## 🚀 Tech-Stack

- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **KI & Generierung**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Abhängigkeiten**: Geladen über [Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) für ein Build-freies Setup.

---

## 🔧 Installation & Lokaler Betrieb

Um das Projekt lokal auszuführen, benötigen Sie einen Google Gemini API-Schlüssel.

### 1. Voraussetzungen

- Ein moderner Webbrowser, der Import Maps unterstützt (z.B. Chrome, Firefox, Edge).
- Ein [Google Gemini API-Schlüssel](https://aistudio.google.com/app/apikey).

### 2. Klonen des Repositories

```bash
git clone https://github.com/IHR-BENUTZERNAME/urlaubsplaner-pro.git
cd urlaubsplaner-pro
```

### 3. API-Schlüssel konfigurieren

Die Anwendung lädt den API-Schlüssel aus den Umgebungsvariablen. Für die lokale Entwicklung ist es am einfachsten, eine `.env`-Datei zu erstellen.

1.  Erstellen Sie eine neue Datei im Hauptverzeichnis des Projekts mit dem Namen `.env`.
2.  Fügen Sie Ihren API-Schlüssel in diese Datei ein:

    ```
    API_KEY=DEIN_GOOGLE_GEMINI_API_SCHLUESSEL
    ```

    > **Wichtiger Hinweis**: Fügen Sie die `.env`-Datei zu Ihrer `.gitignore`-Datei hinzu, um zu verhindern, dass Ihr API-Schlüssel versehentlich in das Git-Repository hochgeladen wird.

### 4. Lokalen Server starten

Da dieses Projekt als statische Seite ohne Build-Schritt konzipiert ist, können Sie jeden einfachen HTTP-Server verwenden, um es auszuführen.

Eine einfache Möglichkeit ist die Verwendung des `serve`-Pakets:

```bash
# Falls noch nicht installiert:
npm install -g serve

# Server im Projektverzeichnis starten:
serve .
```

Alternativ können Sie eine Live-Server-Erweiterung in Ihrem Code-Editor (z.B. [Live Server für VS Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)) verwenden.

Öffnen Sie anschließend die angezeigte URL (z.B. `http://localhost:3000`) in Ihrem Browser.

---

## 🧠 Funktionsweise

1.  **Dateneingabe**: Der Nutzer gibt seine Daten und Präferenzen über das `UserInputForm` ein.
2.  **Prompt-Generierung**: Der `geminiService` erstellt einen detaillierten Text-Prompt, der alle Nutzerangaben sowie ein festes JSON-Schema für die erwartete Antwort enthält.
3.  **API-Aufruf**: Der Prompt wird an das `gemini-2.5-pro`-Modell gesendet. Dank des Schemas liefert die API eine strukturierte JSON-Antwort zurück.
4.  **Datenverarbeitung**: In der `ResultsView`-Komponente wird die Antwort der KI entgegengenommen. Eine clientseitige Logik (`recalculatePlanDays`) stellt sicher, dass Geschäftsregeln (z.B. die Priorisierung von Übertragstagen) korrekt angewendet werden, um die Konsistenz zu gewährleisten.
5.  **Interaktion**: Der Nutzer kann den Plan in der `CalendarView` oder `ListView` einsehen und bearbeiten. Jede Änderung löst eine Neuberechnung der verbleibenden Urlaubstage aus.
6.  **Reiseideen**: Bei Bedarf wird eine separate Anfrage an das `gemini-2.5-flash`-Modell mit aktivierter Google-Suche (`googleSearch` Tool) gesendet, um aktuelle und relevante Reisevorschläge zu generieren.

---

## 📂 Projektstruktur

```
.
├── components/                 # Alle React-Komponenten
│   ├── icons/                  # SVG-Icons als React-Komponenten
│   ├── CalendarView.tsx
│   ├── EditSuggestionModal.tsx
│   ├── Header.tsx
│   ├── ListView.tsx
│   ├── ResultsView.tsx
│   └── ...
├── services/                   # Module für externe Kommunikation
│   ├── geminiService.ts        # Logik für die Kommunikation mit der Gemini API
│   └── exportService.ts        # Logik für CSV- und PDF-Export
├── App.tsx                     # Hauptkomponente der Anwendung
├── constants.ts                # App-weite Konstanten (z.B. Bundesländer)
├── index.html                  # HTML-Einstiegspunkt
├── index.tsx                   # React-Einstiegspunkt
├── metadata.json               # Metadaten der Anwendung
├── types.ts                    # TypeScript-Typdefinitionen
└── README.md                   # Diese Datei
```

---

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen finden Sie in der `LICENSE`-Datei.
