<script setup>
const route = useRoute()
const kursId = route.params.id
const forumId = route.params.forumId

const { data: beitragData } = await useFetch('/api/kurse/foren/beitrag/' + forumId)
const { data: kommentarData, refresh: refreshKommentare } = await useFetch('/api/kurse/foren/kommentare/' + forumId)

const user = useSupabaseUser()

const beitrag = computed(() => beitragData.value?.beitrag)
const kommentare = computed(() => kommentarData.value?.beitraege ?? [])

const neuerKommentar = ref('')
const sendet = ref(false)
const fehler = ref('')

const kommentarAbsenden = async () => {
  if (!neuerKommentar.value.trim()) return
  sendet.value = true
  fehler.value = ''

  try {
    await $fetch('/api/kurse/foren/kommentare', {
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
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
    <div class="max-w-4xl mx-auto p-4 md:p-8">

      <div class="mb-6 pl-2">
        <NuxtLink
          :to="`/courses/${kursId}`"
          class="inline-flex items-center text-green-600 hover:text-blue-700 font-bold transition-colors"
        >
          <span class="mr-2 text-2xl leading-none">&larr;</span> Zurück zum Kurs
        </NuxtLink>
      </div>

      <!-- Header mit Titel des Beitrags -->
      <header class="rounded-[2.5rem] bg-gradient-to-br from-green-400 to-blue-600 p-8 shadow-lg shadow-blue-900/10 mb-8 relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <p class="text-green-100 font-bold text-sm uppercase tracking-wider mb-2">Diskussion</p>
          <h1 class="text-2xl md:text-3xl font-black text-white">
            {{ beitrag?.thema || 'Beitrag wird geladen...' }}
          </h1>
          <div class="flex items-center gap-2 mt-2" v-if="beitrag">
            <img
              v-if="beitrag.profile?.avatar"
              :src="beitrag.profile.avatar"
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

      <div class="bg-white rounded-[2rem] shadow-xl shadow-green-900/5 border border-slate-100 flex flex-col overflow-hidden">

        <div class="p-5 bg-slate-50 border-b border-slate-100">
          <h2 class="font-extrabold text-slate-700 uppercase tracking-widest text-sm">
            Kommentare
            <span class="ml-2 text-xs font-bold text-slate-400 normal-case tracking-normal">
              {{ kommentare.length }}
            </span>
          </h2>
        </div>

        <!-- Kommentarliste -->
        <div class="p-5 space-y-4">
          <div v-if="kommentare.length === 0" class="text-center py-12 text-slate-400">
            <p class="text-3xl mb-2">💬</p>
            <p class="font-medium text-sm">Noch keine Kommentare.</p>
            <p class="text-xs mt-1">Sei der Erste!</p>
          </div>

          <div
            v-for="k in kommentare"
            :key="k.id"
            class="bg-slate-50 rounded-2xl p-4 border border-slate-100"
          >
            <div class="flex items-center gap-3 mb-2">
              <img
                v-if="k.profile?.avatar"
                :src="k.profile.avatar"
                :alt="k.profile?.name || 'Nutzer'"
                class="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
                {{ (k.profile?.name || 'N')[0].toUpperCase() }}
              </div>
              <span class="font-bold text-sm text-slate-800 flex-1">{{ k.profile?.name || 'Nutzer' }}</span>
              <span class="text-xs text-slate-400 font-medium">
                {{ new Date(k.created_at).toLocaleDateString('de-DE', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }) }}
              </span>
            </div>
            <p class="text-sm text-slate-700 leading-relaxed pl-11">{{ k.kommentar }}</p>
          </div>
        </div>

        <!-- Eingabebereich -->
        <div class="p-5 bg-slate-50 border-t border-slate-100">
          <div v-if="user">
            <p v-if="fehler" class="text-red-500 text-xs font-medium mb-2">{{ fehler }}</p>
            <textarea
              v-model="neuerKommentar"
              class="w-full p-3 bg-white border border-slate-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition"
              rows="4"
              placeholder="Schreib einen Kommentar..."
              :disabled="sendet"
            />
            <button
              @click="kommentarAbsenden"
              :disabled="sendet || !neuerKommentar.trim()"
              class="mt-3 w-full bg-slate-800 text-white font-bold py-3 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-sm"
            >
              {{ sendet ? 'Wird gesendet...' : 'KOMMENTIEREN' }}
            </button>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-slate-500 text-sm mb-3 font-medium">Melde dich an, um zu kommentieren.</p>
            <NuxtLink
              to="/login"
              class="inline-block bg-slate-800 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 transition-colors text-sm"
            >
              Anmelden
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
