import { serverSupabaseClient } from "#supabase/server"
/**
 * returns all data for a specfic lecturer, including their ratings and the courses they teach
 * courses are sorted by name
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  // safely get lecturer id from route params
  const dozentId = event.context.params?.id;

  // throw error if no id exists
  if (!dozentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Dozent-ID fehlt"
    });
  }

  // returns all data from the lecturer with the specified id
  // @ts-ignore
  const { data: data_lecturer } = await client
      .from("dozent")
      .select("*")
      .eq("id", dozentId)
      .single();

  // returns all ratings for the lecturer with the specified id using the sql query I defined in supabase
// @ts-ignore
  const { data: data_ratings } = await client
      // @ts-ignore
      .rpc("get_dozent_ratings", { p_dozent_id: Number(dozentId) })
      .single();

  // returns all courses taught by the lecturer with the specified id using a join query
  // @ts-ignore
  const { data: data_courses_unmapped } = await client
      .from("unterrichtet")
      .select(`
      kurs (
        id,
        name
      )
    `)
      .eq("dozentID", dozentId);

  // maps the data to include course ids and course names
  // @ts-ignore
  // maps the data to include course ids and course names
// @ts-ignore
  const data_courses_with_rating = await Promise.all(
  (data_courses_unmapped ?? []).map(async (entry: any) => {
    const kurs = entry.kurs;
    if (!kurs) return null;
    const { data: bewertung } = await client
    // @ts-ignore
      .rpc("get_kurs_ratings", { p_kurs_id: kurs.id }).single();
    return {
      ...kurs, 
      // @ts-ignore
      gesamtbewertung: bewertung?.gesamtbewertung ?? null,
    };
  }));

  const data_courses = data_courses_with_rating
  .filter(Boolean)
  .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return {
    dozent: data_lecturer,
    bewertungen: data_ratings,
    kurse: data_courses
  };
})