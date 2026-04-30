<script setup lang="ts">
import { ref, computed } from "vue"

/*
  Lädt die Kursdaten aus /api/kurse.
*/
const { data } = await useFetch("/api/kurse")

/*
  Speichert den Suchtext.
*/
const search = ref("")

/*
  Vorschläge für die Suche.
  Es werden maximal 5 passende Module angezeigt.
*/
const suggestions = computed(() => {
  if (!data.value?.courses || !search.value.trim()) return []

  return data.value.courses
      .filter(course =>
          course.name.toLowerCase().includes(search.value.toLowerCase())
      )
      .slice(0, 5)
})

/*
  Leitet zur Detailseite des Moduls weiter.
*/
const goToCourse = (id: number) => {
  navigateTo(`/courses/${id}`)
}

/*
  ENTER öffnet den ersten Suchvorschlag.
*/
const handleEnter = () => {
  if (suggestions.value.length > 0) {
    goToCourse(suggestions.value[0].id)
  }
}

/*
  Beispielhafte Updates.
  Später können diese Daten aus Supabase kommen.
*/
const latestUpdates = [
  {
    id: 1,
    type: "Bewertung",
    title: "Neue Bewertung zu Algorithmen",
    description: "Schwierigkeit wurde mit 4 von 5 Sternen bewertet.",
    link: "/courses/1"
  },
  {
    id: 2,
    type: "Datei",
    title: "Neue Datei hochgeladen",
    description: "Zusammenfassung für Datenbanken wurde geteilt.",
    link: "/courses/2"
  },
  {
    id: 3,
    type: "Forum",
    title: "Neuer Forenbeitrag",
    description: "Tipps zur Klausurvorbereitung in Theoretische Informatik.",
    link: "/forum"
  }
]
</script>

<template>
  <div class="min-h-[calc(100vh-260px)] flex items-center justify-center bg-slate-50 font-sans text-slate-800 px-6 py-6">
    <div class="w-full max-w-4xl">

      <!-- Begrüßungsbereich -->
      <div class="mb-6 ml-2">
        <h1 class="text-3xl font-black uppercase tracking-tight text-slate-800 mb-3">
          Willkommen zurück!
        </h1>

        <p class="text-lg font-semibold text-teal-700 mb-1">
          Schön, dass du wieder bei StudySync bist.
        </p>

        <p class="text-slate-500">
          Tausche dich mit anderen Studierenden aus, finde Materialien und entdecke neue Inhalte.
        </p>
      </div>

      <!-- Suchbereich -->
      <div class="relative mb-6">
        <input
            v-model="search"
            @keyup.enter="handleEnter"
            type="text"
            placeholder="Kurse suchen..."
            class="w-full px-6 py-4 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
        />

        <ul
            v-if="suggestions.length > 0"
            class="absolute z-20 w-full mt-3 space-y-3"
        >
          <li
              v-for="course in suggestions"
              :key="course.id"
              class="group bg-white border border-slate-100 p-2 rounded-[2rem] shadow-md shadow-blue-900/5 hover:shadow-xl hover:shadow-teal-900/10 hover:border-teal-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            <button
                @click="goToCourse(course.id)"
                class="flex items-center justify-between p-4 w-full cursor-pointer text-left"
            >
              <h2 class="text-xl md:text-2xl font-bold text-slate-700 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600 transition-all duration-300">
                {{ course.name }}
              </h2>

              <div class="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <span class="text-2xl leading-none">&rarr;</span>
              </div>
            </button>
          </li>
        </ul>
      </div>

      <!-- Neueste Updates -->
      <div>
        <h2 class="text-2xl font-black uppercase tracking-tight text-slate-800 mb-4 ml-2">
          Neueste Updates
        </h2>

        <!-- Scrollbarer Bereich -->
        <div class="max-h-64 overflow-y-auto pr-2 pt-2 pb-2 space-y-3">

          <NuxtLink
              v-for="update in latestUpdates"
              :key="update.id"
              :to="update.link"
              class="group block bg-white border border-slate-100 p-4 rounded-[2rem] shadow-md shadow-blue-900/5 hover:shadow-xl hover:shadow-teal-900/10 hover:border-teal-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="flex items-center justify-between gap-4">

              <div>
          <span class="inline-block mb-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-bold">
            {{ update.type }}
          </span>

                <h3 class="text-lg font-bold text-slate-700 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600 transition-all duration-300">
                  {{ update.title }}
                </h3>

                <p class="text-slate-500 mt-1">
                  {{ update.description }}
                </p>
              </div>

              <div class="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <span class="text-2xl leading-none">&rarr;</span>
              </div>

            </div>
          </NuxtLink>

        </div>
      </div>

    </div>
  </div>
</template>