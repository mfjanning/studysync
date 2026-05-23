import { serverSupabaseClient } from "#supabase/server"
import { readBody } from "h3"

/**
 * creates an abonnement for the user that is logged in for a specific course
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = (await client.auth.getUser()).data.user as any;
  const userId = user?.id ?? user?.sub;

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Nicht autorisiert" });
  }

  const body = await readBody(event);
  const kursID = Number(body.kursID);

  if (!kursID) {
    throw createError({ statusCode: 400, statusMessage: "Fehlende kursID" });
  }

  // Prevent adding a course that is already added
  const { data: existing } = await (client.from("bekommt_updates") as any)
    .select("id")
    .eq("nutzerID", userId)
    .eq("kursID", kursID)
    .maybeSingle();

  if (existing) {
    return { abonnement: existing };
  }

  const { data, error } = await (client.from("bekommt_updates") as any)
    .insert({ nutzerID: userId, kursID })
    .select()
    .single();

  if (error) {
    console.error("Bekommt-Updates POST Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Abonnement konnte nicht gespeichert werden"
    });
  }

  return { abonnement: data };
});