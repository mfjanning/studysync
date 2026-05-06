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

const user = useSupabaseUser()
const neuesDiskussionsThema = ref('')
const postet = ref(false)
const postFehler = ref('')

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

const supabase = useSupabaseClient()
const { data: { publicUrl } } = supabase.storage.from('kurs_dateien').getPublicUrl('')
const publicUrlBase = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/'

// 3. Tab-Steuerung
const aktiverTab = ref('Altklausuren')
const tabs = ['Altklausuren', 'Lösungen', 'Mitschriften', 'Alle Ressourcen']

// --- Steuerung für die Bewertungs-Popups ---
const zeigeKursBewertung = ref(false)
const zeigeDozentBewertung = ref(false)

// Die ID des aktuellen Dozenten sicher auslesen
const aktuelleDozentId = computed(() => {
  return course.value?.dozenten?.[0]?.dozent?.id || null
})

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
  <div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-800 dark:text-gray-100 pb-12 transition-colors duration-300">
    <div class="max-w-7xl mx-auto p-4 md:p-8">

      <!-- ZURÜCK-BUTTON -->
      <div class="mb-6 pl-2">
        <NuxtLink to="/courses" class="inline-flex items-center text-green-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors">
          <span class="mr-2 text-2xl leading-none">&larr;</span> Zurück zur Kursübersicht
        </NuxtLink>
      </div>

      <!-- HEADER -->
      <header class="rounded-[2.5rem] bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-700 dark:to-blue-900 p-10 shadow-lg shadow-blue-900/10 dark:shadow-black/50 mb-8 relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tight text-white relative z-10">
          {{ modulDaten.name }}
        </h1>
        <p class="mt-4 text-lg text-green-50 dark:text-gray-200 max-w-3xl relative z-10 font-medium leading-relaxed">
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

              <div class="space-y-4">
                <div
                    v-if="sortierteMaterialien.length === 0"
                    class="p-8 text-center text-slate-400 dark:text-gray-400 font-medium bg-slate-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-700 transition-colors duration-300"
                >
                  Noch keine Dateien in dieser Kategorie vorhanden.
                </div>

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

                  <a
                      :href="file.urlDownload"
                      :download="file.name"
                      class="ml-4 p-2 text-slate-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                      title="Herunterladen">
                    📥
                  </a>
                </div>
              </div>

            </div>
          </section>

          <!-- Bereich: Dozent, Kurs Info & Bewertungen -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="h-full flex flex-col bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-slate-100 dark:border-gray-700 shadow-lg shadow-blue-900/5 dark:shadow-black/40 hover:border-green-200 dark:hover:border-green-500 transition-colors">
              <p class="text-sm font-bold text-slate-400 dark:text-gray-500 mb-2">Dozent</p>
              <p class="font-bold text-slate-800 dark:text-gray-100 text-lg">{{ modulDaten.dozent }}</p>

              <div class="flex text-amber-400 my-2 text-lg">
                {{ generiereSterne(modulDaten.bewertungDozent) }}
              </div>

              <p class="text-xs font-semibold text-slate-500 dark:text-gray-400">
                Rating: {{ isNaN(modulDaten.bewertungDozent) ? '-' : Number(modulDaten.bewertungDozent).toFixed(1) }}
              </p>
              <button
                  v-if="aktuelleDozentId"
                  @click="zeigeDozentBewertung = true"
                  class="mt-auto w-full bg-slate-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-bold py-2 rounded-xl text-sm transition-colors border border-slate-100 dark:border-gray-700">
                Dozent bewerten
              </button>
            </div>

            <div class="h-full flex flex-col bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-slate-100 dark:border-gray-700 shadow-lg shadow-blue-900/5 dark:shadow-black/40 hover:border-green-200 dark:hover:border-green-500 transition-colors">
              <p class="text-sm font-bold text-slate-400 dark:text-gray-500 mb-2">Kurs</p>
              <p class="font-bold text-slate-800 dark:text-gray-100 text-lg line-clamp-1">{{ modulDaten.name }}</p>

              <div class="flex text-amber-400 my-2 text-lg">
                {{ generiereSterne(modulDaten.bewertungModul) }}
              </div>

              <p class="text-xs font-semibold text-slate-500 dark:text-gray-400">
                Rating: {{ isNaN(modulDaten.bewertungModul) ? '-' : Number(modulDaten.bewertungModul).toFixed(1) }}
              </p>

              <button
                  @click="zeigeKursBewertung = true"
                  class="mt-auto w-full bg-slate-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold py-2 rounded-xl text-sm transition-colors border border-slate-100 dark:border-gray-700">
                Kurs bewerten
              </button>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-[2rem] border border-green-100 shadow-lg shadow-blue-900/5 flex flex-col justify-center items-center text-center">
              <p class="text-sm font-bold text-green-600 mb-1 uppercase tracking-wider">Kurs-ID</p>
              <p class="text-2xl font-black text-blue-900">{{ modulDaten.id }}</p>
            </div>
          </div>

        </div> <!-- Ende LINKE SPALTE -->

        <!-- RECHTE SPALTE (Diskussionen) -->
        <aside class="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-black/40 border border-slate-100 dark:border-gray-700 flex flex-col h-fit overflow-hidden transition-colors duration-300">

          <div class="p-6 bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700 text-center transition-colors duration-300">
            <h2 class="font-extrabold text-slate-700 dark:text-gray-100 uppercase tracking-widest text-sm">Diskussionen</h2>
          </div>

          <!-- Echte Beiträge aus der Datenbank -->
          <div class="p-6 space-y-4 max-h-72 overflow-y-auto">
            <div v-if="!forums?.beitraege?.length" class="text-center py-4 text-slate-400 dark:text-gray-500 text-sm">
              Noch keine Diskussionen.
            </div>
            <NuxtLink
              v-for="(item, index) in forums?.beitraege"
              :key="item.id"
              :to="`/courses/${urlId}/${item.id}`"
              :class="['block group', index > 0 ? 'border-t border-slate-100 dark:border-gray-700 pt-4' : '']"
            >
              <p class="font-bold text-sm text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">{{ item.thema }}</p>
              <div class="flex items-center gap-2">
                <img
                  v-if="item.profile?.avatar"
                  :src="item.profile.avatar"
                  :alt="item.profile?.name || 'Nutzer'"
                  class="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
                <div v-else class="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black">
                  {{ (item.profile?.name || 'N')[0].toUpperCase() }}
                </div>
                <p class="text-xs font-medium text-slate-400 dark:text-gray-500">
                  {{ item.profile?.name || 'Nutzer' }} ·
                  {{ new Date(item.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
                </p>
              </div>
            </NuxtLink>
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
                :disabled="postet"
              ></textarea>
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
        :dozentId="aktuelleDozentId"
        @abbrechen="zeigeDozentBewertung = false"
        @gespeichert="zeigeDozentBewertung = false; datenNeuLaden()"
    />
  </div>
</template>