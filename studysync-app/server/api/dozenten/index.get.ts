import { serverSupabaseClient } from "#supabase/server"

/**
 * returns all lecturers in the database sorted by last name
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  const { data } = await client.from("dozent").select("*");
  
  // @ts-ignore
  data?.sort((a, b) => a.nachname.localeCompare(b.nachname));

  return {dozenten: data};
})