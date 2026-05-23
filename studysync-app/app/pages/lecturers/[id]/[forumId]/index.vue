<script setup>
const route = useRoute()
const dozentId = route.params.id
const forumId = route.params.forumId

const { data: beitragData } = await useFetch('/api/dozenten/foren/beitrag/' + forumId)
const { data: kommentarData, refresh: refreshKommentare } = await useFetch('/api/dozenten/foren/kommentare/' + forumId)

const session = useSupabaseSession()
const user = computed(() => session.value?.user ?? null)

const beitrag = computed(() => beitragData.value?.beitrag)
const kommentare = computed(() => kommentarData.value?.beitraege ?? [])

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
    await $fetch(`/api/dozenten/foren/kommentare/${zuLoeschendenKommentarId.value}`, { method: 'DELETE' })
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
    await $fetch('/api/dozenten/foren/kommentare', {
      method: 'POST',
      body: { forumID: Number(forumId), kommentar: neuerKommentar.value.trim() }
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
    <div class="max-w-4xl mx-auto p-4 md:p-8">

      <div class="mb-6 pl-2">
        <NuxtLink
          :to="`/lecturers/${dozentId}`"
          class="inline-flex items-center text-green-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors"
        >
          <span class="mr-2 text-2xl leading-none">&larr;</span> Zurück zum Dozenten
        </NuxtLink>
      </div>

      <!-- Header -->
      <header class="rounded-[2.5rem] bg-gradient-to-br from-green-400 to-blue-600 dark:from-green-700 dark:to-blue-900 p-8 shadow-lg shadow-blue-900/10 dark:shadow-black/50 mb-8 relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <p class="text-green-100 font-bold text-sm uppercase tracking-wider mb-2">Diskussion</p>
          <h1 class="text-2xl md:text-3xl font-black text-white" style="overflow-wrap:anywhere;">
            {{ beitrag?.thema || 'Beitrag wird geladen...' }}
          </h1>
          <div class="flex items-center gap-2 mt-2" v-if="beitrag">
            <img
              v-if="beitrag.profile?.avatar"
              :src="`/avatars/${beitrag.profile.avatar}.png`"
              :alt="beitrag.profile?.name || 'Nutzer'"
              class="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <div v-else class="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
              {{ (beitrag.profile?.name || 'N')[0].toUpperCase() }}
            </div>
            <p class="text-green-50 text-sm font-medium">
              {{ beitrag.profile?.name || 'Nutzer' }} ·
              {{ new Date(beitrag.created_at).toLocaleDateString('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              }) }}
            </p>
          </div>
        </div>
      </header>

      <div class="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-black/40 border border-slate-100 dark:border-gray-700 flex flex-col overflow-hidden transition-colors duration-300">

        <div class="p-5 bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700">
          <h2 class="font-extrabold text-slate-700 dark:text-gray-100 uppercase tracking-widest text-sm">
            Kommentare
            <span class="ml-2 text-xs font-bold text-slate-400 dark:text-gray-500 normal-case tracking-normal">
              {{ kommentare.length }}
            </span>
          </h2>
        </div>

        <!-- Kommentarliste -->
        <div class="p-5 space-y-4">
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
            <p v-if="fehler" class="text-red-500 text-xs font-medium mb-2">{{ fehler }}</p>
            <textarea
              v-model="neuerKommentar"
              class="w-full p-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl text-sm text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600 transition-colors duration-300"
              rows="4"
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
          <div v-else class="text-center py-4">
            <p class="text-slate-500 dark:text-gray-400 text-sm mb-3 font-medium">Melde dich an, um zu kommentieren.</p>
            <NuxtLink
              to="/login"
              class="inline-block bg-slate-800 dark:bg-gray-700 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 dark:hover:bg-green-600 transition-colors text-sm"
            >
              Anmelden
            </NuxtLink>
          </div>
        </div>

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
