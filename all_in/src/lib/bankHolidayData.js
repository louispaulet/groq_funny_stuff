export const BANK_HOLIDAYS_BY_COUNTRY = {
  usa: [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-01-15', name: 'Martin Luther King Jr. Day' },
    { date: '2024-05-27', name: 'Memorial Day' },
    { date: '2024-07-04', name: 'Independence Day' },
    { date: '2024-09-02', name: 'Labor Day' },
    { date: '2024-11-28', name: 'Thanksgiving Day' },
  ],
  uk: [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-03-29', name: 'Good Friday' },
    { date: '2024-04-01', name: 'Easter Monday' },
    { date: '2024-05-06', name: 'Early May Bank Holiday' },
    { date: '2024-08-26', name: 'Summer Bank Holiday' },
    { date: '2024-12-25', name: 'Christmas Day' },
  ],
  fr: [
    { date: '2024-01-01', name: "Nouvel An" },
    { date: '2024-04-01', name: 'Lundi de Pâques' },
    { date: '2024-05-01', name: 'Fête du Travail' },
    { date: '2024-05-08', name: 'Victoire 1945' },
    { date: '2024-05-09', name: "Ascension" },
    { date: '2024-08-15', name: "Assomption" },
  ],
  es: [
    { date: '2024-01-01', name: 'Año Nuevo' },
    { date: '2024-03-29', name: 'Viernes Santo' },
    { date: '2024-05-01', name: 'Fiesta del Trabajo' },
    { date: '2024-08-15', name: 'Asunción de la Virgen' },
    { date: '2024-11-01', name: 'Día de Todos los Santos' },
    { date: '2024-12-06', name: 'Día de la Constitución' },
  ],
  it: [
    { date: '2024-01-01', name: 'Capodanno' },
    { date: '2024-04-01', name: 'Lunedì dell’Angelo' },
    { date: '2024-04-25', name: 'Festa della Liberazione' },
    { date: '2024-05-01', name: 'Festa del Lavoro' },
    { date: '2024-08-15', name: 'Ferragosto' },
    { date: '2024-12-25', name: 'Natale' },
  ],
}

export const BANK_HOLIDAY_COUNTRY_OPTIONS = [
  { id: 'usa', label: 'USA', locale: 'en-US' },
  { id: 'uk', label: 'United Kingdom', locale: 'en-GB' },
  { id: 'fr', label: 'France', locale: 'fr-FR' },
  { id: 'es', label: 'Spain', locale: 'es-ES' },
  { id: 'it', label: 'Italy', locale: 'it-IT' },
]
