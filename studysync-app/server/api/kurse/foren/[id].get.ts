import { serverSupabaseClient } from "#supabase/server"

/**
 * returns all forums for a given course aswell as date of the forum
 * also returns the display name of the user that created the forum using the profile table in supabase
 * sorted by date in descending order
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  // @ts-ignore
  const { data } = await client.from("forum_kurs").select("*, profile(name, avatar), kommentar_kurs(count)").eq("kursID", event.context.params.id);
  // @ts-ignore
  data?.sort((b, a) => a.created_at.localeCompare(b.created_at));

  return {beitraege: data};
})