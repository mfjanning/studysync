import { serverSupabaseClient } from "#supabase/server"

/**
 * returns all data for a specfic course, including its ratings
 * and the lecturers that the course teach including their "gesamtbewertung" sorted by last name
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  // returns all data from the course with the specified id
  // @ts-ignore 
  const { data: data_course } = await client.from("kurs").select("*").eq("id", event.context.params.id).single();

  // returns all ratings for the course with the specified id using the sql query I defined in supabase
  // @ts-ignore
  const { data: data_ratings } = await client.rpc("get_kurs_ratings", { p_kurs_id: event.context.params.id }).single();

  // returns all lecturers that teach the course with the specified id using a join query
const { data: data_lecturers } = await client
  .from("unterrichtet")
  .select(`
    dozent (
      id,
      vorname,
      nachname
    )
  `)
  // @ts-ignore
  .eq("kursID", event.context.params.id);

// sorts by last name
data_lecturers?.sort((a, b) =>
  // @ts-ignore
  a.dozent.nachname.localeCompare(b.dozent.nachname)
);

// get ratings for each lecturer and add it to the lecturer data
const data_lecturers_with_rating = await Promise.all(
  (data_lecturers ?? []).map(async (entry) => {
    // @ts-ignore
    const dozentId = entry.dozent.id;
    // @ts-ignore
    const { data: bewertung } = await client.rpc("get_dozent_ratings", { p_dozent_id: dozentId }).single();

    return {
      // @ts-ignore
      ...entry,
      dozent: {
        // @ts-ignore
        ...entry.dozent,
        // @ts-ignore
        gesamtbewertung: bewertung?.gesamtbewertung,
      },
    };
  }));

  //console.log(JSON.stringify(data_lecturers_with_rating, null, 2));

  // @ts-ignore
  data_lecturers?.sort((a, b) => a.dozent.nachname.localeCompare(b.dozent.nachname));

  return {kurs: data_course, bewertungen: data_ratings, dozenten: data_lecturers_with_rating};
})