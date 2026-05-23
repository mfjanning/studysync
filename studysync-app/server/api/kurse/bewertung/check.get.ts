import { serverSupabaseClient } from '#supabase/server'
/**
 * Prüft, ob der aktuell eingeloggte Nutzer
 * den angegebenen Kurs bereits bewertet hat.
 */
export default eventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: { user } } = await client.auth.getUser()

    const query = getQuery(event)
    const kursID = Number(query.kursID)

    // Falls niemand eingeloggt ist:
    // -> Es kann keine Bewertung existieren
    if (!user) {
        return {
            alreadyRated: false,
            reason: 'Nicht eingeloggt'
        }
    }

    // Prüft in "bewertung_kurs", ob beereits eine Bewertung existiert:
    const { data, error } = await client
        .from('bewertung_kurs')
        .select('id')
        .eq('kursID', kursID)
        .eq('nutzerID', user.id)
        .limit(1)

    if (error) {
        console.error('Supabase Fehler:', error)

        return {
            alreadyRated: false,
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        }
    }

    // Gibt true zurück, wenn mindestens eine Bewertung gefunden wurde
    // Gibt false zurück, wenn keine Bewertung existiert
    return {
        alreadyRated: data && data.length > 0
    }
})