import { serverSupabaseClient } from "#supabase/server"

/**
 * returns all courses in the database sorted by name
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  const { data } = await client.from("kurs").select("*");
  // @ts-ignore 
  data?.sort((a, b) => a.name.localeCompare(b.name));
  return {courses: data};
})