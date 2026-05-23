import { serverSupabaseClient } from '#supabase/server';
import { readMultipartFormData } from 'h3'

/**
 * uploads a file to storage in supabase if the user is authenticated only
 * if upload to either storage or dateien (to link the storage) fails, the file
 * will not be uploaded at all
 */
export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = (await client.auth.getUser()).data.user;

  // not logged in
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Nicht autorisiert' });
  }

  const multipartData = await readMultipartFormData(event);

  const jahrData = multipartData?.find(el => el.name === 'jahr');
  const semesterData = multipartData?.find(el => el.name === 'semester'); // NEU
  const kursIdData = multipartData?.find(el => el.name === 'kursID');
  const typData = multipartData?.find(el => el.name === 'typ');
  const fileData = multipartData?.find(el => el.name === 'file');

  // NEU: semesterData in die Prüfung aufgenommen
  if (!kursIdData || !typData || !jahrData || !semesterData || !fileData || !fileData.filename) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Fehlende Daten: kursID, typ, jahr, semester oder Datei nicht gefunden.' 
    });
  } 

  const kursID = kursIdData.data.toString();
  const typ = typData.data.toString();
  const dateiname = fileData.filename;
  const einzigartigerDateiname = `${user.id}-${Date.now()}-${dateiname}`;
  const dateipfad = `${typ}/${kursID}/${einzigartigerDateiname}`;

  // NEU: Jahr und Semester als Text auslesen (kein parseInt mehr für das Jahr)
  const jahr = jahrData.data.toString().trim();
  const semester = semesterData.data.toString().trim();
  
  const { error: uploadError } = await client.storage
    .from('kurs_dateien')
    .upload(dateipfad, fileData.data, {
      contentType: fileData.type,
      upsert: false
    });

  if (uploadError) {
    console.error('Error:', uploadError);
    throw createError({ statusCode: 500, statusMessage: 'Datei konnte nicht hochgeladen werden.' });
  }

  const { data: dbData, error: insertError } = await client
  .from('dateien')
  .insert({
    typ: typ,
    kursID: kursID,
    nutzerID: user.id,
    dateipfad: dateipfad,
    dateiname: dateiname,
    jahr: jahr,           // Jahr wird als Text gespeichert
    semester: semester    // NEU: Semester wird gespeichert
  })
  .select()
  .single();

  if (insertError) {
    console.error('Supabase DB Error:', insertError);
    await client.storage.from('kurs_dateien').remove([dateipfad]);
    throw createError({ statusCode: 500, statusMessage: 'Datei-Informationen konnten nicht gespeichert werden.' });
  }
  
  console.log('Upload erfolgreich:', dbData);
  return { success: true, file: dbData };
});