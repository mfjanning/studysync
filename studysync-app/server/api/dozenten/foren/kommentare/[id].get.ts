import { serverSupabaseClient } from "#supabase/server"

/**
 * returns all comments for a given forum aswell as date and name of the user that created the comment
 * sorted by date in descending order
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  // @ts-ignore
  const { data } = await client.from("kommentar_dozent").select("*, profile(name, avatar)").eq("forumID", event.context.params.id);
  // @ts-ignore
  data?.sort((b, a) => a.created_at.localeCompare(b.created_at));

  return {beitraege: data};
})