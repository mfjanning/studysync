import { serverSupabaseClient } from "#supabase/server"
import { readBody } from "h3"

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = (await client.auth.getUser()).data.user as any;
  const userId = user?.id ?? user?.sub;

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Nicht autorisiert" });
  }

  const body = await readBody(event);
  const dozentID = Number(body.dozentID);
  const thema = String(body.thema ?? "");

  if (!dozentID || !thema.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Fehlende Daten" });
  }

  const { data, error } = await (client.from("forum_dozent") as any)
    .insert({ dozentID, nutzerID: userId, thema: thema.trim() })
    .select("*, profile(name, avatar)")
    .single();

  if (error) {
    console.error("Forum-Dozent Insert Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Beitrag konnte nicht gespeichert werden"
    });
  }

  return { beitrag: data };
});
