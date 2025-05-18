import { format, isToday, isYesterday } from "date-fns";
import { enUS, fr } from "date-fns/locale";

const formateDateTimestamp = (adTimestamp) => {
    const adDate = new Date(adTimestamp * 1000); // Convertir le timestamp en millisecondes
    const now = new Date();

    const diffTime = now - adDate; // Différence en millisecondes
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convertir en jours

    const options = { hour: '2-digit', minute: '2-digit' }; // Format de l'heure

    if (diffDays === 0) {
        // Aujourd'hui
        return `Aujourd'hui à ${adDate.toLocaleTimeString('fr-FR', options)}`;
    } else if (diffDays === 1) {
        // Hier
        return `Hier à ${adDate.toLocaleTimeString('fr-FR', options)}`;
    } else if (diffDays === 2) {
        // Avant-hier
        return `Avant-hier à ${adDate.toLocaleTimeString('fr-FR', options)}`;
    } else {
        // Date plus ancienne
        return adDate.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
            ` à ${adDate.toLocaleTimeString('fr-FR', options)}`;
    }
};

const parseTimestamp = (timestamp) => {
    const timestampDate = new Date(timestamp?._seconds * 1000 + timestamp?._nanoseconds / 1000000);
    return timestampDate;
}


const formateDate = (newDate, language) => {
    const date = new Date(newDate);

    if (isToday(date)) {
        return language === 'FR'
            ? `Aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`
            : `Today at ${format(date, 'HH:mm', { locale: enUS })}`;
    }

    if (isYesterday(date)) {
        return language === 'FR'
            ? `Hier à ${format(date, 'HH:mm', { locale: fr })}`
            : `Yesterday at ${format(date, 'HH:mm', { locale: enUS })}`;
    }

    return language === 'FR'
        ? format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr })
        : format(date, "MMMM d, yyyy 'at' HH:mm", { locale: enUS });
}

export {
    formateDateTimestamp,
    parseTimestamp,
    formateDate
}