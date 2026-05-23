<script setup>
import { ref } from 'vue'

const route = useRoute()

const { data: lecturer, refresh: refreshLecturer } = await useFetch('/api/dozenten/' + route.params.id)
const { data: forums, refresh: refreshForums } = await useFetch('/api/dozenten/foren/' + route.params.id)

const session = useSupabaseSession()
const user = computed(() => session.value?.user ?? null)

const neuesDiskussionsThema = ref('')
const postet = ref(false)
const postFehler = ref('')
const loeschFehler = ref('') 
const bewertungsFehler = ref('')
const loeschtBeitragId = ref(null)
const zeigeLoeschDialog = ref(false)
const zuLoeschendeBeitragId = ref(null)

const beitragLoeschen = (id) => {
  zuLoeschendeBeitragId.value = id
  zeigeLoeschDialog.value = true
}

const loeschenBestaetigen = async () => {
  loeschtBeitragId.value = zuLoeschendeBeitragId.value
  loeschFehler.value = ''
  try {
    await $fetch(`/api/dozenten/foren/beitrag/${zuLoeschendeBeitragId.value}`, { method: 'DELETE' })
    zeigeLoeschDialog.value = false
    await refreshForums()
  } catch (err) {
    loeschFehler.value = err?.data?.message || 'Beitrag konnte nicht gelöscht werden.'
  } finally {
    loeschtBeitragId.value = null
    zuLoeschendeBeitragId.value = null
  }
}

const diskussionPosten = async () => {
  if (!neuesDiskussionsThema.value.trim()) return
  postet.value = true
  postFehler.value = ''
  try {
    await $fetch('/api/dozenten/foren', {
      method: 'POST',
      body: { dozentID: Number(route.params.id), thema: neuesDiskussionsThema.value.trim() }
    })
    neuesDiskussionsThema.value = ''
    await refreshForums()
  } catch (err) {
    postFehler.value = err?.data?.message || err?.message || 'Beitrag konnte nicht gespeichert werden.'
  } finally {
    postet.value = false
  }
}

// Steuerung für die Bewertungs-Popups
const zeigeDozentBewertung = ref(false)
const zeigeKursBewertung = ref(false)
const zuBewertendenKursId = ref(null)

// Dozentenbewertung starten
const dozentBewertungStarten = async () => {
  bewertungsFehler.value = ''

  if (!user.value) {
    bewertungsFehler.value = 'Du musst angemeldet sein, um eine Bewertung abzugeben.'
    return
  }

  try {
    const { alreadyRated } = await $fetch(`/api/dozenten/bewertung/check?dozentID=${route.params.id}`)

    if (alreadyRated) {
      bewertungsFehler.value = 'Du hast diesen Dozenten bereits bewertet.'
      return
    }

    zeigeDozentBewertung.value = true
  } catch (error) {
    console.error('Fehler beim Prüfen der Dozentenbewertung:', error)
    bewertungsFehler.value = 'Bewertung konnte nicht geprüft werden.'
  }
}

// Kursbewertung starten
const kursBewertungStarten = async (kursId) => {
  bewertungsFehler.value = ''

  if (!user.value) {
    bewertungsFehler.value = 'Du musst angemeldet sein, um eine Bewertung abzugeben.'
    return
  }

  try {
    const { alreadyRated } = await $fetch(`/api/kurse/bewertung/check?kursID=${kursId}`)

    if (alreadyRated) {
      bewertungsFehler.value = 'Du hast diesen Kurs bereits bewertet.'
      return
    }

    zuBewertendenKursId.value = kursId
    zeigeKursBewertung.value = true
  } catch (error) {
    console.error('Fehler beim Prüfen der Kursbewertung:', error)
    bewertungsFehler.value = 'Bewertung konnte nicht geprüft werden.'
  }
}

const datenNeuLaden = async () => {
  await refreshLecturer()
}

const generiereSterne = (wert) => {
  if (!wert || isNaN(wert)) return '☆☆☆☆☆';
  const gerundet = Math.round(wert);
  return '★'.repeat(gerundet) + '☆'.repeat(5 - gerundet);
}

const truncateText = (text, maxLength = 200) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '…' : text
}

</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-800 dark:text-gray-100 pb-12 transition-colors duration-300">
    <div class="max-w-7xl mx-auto p-4 md:p-8">

      <!-- Zurück-Link -->
      <div class="mb-6 pl-2">
        <NuxtLink to="/lecturers" class="inline-flex items-center text-green-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors">
          <span class="mr-2 text-2xl leading-none">&larr;</span> Zurück zur Dozentenübersicht
        </NuxtLink>
      </div>

      <!-- Header -->
      <header class="rounded-[2.5rem] bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-700 dark:to-blue-900 p-10 shadow-lg shadow-blue-900/10 dark:shadow-black/50 mb-8 relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tight text-white relative z-10">
          {{ lecturer?.dozent?.vorname }} {{ lecturer?.dozent?.nachname }}
        </h1>

        <p class="mt-4 text-lg text-green-50 dark:text-gray-200 max-w-3xl relative z-10 font-medium leading-relaxed">
          Bewertungsübersicht & Informationen zum Dozenten
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- LEFT SIDE -->
        <div class="lg:col-span-2 space-y-8">

          <!-- BEWERTUNGEN -->
          <section class="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-black/40 border border-green-50 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div class="p-8">

              <h2 class="text-xl font-extrabold text-slate-700 dark:text-gray-100 uppercase tracking-widest mb-6">
                Bewertungen
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-slate-50 dark:bg-gray-800 p-5 rounded-2xl transition-colors duration-300">
                  <p class="text-sm text-slate-400 dark:text-gray-500 font-bold">Verständlichkeit</p>
                  <div class="text-amber-400 text-lg my-1">
                    {{ generiereSterne(lecturer?.bewertungen?.verstaendlichkeit) }}
                  </div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-gray-100">
                    {{ lecturer?.bewertungen?.verstaendlichkeit || '-' }}
                  </p>
                </div>

                <div class="bg-slate-50 dark:bg-gray-800 p-5 rounded-2xl transition-colors duration-300">
                  <p class="text-sm text-slate-400 dark:text-gray-500 font-bold">Struktur</p>
                  <div class="text-amber-400 text-lg my-1">
                    {{ generiereSterne(lecturer?.bewertungen?.struktur) }}
                  </div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-gray-100">
                    {{ lecturer?.bewertungen?.struktur || '-' }}
                  </p>
                </div>

                <div class="bg-slate-50 dark:bg-gray-800 p-5 rounded-2xl transition-colors duration-300">
                  <p class="text-sm text-slate-400 dark:text-gray-500 font-bold">Engagement</p>
                  <div class="text-amber-400 text-lg my-1">
                    {{ generiereSterne(lecturer?.bewertungen?.engagement) }}
                  </div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-gray-100">
                    {{ lecturer?.bewertungen?.engagement || '-' }}
                  </p>
                </div>

                <div class="bg-slate-50 dark:bg-gray-800 p-5 rounded-2xl transition-colors duration-300">
                  <p class="text-sm text-slate-400 dark:text-gray-500 font-bold">Freundlichkeit</p>
                  <div class="text-amber-400 text-lg my-1">
                    {{ generiereSterne(lecturer?.bewertungen?.freundlichkeit) }}
                  </div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-gray-100">
                    {{ lecturer?.bewertungen?.freundlichkeit || '-' }}
                  </p>
                </div>
              </div>

              <!-- GESAMT -->
              <div class="mt-8 text-center flex flex-col items-center">
                <p class="text-sm text-slate-400 dark:text-gray-500 font-bold">Gesamtbewertung</p>
                <div class="text-amber-400 text-2xl my-2">
                  {{ generiereSterne(lecturer?.bewertungen?.gesamtbewertung) }}
                </div>
                <p class="font-bold text-lg text-slate-800 dark:text-gray-100 mb-6">
                  {{ lecturer?.bewertungen?.gesamtbewertung || 'Keine Bewertung' }}
                </p>

                <button 
                  @click="dozentBewertungStarten()" 
                  class="w-full max-w-sm bg-slate-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-bold py-3 rounded-xl transition-colors border border-slate-100 dark:border-gray-700">
                  Dozent bewerten
                </button>
              </div>

            </div>
          </section>

          <!-- ZENTRALE FEHLERMELDUNG -->
          <div v-if="bewertungsFehler" class="mb-4">
            <p class="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {{ bewertungsFehler }}
            </p>
          </div>

          <!-- KURSE -->
          <section class="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-blue-900/5 dark:shadow-black/40 border border-slate-100 dark:border-gray-700 transition-colors duration-300">
            <div class="p-8">
              <h2 class="text-xl font-extrabold text-slate-700 dark:text-gray-100 uppercase tracking-widest mb-4">
                Unterrichtete Kurse
              </h2>

              <div class="flex flex-col gap-3">

                <div v-if="!lecturer?.kurse?.length" class="text-slate-500 dark:text-gray-400 text-sm">
                  Keine Kurse gefunden.
                </div>

                <div
                  v-for="kurs in lecturer?.kurse"
                  :key="kurs.id"
                  class="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-xl border border-transparent dark:border-gray-700 hover:border-green-100 dark:hover:border-green-500 transition-colors"
                >
                  <NuxtLink
                    :to="`/courses/${kurs.id}`"
                    class="flex flex-col gap-1 flex-1 min-w-0"
                  >
                    <p class="font-bold text-slate-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      {{ kurs.name }}
                    </p>
                    <div class="flex items-center gap-2">
                      <span class="text-amber-400 text-sm leading-none">
                        {{ generiereSterne(kurs.gesamtbewertung) }}
                      </span>
                      <span class="text-xs font-semibold text-slate-500 dark:text-gray-400">
                        {{ (kurs.gesamtbewertung == null || isNaN(kurs.gesamtbewertung))
                            ? '-'
                            : Number(kurs.gesamtbewertung).toFixed(1) }}
                      </span>
                    </div>
                  </NuxtLink>

                  <button
                    @click="kursBewertungStarten(kurs.id)"
                    class="ml-4 flex-shrink-0 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-slate-100 dark:border-gray-700"
                  >
                    Bewerten
                  </button>
                </div>

              </div>
            </div>
          </section>

        </div>

        <!-- RIGHT SIDE (FORUM) -->
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
                  :to="`/lecturers/${route.params.id}/${item.id}`"
                  class="flex-1 min-w-0 group"
                >
                  <p class="font-bold text-sm text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style="overflow-wrap:anywhere;">
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
                :to="`/lecturers/${route.params.id}/${item.id}`"
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
                  v-if="item.kommentar_dozent?.[0]?.count > 0"
                  class="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"
                  title="Wurde beantwortet"
                ></span>
              </NuxtLink>
            </div>
          </div>

          <!-- Eingabe -->
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

        </aside>

      </div>
    </div>
  </div>

  <!-- Modals -->
  <div v-if="zeigeDozentBewertung" class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <BewertungProf 
      :dozentId="route.params.id" 
      @abbrechen="zeigeDozentBewertung = false; bewertungsFehler = ''" 
      @gespeichert="zeigeDozentBewertung = false; bewertungsFehler = ''; datenNeuLaden()" 
    />
  </div>

  <div v-if="zeigeKursBewertung" class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <BewertungKurs
      :kursId="zuBewertendenKursId"
      @abbrechen="zeigeKursBewertung = false; bewertungsFehler = ''"
      @gespeichert="zeigeKursBewertung = false; bewertungsFehler = ''; datenNeuLaden()"
    />
  </div>

  <ConfirmDialog
    v-if="zeigeLoeschDialog"
    nachricht="Möchtest du diesen Beitrag wirklich löschen?"
    :laedt="loeschtBeitragId !== null"
    @bestaetigen="loeschenBestaetigen"
    @abbrechen="zeigeLoeschDialog = false; zuLoeschendeBeitragId = null"
  />
</template>