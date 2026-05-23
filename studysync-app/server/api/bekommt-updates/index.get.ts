import { serverSupabaseClient } from "#supabase/server"

/**
 * returns all abonnements the user that is logged in has selected
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = (await client.auth.getUser()).data.user as any;
  const userId = user?.id ?? user?.sub;

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Nicht autorisiert" });
  }

  const { data, error } = await (client.from("bekommt_updates") as any)
    .select("*, kurs(id, name)")
    .eq("nutzerID", userId);

  if (error) {
    console.error("Bekommt-Updates GET Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Abonnements konnten nicht geladen werden"
    });
  }

  return { abonnements: data };
});