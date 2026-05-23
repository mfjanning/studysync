import { serverSupabaseClient } from "#supabase/server"
import { getQuery } from "h3"

/**
 * uses the SQL query in supabase to return 5, 10, 20 or 50 updates that fit the selected 
 * abonnements, sorted by date
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = (await client.auth.getUser()).data.user as any;
  const userId = user?.id ?? user?.sub;

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Nicht autorisiert" });
  }

  // Limit aus Query-Parameter lesen, Whitelist erlaubter Werte
  const query = getQuery(event)
  const erlaubteWerte = [5, 10, 20, 50]
  const limit = erlaubteWerte.includes(Number(query.limit))
    ? Number(query.limit)
    : 20

  const { data: abonnements, error: aboError } = await (client.from("bekommt_updates") as any)
    .select("kursID")
    .eq("nutzerID", userId);

  if (aboError) {
    console.error("Dashboard Updates – Abo-Fehler:", aboError);
    throw createError({
      statusCode: 500,
      statusMessage: aboError.message || "Abonnements konnten nicht geladen werden"
    });
  }

  const kursIds: number[] = (abonnements ?? []).map((a: any) => Number(a.kursID));

  if (kursIds.length === 0) {
    return { updates: [] };
  }

  const { data, error } = await (client.rpc as any)("get_kurs_updates", {
    p_kurs_ids: kursIds,
    p_limit: limit,
  }).limit(limit)

  if (error) {
    console.error("Dashboard Updates – RPC-Fehler:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Updates konnten nicht geladen werden"
    });
  }

  return { updates: data ?? [], limit };
});