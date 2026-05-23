<script setup lang="ts">
import { ref, computed } from "vue"

// ─── Kurse (Suche) ───────────────────────────────────────
const { data: kursData } = await useFetch("/api/kurse")

const search = ref("")

const suggestions = computed(() => {
  if (!kursData.value?.courses || !search.value.trim()) return []
  return kursData.value.courses
    .filter((course: any) =>
      course.name.toLowerCase().includes(search.value.toLowerCase())
    )
    .slice(0, 5)
})

const goToCourse = (id: number) => navigateTo(`/courses/${id}`)

const handleEnter = () => {
  if (suggestions.value.length > 0) goToCourse(suggestions.value[0].id)
}

// ─── Suche: Click-Outside & Scroll ───────────────────────
const searchContainer = ref<HTMLElement | null>(null)
const searchFocused   = ref(false)

const showSuggestions = computed(() =>
  searchFocused.value && suggestions.value.length > 0
)

onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (searchContainer.value && !searchContainer.value.contains(e.target as Node)) {
      searchFocused.value = false
    }
  }
  document.addEventListener("mousedown", handleClickOutside)
  onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside))
})

// ─── Abonnements ─────────────────────────────────────────
const { data: aboData, refresh: refreshAbos } = await useFetch("/api/bekommt-updates")

const abonnierteKursIds = computed<number[]>(() =>
  // @ts-ignore
  (aboData.value?.abonnements ?? []).map((a: any) => Number(a.kursID))
)

const toggling = ref<number | null>(null)

const istAbonniert = (kursId: number) =>
  abonnierteKursIds.value.includes(Number(kursId))

const toggleAbo = async (kursId: number, e?: Event) => {
  e?.stopPropagation()
  if (toggling.value === kursId) return
  toggling.value = kursId
  try {
    if (istAbonniert(kursId)) {
      await $fetch(`/api/bekommt-updates/${kursId}`, { method: "DELETE" })
    } else {
      await $fetch("/api/bekommt-updates", {
        method: "POST",
        body: { kursID: kursId },
      })
    }
    await Promise.all([refreshAbos(), refreshUpdates()])
  } finally {
    toggling.value = null
  }
}

// ─── Updates ─────────────────────────────────────────────

const erlaubteWerte = [5, 10, 20, 50]
const limit = ref(20)

const { data: updateData, refresh: refreshUpdates } = await useFetch(
  "/api/dashboard/updates",
  {
    query: computed(() => ({ limit: limit.value })),
    watch: [limit],
  }
)

// @ts-ignore
const latestUpdates = computed(() => updateData.value?.updates ?? [])

const setLimit = (wert: number) => {
  limit.value = wert
}
const quelleConfig: Record<string, { label: string }> = {
  datei:           { label: "Datei" },
  forum:           { label: "Forum" },
  kommentar_datei: { label: "Kommentar zu Datei" },
  kommentar_kurs:  { label: "Antwort in Forum" },
  unterrichtet:    { label: "Dozent" },
}

const kursName = (kursId: any) =>
  kursData.value?.courses?.find(
    (c: any) => Number(c.id) === Number(kursId)
  )?.name ?? `Kurs ${kursId}`

const formatRelativ = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  const h    = Math.floor(diff / 3_600_000)
  const d    = Math.floor(diff / 86_400_000)
  if (min < 1)  return "gerade eben"
  if (min < 60) return `vor ${min} Min.`
  if (h < 24)   return `vor ${h} Std.`
  if (d < 7)    return `vor ${d} Tag${d > 1 ? "en" : ""}`
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

const updateTitel = (update: any) => {
  switch (update.quelle) {
    case "datei":           return `Neue Datei: ${update.titel}`
    case "forum":           return update.titel
    case "kommentar_datei": return `Kommentar: ${update.titel}`
    case "kommentar_kurs":  return `Kommentar: ${update.titel}`
    case "unterrichtet":    return update.titel
    default:                return update.titel
  }
}

const updateBeschreibung = (update: any) =>
  `${kursName(update.kurs_id)} · ${formatRelativ(update.created_at)}`

const updateLink = (update: any) => `/courses/${update.kurs_id}`
</script>

<template>
  <!--
    Hauptbereich Dashboard:
    Lightmode: heller Hintergrund
    Darkmode: schwarzer Hintergrund + helle Schrift
  -->
  <div
    class="min-h-[calc(100vh-260px)] flex items-center justify-center
           bg-slate-50 dark:bg-black
           font-sans text-slate-800 dark:text-gray-100
           px-6 py-6 transition-colors duration-300"
  >
    <div class="w-full max-w-4xl">

      <!-- Begrüßungsbereich -->
      <div class="mb-6 ml-2">
        <h1 class="text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-gray-100 mb-3">
          Willkommen zurück!
        </h1>
        <p class="text-lg font-semibold text-teal-700 dark:text-teal-400 mb-1">
          Schön, dass du wieder bei StudySync bist.
        </p>
        <p class="text-slate-500 dark:text-gray-400">
          Tausche dich mit anderen Studierenden aus, finde Materialien und entdecke neue Inhalte.
        </p>
      </div>

      <!-- Suchbereich -->
      <div ref="searchContainer" class="relative mb-6">
        <input
          v-model="search"
          @focus="searchFocused = true"
          @keyup.enter="handleEnter"
          type="text"
          placeholder="Kurse suchen und abonnieren..."
          class="w-full px-6 py-4 rounded-2xl
                border border-slate-200 dark:border-gray-700
                shadow-sm
                focus:outline-none focus:ring-2 focus:ring-teal-400
                bg-white dark:bg-gray-900
                text-slate-800 dark:text-gray-100
                placeholder:text-slate-400 dark:placeholder:text-gray-500
                transition-colors duration-300"
        />

        <!-- Vorschläge als geschlossene Dropdown-Box -->
        <ul
          v-if="showSuggestions"
          class="absolute z-20 w-full mt-2
                max-h-80 overflow-y-auto
                bg-white dark:bg-gray-900
                border border-slate-200 dark:border-gray-700
                rounded-2xl
                shadow-xl shadow-blue-900/10 dark:shadow-black/50
                divide-y divide-slate-100 dark:divide-gray-800"
        >
          <li
            v-for="course in suggestions"
            :key="course.id"
            class="group hover:bg-slate-50 dark:hover:bg-gray-800
                  first:rounded-t-2xl last:rounded-b-2xl
                  transition-colors duration-150"
          >
            <div class="flex items-center gap-3 px-4 py-3">

              <!-- Kursname → Detailseite -->
                <button
                  @click="goToCourse(course.id); searchFocused = false"
                  class="flex-1 text-left min-w-0"
                >
                  <span
                    class="text-base font-semibold truncate block
                          text-slate-700 dark:text-gray-100
                          group-hover:text-transparent group-hover:bg-clip-text
                          group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600
                          dark:group-hover:from-teal-400 dark:group-hover:to-blue-500
                          transition-all duration-300"
                  >
                    {{ course.name }}
                  </span>
                </button>

              <!-- Abo-Button -->
              <button
                @click="toggleAbo(course.id, $event)"
                :disabled="toggling === course.id"
                :title="istAbonniert(course.id) ? 'Abonnement entfernen' : 'Kurs abonnieren'"
                :class="[
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                  'text-xs font-bold border transition-all duration-200',
                  istAbonniert(course.id)
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700'
                    : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:text-teal-400',
                  toggling === course.id && 'opacity-50 cursor-not-allowed'
                ]"
              >
                <span v-if="toggling === course.id">…</span>
                <template v-else>
                  <span>{{ istAbonniert(course.id) ? "✓" : "+" }}</span>
                  <span>{{ istAbonniert(course.id) ? "Abonniert" : "Abonnieren" }}</span>
                </template>
              </button>

              <!-- Pfeil → Detailseite -->
              <button
                @click="goToCourse(course.id); searchFocused = false"
                class="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                      text-slate-300 dark:text-gray-600
                      group-hover:text-teal-500 dark:group-hover:text-teal-400
                      transition-colors duration-150"
              >
                <span class="text-lg leading-none">&rarr;</span>
              </button>

            </div>
          </li>
        </ul>
      </div>

      <!-- Meine Kurse -->
      <div v-if="abonnierteKursIds.length > 0" class="mb-6">
        <h2 class="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-gray-100 mb-4 ml-2">
          Meine Kurse
        </h2>
        <div class="flex flex-wrap gap-2 px-2">
          <span
            v-for="kursId in abonnierteKursIds"
            :key="kursId"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full
                   bg-white dark:bg-gray-900
                   border border-slate-100 dark:border-gray-700
                   shadow-sm text-sm font-semibold
                   text-slate-700 dark:text-gray-200"
          >
            {{ kursName(kursId) }}
            <button
              @click="toggleAbo(kursId)"
              :disabled="toggling === kursId"
              title="Abonnement entfernen"
              class="text-slate-400 dark:text-gray-500
                     hover:text-red-500 dark:hover:text-red-400
                     transition-colors duration-200 leading-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="toggling === kursId">…</span>
              <span v-else>&times;</span>
            </button>
          </span>
        </div>
      </div>

      <!-- Neueste Updates -->
      <div>
        <!-- Überschrift + Auswahl -->
        <div class="flex items-center justify-between mb-4 ml-2 mr-2">
          <h2 class="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-gray-100">
            Neueste Updates
          </h2>

          <!-- Limit-Auswahl -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-400 dark:text-gray-500 mr-1">Anzeigen:</span>
            <button
              v-for="wert in erlaubteWerte"
              :key="wert"
              @click="setLimit(wert)"
              :class="[
                'px-2.5 py-1 rounded-full text-xs font-bold border transition-all duration-200',
                limit === wert
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-700 hover:border-teal-300 hover:text-teal-600 dark:hover:border-teal-600 dark:hover:text-teal-400'
              ]"
            >
              {{ wert }}
            </button>
          </div>
        </div>

        <!-- Scrollbarer Bereich -->
        <div class="max-h-64 overflow-y-auto pr-2 pt-2 pb-2 space-y-3">

          <!-- Kein Abo vorhanden -->
          <div
            v-if="abonnierteKursIds.length === 0"
            class="bg-white dark:bg-gray-900
                  border border-slate-100 dark:border-gray-700
                  p-6 rounded-[2rem] shadow-sm text-center"
          >
            <p class="text-slate-400 dark:text-gray-500 text-sm">
              Suche nach Kursen und abonniere sie, um hier Updates zu sehen.
            </p>
          </div>

          <!-- Abonniert, aber keine Einträge -->
          <div
            v-else-if="latestUpdates.length === 0"
            class="bg-white dark:bg-gray-900
                  border border-slate-100 dark:border-gray-700
                  p-6 rounded-[2rem] shadow-sm text-center"
          >
            <p class="text-slate-400 dark:text-gray-500 text-sm">
              Noch keine Aktivitäten in deinen Kursen.
            </p>
          </div>

          <!-- Update-Karten -->
          <template v-else>
            <NuxtLink
              v-for="update in latestUpdates"
              :key="`${update.quelle}-${update.id}`"
              :to="updateLink(update)"
              class="group block
                    bg-white dark:bg-gray-900
                    border border-slate-100 dark:border-gray-700
                    p-4 rounded-[2rem]
                    shadow-md shadow-blue-900/5 dark:shadow-black/40
                    hover:shadow-xl hover:shadow-teal-900/10
                    hover:border-teal-200 dark:hover:border-teal-500
                    transition-all duration-300 transform hover:-translate-y-1"
            >
              <div class="flex items-center justify-between gap-4">

                <div class="min-w-0">
                  <span
                    class="inline-block mb-2 px-3 py-1 rounded-full
                          bg-teal-50 dark:bg-teal-900/30
                          text-teal-700 dark:text-teal-300
                          text-sm font-bold"
                  >
                    {{ quelleConfig[update.quelle]?.label ?? update.quelle }}
                  </span>

                  <h3
                    class="text-lg font-bold truncate
                          text-slate-700 dark:text-gray-100
                          group-hover:text-transparent group-hover:bg-clip-text
                          group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600
                          dark:group-hover:from-teal-400 dark:group-hover:to-blue-500
                          transition-all duration-300"
                  >
                    {{ updateTitel(update) }}
                  </h3>

                  <p class="text-slate-500 dark:text-gray-400 mt-1 text-sm">
                    {{ updateBeschreibung(update) }}
                  </p>
                </div>

                <div
                  class="w-11 h-11 shrink-0 flex items-center justify-center rounded-full
                        bg-slate-50 dark:bg-gray-800
                        text-slate-400 dark:text-gray-400
                        group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-blue-500
                        group-hover:text-white
                        transition-all duration-300 shadow-sm"
                >
                  <span class="text-2xl leading-none">&rarr;</span>
                </div>

              </div>
            </NuxtLink>
          </template>

        </div>
      </div>

    </div>
  </div>
</template>