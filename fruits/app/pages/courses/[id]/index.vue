<script setup>
// --- LOGIK-BEREICH ---
import { ref, computed } from 'vue'

// 1. URL auslesen
const route = useRoute()
const urlId = route.params.id

// 2. Daten laden: Man fragt nun nur noch den spezifischen Kurs und dessen Zusatzdaten ab.
const { data: course, refresh: refreshCourse } = await useFetch('/api/kurse/' + urlId)
const { data: forums, refresh: refreshForums } = await useFetch('/api/kurse/foren/' + urlId)
const { data: files, refresh: refreshFiles } = await useFetch('/api/dateien/' + urlId)

// Bewertungskriterien für den zusammengefassten Kasten
const bewertungsKriterien = computed(() => {
  const b = course.value?.bewertungen
  return [
    { label: 'Schwierigkeit', wert: b?.schwierigkeit },
    { label: 'Aufwand',       wert: b?.aufwand },
    { label: 'Nutzen',        wert: b?.nutzen },
    { label: 'Praxisbezug',   wert: b?.praxisbezug },
  ]
})

const session = useSupabaseSession()
const user = computed(() => session.value?.user ?? null)
const neuesDiskussionsThema = ref('')
const postet = ref(false)
const postFehler = ref('')  
const loeschtBeitragId = ref(null)
const loeschFehler = ref('')
const zeigeLoeschDialog = ref(false)
const zuLoeschendeBeitragId = ref(null)
const loeschtDateiId = ref(null)
const loeschDateiFehler = ref('')
const zeigeLoeschDialogDatei = ref(false)
const zuLoeschendeDateiId = ref(null)

const diskussionPosten = async () => {
  if (!neuesDiskussionsThema.value.trim()) return
  postet.value = true
  postFehler.value = ''
  try {
    await $fetch('/api/kurse/foren', {
      method: 'POST',
      body: { kursID: Number(urlId), thema: neuesDiskussionsThema.value.trim() }
    })
    neuesDiskussionsThema.value = ''
    await refreshForums()
  } catch (err) {
    postFehler.value = err?.data?.message || err?.message || 'Beitrag konnte nicht gespeichert werden.'
  } finally {
    postet.value = false
  }
}

const beitragLoeschen = (id) => {
  zuLoeschendeBeitragId.value = id
  zeigeLoeschDialog.value = true
}

const loeschenBestaetigen = async () => {
  loeschtBeitragId.value = zuLoeschendeBeitragId.value
  loeschFehler.value = ''
  try {
    await $fetch(`/api/kurse/foren/beitrag/${zuLoeschendeBeitragId.value}`, { method: 'DELETE' })
    zeigeLoeschDialog.value = false
    await refreshForums()
  } catch (err) {
    loeschFehler.value = err?.data?.message || 'Beitrag konnte nicht gelöscht werden.'
  } finally {
    loeschtBeitragId.value = null
    zuLoeschendeBeitragId.value = null
  }
}

  const dateiLoeschen = (id) => {
  console.log('dateiLoeschen aufgerufen mit id:', id)  // ← NEU
  zuLoeschendeDateiId.value = id
  zeigeLoeschDialogDatei.value = true
}

const dateiLoeschenBestaetigen = async () => {
  loeschtDateiId.value = zuLoeschendeDateiId.value
  loeschDateiFehler.value = ''
  try {
    await $fetch(`/api/dateien/${zuLoeschendeDateiId.value}`, { method: 'DELETE' })
    zeigeLoeschDialogDatei.value = false
    await refreshFiles()
  } catch (err) {
    loeschDateiFehler.value = err?.data?.message || 'Datei konnte nicht gelöscht werden.'
  } finally {
    loeschtDateiId.value = null
    zuLoeschendeDateiId.value = null
  }
}

const supabase = useSupabaseClient()
const { data: { publicUrl } } = supabase.storage.from('kurs_dateien').getPublicUrl('')
const publicUrlBase = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/'

// 3. Tab-Steuerung
const aktiverTab = ref('Altklausuren')
const tabs = ['Altklausuren', 'Karteikarten', 'Mitschriften', 'Alle Ressourcen']

// --- Steuerung für die Bewertungs-Popups ---
const zeigeKursBewertung = ref(false)
const zeigeDozentBewertung = ref(false)
const zuBewertendenDozentId = ref(null)
const bewertungsFehler = ref('')

// Die ID des aktuellen Dozenten sicher auslesen
const aktuelleDozentId = computed(() => {
  return course.value?.dozenten?.[0]?.dozent?.id || null
})

const kursBewertungStarten = async () => {
  bewertungsFehler.value = ''

  if (!user.value) {
    bewertungsFehler.value = 'Du musst angemeldet sein, um eine Bewertung abzugeben.'
    return
  }

  try {
    const { alreadyRated } = await $fetch(`/api/kurse/bewertung/check?kursID=${urlId}`)

    if (alreadyRated) {
      bewertungsFehler.value = 'Du hast diesen Kurs bereits bewertet.'
      return
    }

    zeigeKursBewertung.value = true
  } catch (error) {
    console.error('Fehler beim Prüfen der Kursbewertung:', error)
    bewertungsFehler.value = 'Bewertung konnte nicht geprüft werden.'
  }
}

// Fehlermeldung erscheint, sobald jemand mehr als einmal bewerten möchte:
const dozentBewertungStarten = async (dozentId) => {
  bewertungsFehler.value = ''

  if (!user.value) {
    bewertungsFehler.value = 'Du musst angemeldet sein, um eine Bewertung abzugeben.'
    return
  }

  if (!dozentId) {
    bewertungsFehler.value = 'Zu diesem Kurs ist kein Dozent hinterlegt.'
    return
  }

  try {
    const { alreadyRated } = await $fetch(
      `/api/dozenten/bewertung/check?dozentID=${dozentId}`
    )

    if (alreadyRated) {
      bewertungsFehler.value = 'Du hast diesen Dozenten bereits bewertet.'
      return
    }

    zuBewertendenDozentId.value = dozentId
    zeigeDozentBewertung.value = true
  } catch (error) {
    console.error('Fehler beim Prüfen der Dozentenbewertung:', error)
    bewertungsFehler.value = 'Bewertung konnte nicht geprüft werden.'
  }
}

// Wenn eine Bewertung gespeichert wurde, wird die Seite neu geladen
const datenNeuLaden = async () => {
  // Diese Funktionen laden nur die Daten im Hintergrund neu
  await refreshCourse()
  await refreshForums()
  await refreshFiles()

  // Da kein Seiten-Reload stattfindet, bleibt der Darkmode-Status
  // der Website (im HTML-Tag oder State) unangetastet!
}

// 4. Daten zusammenstellen
const modulDaten = computed(() => {
  const kursInfo = course.value?.kurs;
  const dozentenInfo = course.value?.dozenten;
  const bewertungen = course.value?.bewertungen;

  const hauptDozent = dozentenInfo && dozentenInfo.length > 0
      ? `${dozentenInfo[0].dozent.vorname} ${dozentenInfo[0].dozent.nachname}`
      : 'Kein Dozent zugewiesen';

  const dozentBewertung = dozentenInfo && dozentenInfo.length > 0
      ? dozentenInfo[0].dozent.gesamtbewertung || 'Keine Bewertung'
      : '-';

  return {
    id: kursInfo?.modul_id || 'Lädt...',
    name: kursInfo?.name || 'Kurs wird geladen...',
    beschreibung: kursInfo?.beschreibung || 'Keine Beschreibung verfügbar.',
    dozent: hauptDozent,
    bewertungModul: bewertungen?.gesamtbewertung || 'Keine Bewertungen',
    bewertungDozent: dozentBewertung
  }
})

const dozentenListe = computed(() => {
  return course.value?.dozenten?.map(item => item?.dozent).filter(Boolean) || []
})

// 5. Dateien aus der API aufbereiten
const formatDateityp = (dbTyp) => {
  if (dbTyp === 'altklausur') return 'Altklausuren'
  if (dbTyp === 'loesung') return 'Lösungen'
  if (dbTyp === 'mitschrift') return 'Mitschriften'
  return dbTyp
}

// Hilfsfunktion: Vereinheitlicht das Jahr auf 4 Ziffern und kürzt das Semester ab
const formatiereSemesterUndJahr = (semester, jahr) => {
  if (!semester && !jahr) return '';

  let semStr = semester === 'Sommersemester' ? 'SoSe' : (semester === 'Wintersemester' ? 'WiSe' : (semester || ''));
  let jahrStr = String(jahr || '').trim();

  // Aus "26" wird "2026"
  if (/^\d{2}$/.test(jahrStr)) {
    jahrStr = '20' + jahrStr;
  }
  // Aus "25/26" wird "2025/2026"
  else if (/^\d{2}\/\d{2}$/.test(jahrStr)) {
    const parts = jahrStr.split('/');
    jahrStr = `20${parts[0]}/20${parts[1]}`;
  }
  // Aus "2025/26" wird "2025/2026"
  else if (/^\d{4}\/\d{2}$/.test(jahrStr)) {
    const parts = jahrStr.split('/');
    jahrStr = `${parts[0]}/20${parts[1]}`;
  }

  return `${semStr} ${jahrStr}`.trim();
}

const materialien = computed(() => {
  if (!files.value?.dateien) return []

  return files.value.dateien.map(item => {
    return {
      id: item.id,
      nutzerID: item.nutzerID, 
      name: item.dateiname || item.dateipfad.split('/').pop(),
      typ: formatDateityp(item.typ),
      autor: item.profile?.name || 'Nutzer',
      semester: item.semester || '',
      jahr: item.jahr || '',
      anzeigeSemester: formatiereSemesterUndJahr(item.semester, item.jahr),
      datumRaw: item.created_at,
      datum: item.created_at ? new Date(item.created_at).toLocaleDateString('de-DE') : 'Unbekannt',
      urlAnsehen: `${publicUrlBase}${item.dateipfad}`,
      urlDownload: `${publicUrlBase}${item.dateipfad}?download=${item.dateiname || 'download'}`
    }
  })
})

// --- SORTIERUNG DER DATEIEN ---
const sortierung = ref('neueste')

const toggleSortierung = () => {
  sortierung.value = sortierung.value === 'neueste' ? 'aelteste' : 'neueste'
}

const sortierteMaterialien = computed(() => {
  // 1. Nach Tab filtern
  let liste = materialien.value.filter(m => aktiverTab.value === 'Alle Ressourcen' || m.typ === aktiverTab.value);

  // 2. Sortieren
  return liste.sort((a, b) => {
    const getYearNumber = (jahrStr) => {
      if (!jahrStr) return 0;
      const match = String(jahrStr).match(/\d{2,4}/);
      if (!match) return 0;
      let y = parseInt(match[0]);
      return y < 100 ? y + 2000 : y;
    };

    const jahrA = getYearNumber(a.jahr);
    const jahrB = getYearNumber(b.jahr);

    if (jahrA !== jahrB) {
      return sortierung.value === 'neueste' ? jahrB - jahrA : jahrA - jahrB;
    } else {
      const timeA = new Date(a.datumRaw).getTime() || 0;
      const timeB = new Date(b.datumRaw).getTime() || 0;
      return sortierung.value === 'neueste' ? timeB - timeA : timeA - timeB;
    }
  });
})

// Hilfsfunktion Sterne
const generiereSterne = (wert) => {
  if (!wert || isNaN(wert)) return '☆☆☆☆☆';
  const gerundet = Math.round(wert * 2) / 2;
  const volleSterne = Math.floor(gerundet);
  const hatHalbenStern = gerundet % 1 !== 0;
  const leereSterne = 5 - Math.ceil(gerundet);
  let sterneText = '';
  sterneText += '★'.repeat(volleSterne);
  if (hatHalbenStern) sterneText += '⯨';
  sterneText += '☆'.repeat(leereSterne);
  return sterneText;
}

const truncateText = (text, maxLength = 200) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '…' : text
}

// --- ABONNEMENT LOGIK ---
const { data: aboData, refresh: refreshAbos } = await useFetch("/api/bekommt-updates")

const istAbonniert = computed(() => {
  const abos = aboData.value?.abonnements || []
  return abos.some(a => Number(a.kursID) === Number(urlId))
})

const togglingAbo = ref(false)

const toggleAbo = async () => {
  if (togglingAbo.value) return
  togglingAbo.value = true

  try {
    if (istAbonniert.value) {
      await $fetch(`/api/bekommt-updates/${urlId}`, { method: "DELETE" })
    } else {
      await $fetch("/api/bekommt-updates", {
        method: "POST",
        body: { kursID: Number(urlId) },
      })
    }
    await refreshAbos()
  } catch (error) {
    console.error("Fehler beim Ändern des Abonnements:", error)
  } finally {
    togglingAbo.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-800 dark:text-gray-100 pb-20 transition-colors duration-300">
    <div class="max-w-7xl mx-auto p-4 md:p-8">

      <!-- ZURÜCK-BUTTON -->
      <div class="mb-6 pl-2">
        <NuxtLink to="/courses" class="inline-flex items-center text-green-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors">
          <span class="mr-2 text-2xl leading-none">&larr;</span> Zurück zur Kursübersicht
        </NuxtLink>
      </div>

      <!-- HEADER -->
      <header class="rounded-[2.5rem] bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-700 dark:to-blue-900 p-6 shadow-lg shadow-blue-900/10 dark:shadow-black/50 mb-8 relative overflow-hidden text-center">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tight text-white relative z-10 break-words whitespace-normal"
            style="overflow-wrap:anywhere; word-break:break-word;">
          {{ modulDaten.name }}
        </h1>
        <p class="mt-4 text-lg text-green-50 dark:text-gray-200 max-w-none mx-auto relative z-10 font-medium leading-relaxed">
          {{ modulDaten.beschreibung }}
        </p>
      </header>

      <!-- Haupt-Grid-Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- LINKE SPALTE (Dateien & Kursinfos) -->
        <div class="lg:col-span-2 space-y-8">

          <!-- Bereich: Dateien und Sortierung -->
          <section class="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-black/40 border border-green-50 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div class="p-8">

              <NuxtLink :to="`/dataAdd?kursId=${urlId}`">
                <button class="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 dark:from-green-600 dark:to-blue-700 dark:hover:from-green-500 dark:hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:-translate-y-1 shadow-md mb-8 flex items-center gap-2">
                  <span class="text-2xl leading-none">+</span> MEHR HOCHLADEN
                </button>
              </NuxtLink>

              <!-- TABS UND SORTIER-BUTTON -->
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 mb-6 pb-2">
                <div class="flex overflow-x-auto gap-4">
                  <button
                      v-for="tab in tabs" :key="tab"
                      @click="aktiverTab = tab"
                      :class="['font-bold text-sm transition-colors whitespace-nowrap pb-1',
                      aktiverTab === tab ? 'text-green-600 dark:text-green-400 border-b-4 border-green-500 dark:border-green-400' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300']"
                  >
                    {{ tab.toUpperCase() }}
                  </button>
                </div>

                <button
                    @click="toggleSortierung"
                    class="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-gray-800 px-3 py-1.5 rounded-full transition-colors"
                >
                  <span class="text-base leading-none">{{ sortierung === 'neueste' ? '↓' : '↑' }}</span>
                  {{ sortierung === 'neueste' ? 'Neueste zuerst' : 'Älteste zuerst' }}
                </button>
              </div>

              <!--Container, unter der alle Dateien liegen inkl Scrollbar -->
              <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                <div
                  v-if="sortierteMaterialien.length === 0"
                  class="p-8 text-center text-slate-400 dark:text-gray-400 font-medium bg-slate-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-700 transition-colors duration-300"
                >
                  Noch keine Dateien in dieser Kategorie vorhanden.
                </div>

                <p v-if="loeschDateiFehler" class="text-red-500 text-xs font-medium">{{ loeschDateiFehler }}</p>

                <div
                  v-for="file in sortierteMaterialien" :key="file.id"
                  class="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700 hover:border-green-100 dark:hover:border-green-500 transition-colors"
                >
                  <NuxtLink
                    :to="`/courses/${urlId}/files/${file.id}`"
                    class="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                  >
                    <div class="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-900 text-green-500 dark:text-green-400 rounded-full shadow-sm text-xl flex-shrink-0">
                      📄
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-800 dark:text-gray-100 truncate">{{ file.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-gray-400 font-medium mt-0.5">
                        <span v-if="file.anzeigeSemester" class="text-blue-600 dark:text-blue-400 font-bold mr-2">
                          {{ file.anzeigeSemester }}
                        </span>
                        Uploaded by {{ file.autor }}, {{ file.datum }}
                      </p>
                    </div>
                  </NuxtLink>

                  <div class="flex items-center gap-1 flex-shrink-0 ml-4">
                    <a
                      :href="file.urlDownload"
                      :download="file.name"
                      class="p-2 text-slate-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      title="Herunterladen"
                    >
                      📥
                    </a>
                    <!-- NEU: Löschen-Button -->
                    <button
                      v-if="user?.id === file.nutzerID"
                      @click="dateiLoeschen(file.id)"
                      :disabled="loeschtDateiId === file.id"
                      class="p-2 text-slate-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors text-xs font-bold"
                      title="Datei löschen"
                    >
                      <span v-if="loeschtDateiId === file.id">...</span>
                      <span v-else>✕</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <!-- Bereich: Dozent, Kurs Info & Bewertungen -->
          <!-- Bereich: Bewertungen & Kurs-ID -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- Zusammengefasste Bewertungskarte (2 Spalten) -->
          <div class="md:col-span-2 flex flex-col bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-slate-100 dark:border-gray-700 shadow-lg shadow-blue-900/5 dark:shadow-black/40 hover:border-green-200 dark:hover:border-green-500 transition-colors">

            <p class="text-sm font-bold text-slate-400 dark:text-gray-500 mb-1">Kurs</p>
            <p class="font-bold text-slate-800 dark:text-gray-100 text-lg break-words whitespace-normal"
               style="overflow-wrap:anywhere; word-break:break-word;">{{ modulDaten.name }}</p>

            <!-- Gesamtbewertung prominent -->
            <div class="flex items-center gap-3 my-3">
              <span class="text-amber-400 text-xl leading-none">{{ generiereSterne(modulDaten.bewertungModul) }}</span>
              <span class="text-sm font-semibold text-slate-500 dark:text-gray-400">
                {{ isNaN(modulDaten.bewertungModul) ? '-' : Number(modulDaten.bewertungModul).toFixed(1) }}
                <span class="text-xs font-bold text-slate-400 dark:text-gray-600 ml-1">Gesamt</span>
              </span>
            </div>

            <div class="border-t border-slate-100 dark:border-gray-700 mb-4"></div>

            <!-- 4 Einzelkriterien im 2×2-Grid -->
            <div class="grid grid-cols-2 gap-x-6 gap-y-4 flex-1">
              <div v-for="k in bewertungsKriterien" :key="k.label">
                <p class="text-xs font-bold text-slate-400 dark:text-gray-500 mb-1">{{ k.label }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-amber-400 text-base leading-none">{{ generiereSterne(k.wert) }}</span>
                  <span class="text-xs font-semibold text-slate-500 dark:text-gray-400">
                    {{ (k.wert == null || isNaN(k.wert)) ? '-' : Number(k.wert).toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>

            <button
                @click="kursBewertungStarten"
                class="mt-5 w-full bg-slate-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-bold py-2 rounded-xl text-sm transition-colors border border-slate-100 dark:border-gray-700">
              Kurs bewerten
            </button>
          </div>

          <!-- Kurs-ID & Abonnieren (unverändert) -->
          <div class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-[2rem] border border-green-100 dark:border-gray-700 shadow-lg shadow-blue-900/5 dark:shadow-black/40 flex flex-col items-center text-center transition-colors duration-300">
            <div class="my-auto">
              <p class="text-sm font-bold text-green-600 dark:text-green-500 mb-1 uppercase tracking-wider">Kurs-ID</p>
              <p class="text-2xl font-black text-blue-900 dark:text-blue-100">{{ modulDaten.id }}</p>
            </div>
            <button
                @click="toggleAbo"
                :disabled="togglingAbo"
                class="mt-auto w-full py-2 px-4 rounded-xl text-sm font-bold border transition-all duration-200 flex justify-center items-center gap-2 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!istAbonniert" class="text-lg leading-none">+</span>
              <span v-else class="text-lg leading-none">✓</span>
              <span>{{ istAbonniert ? 'Abonniert' : 'Abonnieren' }}</span>
            </button>
          </div>

          <!-- Fehlermeldung -->
          <div v-if="bewertungsFehler" class="md:col-span-3">
            <p class="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {{ bewertungsFehler }}
            </p>
          </div>

        </div>

        <section class="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-blue-900/5 dark:shadow-black/40 border border-slate-100 dark:border-gray-700 transition-colors duration-300">
          <div class="p-8">
            <h2 class="text-sm font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Lehrende zu diesem Kurs
            </h2>

            <div class="flex flex-col gap-3">

              <!-- Leerzustand -->
              <div v-if="dozentenListe.length === 0" class="text-slate-500 dark:text-gray-400 text-sm">
                Zu diesem Kurs sind derzeit keine Lehrenden hinterlegt.
              </div>

              <!-- Dozenten-Karte -->
              <div
                v-for="dozent in dozentenListe"
                :key="dozent.id"
                class="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-xl border border-transparent dark:border-gray-700 hover:border-green-100 dark:hover:border-green-500 transition-colors"
              >
                <!-- Name + Sterne -->
                <NuxtLink
                  :to="`/lecturers/${dozent.id}`"
                  class="flex flex-col gap-1 flex-1 min-w-0"
                >
                  <p class="font-bold text-slate-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    {{ dozent.vorname }} {{ dozent.nachname }}
                  </p>
                  <div class="flex items-center gap-2">
                    <span class="text-amber-400 text-sm leading-none">
                      {{ generiereSterne(dozent.gesamtbewertung) }}
                    </span>
                    <span class="text-xs font-semibold text-slate-500 dark:text-gray-400">
                      {{ (dozent.gesamtbewertung == null || isNaN(dozent.gesamtbewertung))
                          ? '-'
                          : Number(dozent.gesamtbewertung).toFixed(1) }}
                    </span>
                  </div>
                </NuxtLink>

                <!-- Bewerten-Button -->
                <button
                  @click="dozentBewertungStarten(dozent.id)"
                  class="ml-4 flex-shrink-0 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-slate-100 dark:border-gray-700"
                >
                  Bewerten
                </button>
              </div>

            </div>
          </div>
        </section>

        </div> <!-- Ende LINKE SPALTE -->

        <!-- RECHTE SPALTE (Diskussionen) -->
        <aside class="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-black/40 border border-slate-100 dark:border-gray-700 flex flex-col h-fit overflow-hidden transition-colors duration-300">

          <div class="p-6 bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700 text-center transition-colors duration-300">
            <h2 class="font-extrabold text-slate-700 dark:text-gray-100 uppercase tracking-widest text-sm">Diskussionen</h2>
          </div>

          <!-- Beitragsliste -->
          <div class="p-6 space-y-4 max-h-72 overflow-y-auto">
            <div v-if="!forums?.beitraege?.length" class="text-center py-4 text-slate-400 dark:text-gray-500 text-sm">
              Noch keine Diskussionen.
            </div>

            <p v-if="loeschFehler" class="text-red-500 text-xs font-medium">{{ loeschFehler }}</p>

            <div
              v-for="(item, index) in forums?.beitraege"
              :key="item.id"
              :class="[index > 0 ? 'border-t border-slate-100 dark:border-gray-700 pt-4' : '']"
            >
              <!-- Zeile 1: Titel + ✕ -->
              <div class="flex items-start gap-2 mb-2">
                <NuxtLink
                  :to="`/courses/${urlId}/${item.id}`"
                  class="flex-1 min-w-0 group"
                >
                  <p class="font-bold text-sm text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style="overflow-wrap:anywhere;" :title="item.thema">
                    {{ truncateText(item.thema) }}
                  </p>
                </NuxtLink>
                <button
                  v-if="user?.id === item.nutzerID"
                  @click="beitragLoeschen(item.id)"
                  :disabled="loeschtBeitragId === item.id"
                  class="flex-shrink-0 text-slate-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors text-xs font-bold leading-none mt-0.5"
                  title="Beitrag löschen"
                >
                  <span v-if="loeschtBeitragId === item.id">...</span>
                  <span v-else>✕</span>
                </button>
              </div>

              <!-- Zeile 2: Avatar + Name + blauer Punkt -->
              <NuxtLink
                :to="`/courses/${urlId}/${item.id}`"
                class="flex items-center gap-2"
              >
                <img
                  v-if="item.profile?.avatar"
                  :src="`/avatars/${item.profile.avatar}.png`"
                  :alt="item.profile?.name || 'Nutzer'"
                  class="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
                <div v-else class="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black">
                  {{ (item.profile?.name || 'N')[0].toUpperCase() }}
                </div>
                <p class="text-xs font-medium text-slate-400 dark:text-gray-500 flex-1">
                  {{ item.profile?.name || 'Nutzer' }} ·
                  {{ new Date(item.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
                </p>
                <span
                  v-if="item.kommentar_kurs?.[0]?.count > 0"
                  class="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"
                  title="Wurde beantwortet"
                ></span>
              </NuxtLink>
            </div>
          </div>

          <!-- Eingabe nur für angemeldete Nutzer -->
          <div class="p-6 mt-auto bg-slate-50 dark:bg-gray-800 border-t border-slate-100 dark:border-gray-700 space-y-3 transition-colors duration-300">
            <div v-if="user">
              <p v-if="postFehler" class="text-red-500 text-xs font-medium mb-2">{{ postFehler }}</p>
              <textarea
                  v-model="neuesDiskussionsThema"
                  class="w-full p-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl text-sm text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-300"
                  rows="3"
                  placeholder="Stell eine Frage..."
                  maxlength="1000"
                  :disabled="postet"
              ></textarea>
              <div class="flex justify-between items-center mt-2">
                <div></div>
                <p v-if="neuesDiskussionsThema.length > 0" class="text-xs font-medium transition-colors" :class="neuesDiskussionsThema.length >= 900 ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-gray-500'">
                  {{ neuesDiskussionsThema.length }}/1000
                </p>
              </div>
              <button
                  @click="diskussionPosten"
                  :disabled="postet || !neuesDiskussionsThema.trim()"
                  class="w-full bg-slate-800 dark:bg-gray-700 text-white font-bold py-3 rounded-full hover:bg-green-600 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-sm mt-3"
              >
                {{ postet ? 'WIRD GEPOSTET...' : 'POSTEN' }}
              </button>
            </div>
            <div v-else class="text-center py-2">
              <p class="text-slate-500 dark:text-gray-400 text-sm mb-3 font-medium">Anmelden um zu diskutieren.</p>
              <NuxtLink
                  to="/login"
                  class="inline-block bg-slate-800 dark:bg-gray-700 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 dark:hover:bg-green-600 transition-colors text-sm"
              >
                Anmelden
              </NuxtLink>
            </div>
          </div>

        </aside> <!-- Ende RECHTE SPALTE -->

      </div> <!-- Ende Haupt-Grid-Layout -->

    </div> <!-- Ende max-w-7xl -->
  </div> <!-- Ende min-h-screen -->

  <!-- Popups -->
  <div v-if="zeigeKursBewertung" class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <BewertungKurs
        :kursId="urlId"
        @abbrechen="zeigeKursBewertung = false"
        @gespeichert="zeigeKursBewertung = false; datenNeuLaden()"
    />
  </div>

  <div v-if="zeigeDozentBewertung" class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <BewertungProf
        :dozentId="zuBewertendenDozentId"
        @abbrechen="zeigeDozentBewertung = false"
        @gespeichert="zeigeDozentBewertung = false; datenNeuLaden()"
    />
  </div>

  <ConfirmDialog
    v-if="zeigeLoeschDialog"
    nachricht="Möchtest du diesen Beitrag wirklich löschen?"
    :laedt="loeschtBeitragId !== null"
    @bestaetigen="loeschenBestaetigen"
    @abbrechen="zeigeLoeschDialog = false; zuLoeschendeBeitragId = null"
  />
  <ConfirmDialog
    v-if="zeigeLoeschDialogDatei"
    nachricht="Möchtest du diese Datei wirklich löschen?"
    :laedt="loeschtDateiId !== null"
    @bestaetigen="dateiLoeschenBestaetigen"
    @abbrechen="zeigeLoeschDialogDatei = false; zuLoeschendeDateiId = null"
  />
</template>