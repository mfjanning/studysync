/**
 * deletes an abonnement for the user that is logged in for a specific course
 */
import { serverSupabaseClient } from "#supabase/server"
import { getRouterParam } from "h3"

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = (await client.auth.getUser()).data.user as any;
  const userId = user?.id ?? user?.sub;

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Nicht autorisiert" });
  }

  const kursId = Number(getRouterParam(event, "kursId"));

  if (!kursId) {
    throw createError({ statusCode: 400, statusMessage: "Fehlende kursId" });
  }

  const { error } = await (client.from("bekommt_updates") as any)
    .delete()
    .eq("nutzerID", userId)
    .eq("kursID", kursId);

  if (error) {
    console.error("Bekommt-Updates DELETE Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Abonnement konnte nicht gelöscht werden"
    });
  }

  return { success: true };
});