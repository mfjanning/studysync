import { serverSupabaseClient } from "#supabase/server"

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  const { data, error } = await client
    .from("dateien")
    .select("*")
    .eq("id", event.context.params.id)
    .single();

  if (error || !data) {
    throw createError({ statusCode: 404, message: "Datei nicht gefunden" });
  }

  return { datei: data };
})