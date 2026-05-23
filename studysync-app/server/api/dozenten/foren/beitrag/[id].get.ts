import { serverSupabaseClient } from "#supabase/server"

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  // @ts-ignore
  const { data, error } = await client.from("forum_dozent").select("*, profile(name, avatar)").eq("id", event.context.params.id).single();

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: "Beitrag nicht gefunden" });
  }

  return { beitrag: data };
});
