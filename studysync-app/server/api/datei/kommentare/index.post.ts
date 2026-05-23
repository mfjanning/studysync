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
  const dateiID = Number(body.dateiID);
  const kommentar = String(body.kommentar ?? "");

  if (!dateiID || !kommentar.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Fehlende Daten" });
  }

  const { data, error } = await (client.from("kommentar_datei") as any)
    .insert({ dateiID, nutzerID: userId, kommentar: kommentar.trim() })
    .select("*, profile(name)")
    .single();

  if (error) {
    console.error("Kommentar-Datei Insert Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Kommentar konnte nicht gespeichert werden"
    });
  }

  return { kommentar: data };
})
