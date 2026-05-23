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
  const kursID = Number(body.kursID);
  const thema = String(body.thema ?? "");

  if (!kursID || !thema.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Fehlende Daten" });
  }

  const { data, error } = await (client.from("forum_kurs") as any)
    .insert({ kursID, nutzerID: userId, thema: thema.trim() })
    .select("*, profile(name)")
    .single();

  if (error) {
    console.error("Forum-Kurs Insert Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Beitrag konnte nicht gespeichert werden"
    });
  }

  return { beitrag: data };
});
