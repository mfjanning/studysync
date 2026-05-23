import { serverSupabaseClient } from '#supabase/server'

/**
 * Prüft, ob der aktuell eingeloggte Nutzer
 * den angegebenen Dozenten bereits bewertet hat.
 */
export default eventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: { user } } = await client.auth.getUser()

    const query = getQuery(event)
    const dozentID = Number(query.dozentID)

    // Falls nicht eingeloggt, kann keine Bewertung existieren:
    if (!user) {
        return {
            alreadyRated: false,
            reason: 'Nicht eingeloggt'
        }
    }
    // Prüfen, ob bereits eine Bewertung existiert:
    const { data, error } = await client
        .from('bewertung_dozent')
        .select('id')
        .eq('dozentID', dozentID)
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

    // Gibt true zurück, falls mind. eine Bewertung existiert
    // Gibt false zurück, wenn keine Bewertung existiert
    return {
        alreadyRated: data && data.length > 0
    }
})