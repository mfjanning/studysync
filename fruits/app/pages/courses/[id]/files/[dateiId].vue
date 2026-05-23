<script setup>
const route = useRoute()
const kursId = route.params.id
const dateiId = route.params.dateiId

const { data } = await useFetch('/api/datei/' + dateiId)
const { data: kommentarData, refresh: refreshKommentare } = await useFetch('/api/datei/kommentare/' + dateiId)

const session = useSupabaseSession()
const user = computed(() => session.value?.user ?? null)
const supabase = useSupabaseClient()
const { data: { publicUrl } } = supabase.storage.from('kurs_dateien').getPublicUrl('')
const publicUrlBase = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/'

const datei = computed(() => data.value?.datei)
const pdfUrl = computed(() => datei.value ? `${publicUrlBase}${datei.value.dateipfad}` : null)
const downloadUrl = computed(() => datei.value ? `${publicUrlBase}${datei.value.dateipfad}?download=${datei.value.dateiname}` : null)
const kommentare = computed(() => kommentarData.value?.kommentare ?? [])

const formatDateityp = (dbTyp) => {
  if (dbTyp === 'altklausur') return 'Altklausur'
  if (dbTyp === 'loesung') return 'Lösung'
  if (dbTyp === 'mitschrift') return 'Mitschrift'
  return dbTyp
}

const neuerKommentar = ref('')
const sendet = ref(false)
const fehler = ref('')

const loeschtKommentarId = ref(null)
const loeschFehler = ref('')
const zeigeLoeschDialog = ref(false)
const zuLoeschendenKommentarId = ref(null)

const kommentarLoeschen = (id) => {
  zuLoeschendenKommentarId.value = id
  zeigeLoeschDialog.value = true
}

const loeschenBestaetigen = async () => {
  loeschtKommentarId.value = zuLoeschendenKommentarId.value
  loeschFehler.value = ''
  try {
    await $fetch(`/api/datei/kommentare/${zuLoeschendenKommentarId.value}`, { method: 'DELETE' })
    zeigeLoeschDialog.value = false
    await refreshKommentare()
  } catch (err) {
    loeschFehler.value = err?.data?.message || 'Kommentar konnte nicht gelöscht werden.'
  } finally {
    loeschtKommentarId.value = null
    zuLoeschendenKommentarId.value = null
  }
}

const kommentarAbsenden = async () => {
  if (!neuerKommentar.value.trim()) return
  sendet.value = true
  fehler.value = ''

  try {
    await $fetch('/api/datei/kommentare', {
      method: 'POST',
      body: { dateiID: Number(dateiId), kommentar: neuerKommentar.value.trim() }
    })
    neuerKommentar.value = ''
    await refreshKommentare()
  } catch (err) {
    fehler.value = err?.data?.message || err?.message || 'Kommentar konnte nicht gespeichert werden.'
  } finally {
    sendet.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-800 dark:text-gray-100 pb-12 transition-colors duration-300">
    <div class="max-w-7xl mx-auto p-4 md:p-8">

      <div class="mb-6 pl-2">
        <NuxtLink
            :to="`/courses/${kursId}`"
            class="inline-flex items-center text-green-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors"
        >
          <span class="mr-2 text-2xl leading-none">&larr;</span> Zurück zum Kurs
        </NuxtLink>
      </div>

      <div v-if="datei">

        <!-- Header -->
        <header class="rounded-[2.5rem] bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-700 dark:to-blue-900 p-8 shadow-lg shadow-blue-900/10 dark:shadow-black/50 mb-8 relative overflow-hidden">
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div class="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p class="text-green-100 dark:text-green-200 font-bold text-sm uppercase tracking-wider mb-2">
                {{ formatDateityp(datei.typ) }}
              </p>
              <h1 class="text-2xl md:text-3xl font-black text-white break-all" style="overflow-wrap:anywhere;">
                {{ datei.dateiname }}
              </h1>
              <p class="mt-2 text-green-50 dark:text-gray-200 text-sm font-medium">
                Hochgeladen am {{ new Date(datei.created_at).toLocaleDateString('de-DE') }}
              </p>
            </div>
            <a
                :href="downloadUrl"
                :download="datei.dateiname"
                class="flex items-center gap-2 bg-white dark:bg-gray-100 text-green-700 hover:bg-green-50 dark:hover:bg-green-100 font-bold py-3 px-6 rounded-full shadow-md transition-colors text-sm whitespace-nowrap self-start"
            >
              📥 Herunterladen
            </a>
          </div>
        </header>

        <!-- PDF + Kommentare -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- PDF Viewer -->
          <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-black/40 border border-green-50 dark:border-gray-700 overflow-hidden transition-colors duration-300" style="height: 82vh;">
            <iframe
                :src="`${pdfUrl}#toolbar=1&view=FitH`"
                class="w-full h-full border-0"
                type="application/pdf"
                :title="datei.dateiname"
            />
          </div>

          <!-- Kommentare -->
          <aside class="lg:col-span-1 bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-black/40 border border-slate-100 dark:border-gray-700 flex flex-col overflow-hidden transition-colors duration-300" style="height: 82vh;">

            <div class="p-5 bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700 transition-colors duration-300">
              <h2 class="font-extrabold text-slate-700 dark:text-gray-100 uppercase tracking-widest text-sm">
                Kommentare
                <span class="ml-2 text-xs font-bold text-slate-400 dark:text-gray-500 normal-case tracking-normal">
                  {{ kommentare.length }}
                </span>
              </h2>
            </div>

            <!-- Liste -->
            <div class="flex-1 overflow-y-auto p-5 space-y-4">
              <div v-if="kommentare.length === 0" class="text-center py-12 text-slate-400 dark:text-gray-500">
                <p class="text-3xl mb-2">💬</p>
                <p class="font-medium text-sm">Noch keine Kommentare.</p>
                <p class="text-xs mt-1">Sei der Erste!</p>
              </div>

              <div
                v-for="k in kommentare"
                :key="k.id"
                class="bg-slate-50 dark:bg-gray-800 rounded-2xl p-4 border border-slate-100 dark:border-gray-700 transition-colors duration-300"
              >
                <div class="flex items-center gap-3 mb-2">
                  <img
                    v-if="k.profile?.avatar"
                    :src="`/avatars/${k.profile.avatar}.png`"
                    :alt="k.profile?.name || 'Nutzer'"
                    class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
                    {{ (k.profile?.name || 'N')[0].toUpperCase() }}
                  </div>
                  <span class="font-bold text-sm text-slate-800 dark:text-gray-100 flex-1">{{ k.profile?.name || 'Nutzer' }}</span>
                  <span class="text-xs text-slate-400 dark:text-gray-500 font-medium">
                    {{ new Date(k.created_at).toLocaleDateString('de-DE', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }) }}
                  </span>
                  <!-- NEU: Löschen-Button -->
                  <button
                    v-if="user?.id === k.nutzerID"
                    @click="kommentarLoeschen(k.id)"
                    :disabled="loeschtKommentarId === k.id"
                    class="text-slate-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors text-xs font-bold leading-none"
                    title="Kommentar löschen"
                  >
                    <span v-if="loeschtKommentarId === k.id">...</span>
                    <span v-else>✕</span>
                  </button>
                </div>
                <p v-if="loeschFehler" class="text-red-500 text-xs font-medium mb-1 pl-11">{{ loeschFehler }}</p>
                <p class="text-sm text-slate-700 dark:text-gray-200 leading-relaxed pl-11" style="overflow-wrap:anywhere;">{{ k.kommentar }}</p>
              </div>
            </div>

            <!-- Eingabebereich -->
            <div class="p-5 bg-slate-50 dark:bg-gray-800 border-t border-slate-100 dark:border-gray-700 transition-colors duration-300">
              <div v-if="user">
                <p v-if="fehler" class="text-red-500 dark:text-red-400 text-xs font-medium mb-2">{{ fehler }}</p>
                <textarea
                    v-model="neuerKommentar"
                    class="w-full p-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl text-sm text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-500 focus:border-transparent transition"
                    rows="3"
                    placeholder="Schreib einen Kommentar..."
                    maxlength="1000"
                    :disabled="sendet"
                />
                <div class="flex justify-between items-center mt-2">
                  <div></div>
                  <p v-if="neuerKommentar.length > 0" class="text-xs font-medium transition-colors" :class="neuerKommentar.length >= 900 ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-gray-500'">
                    {{ neuerKommentar.length }}/1000
                  </p>
                </div>
                <button
                    @click="kommentarAbsenden"
                    :disabled="sendet || !neuerKommentar.trim()"
                    class="mt-3 w-full bg-slate-800 dark:bg-gray-700 text-white font-bold py-3 rounded-full hover:bg-green-600 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-sm"
                >
                  {{ sendet ? 'Wird gesendet...' : 'KOMMENTIEREN' }}
                </button>
              </div>
              <div v-else class="text-center py-3">
                <p class="text-slate-500 dark:text-gray-400 text-sm mb-3 font-medium">Melde dich an, um zu kommentieren.</p>
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

      <div v-else class="text-center py-32">
        <p class="text-slate-400 dark:text-gray-500 font-bold text-lg">Datei wird geladen...</p>
      </div>

    </div>
  </div>

  <ConfirmDialog
    v-if="zeigeLoeschDialog"
    nachricht="Möchtest du diesen Kommentar wirklich löschen?"
    :laedt="loeschtKommentarId !== null"
    @bestaetigen="loeschenBestaetigen"
    @abbrechen="zeigeLoeschDialog = false; zuLoeschendenKommentarId = null"
  />
</template>