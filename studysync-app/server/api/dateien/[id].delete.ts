/**
 * Deletes a file for the logged-in user
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

  const id = Number(getRouterParam(event, "id"));

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Fehlende ID" });
  }

  const { error } = await (client.from("dateien") as any)
    .delete()
    .eq("id", id)
    .eq("nutzerID", userId);

  if (error) {
    console.error("Datei DELETE Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Datei konnte nicht gelöscht werden"
    });
  }

  return { success: true };
});