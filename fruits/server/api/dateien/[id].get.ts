import { serverSupabaseClient } from "#supabase/server"

/**
 * returns all files for a specific course
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  // @ts-ignore
  const { data } = await client.from("dateien").select("*, profile(name)").eq("kursID", event.context.params.id);
  
  // @ts-ignore
  data?.sort((a, b) => b.jahr - a.jahr);

  return {dateien: data};
})