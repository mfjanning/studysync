<script setup>
import { ref, computed } from "vue"

const { data } = await useFetch("/api/dozenten")

/*
  Suchtext für die Dozenten-Suche
*/
const search = ref("")

/*
  Gefilterte und sortierte Dozenten:
  1. Alphabetisch nach Nachname sortieren
  2. Nach Suchtext filtern (Vor- oder Nachname)
*/
const filteredDozenten = computed(() => {
  if (!data.value?.dozenten) return []

  // 1. Liste kopieren und alphabetisch nach Nachname sortieren
  let sortierteListe = [...data.value.dozenten].sort((a, b) => {
    const nameA = (a.nachname || "").toLowerCase()
    const nameB = (b.nachname || "").toLowerCase()
    return nameA.localeCompare(nameB)
  })

  // 2. Wenn kein Suchtext da ist, einfach die sortierte Liste zurückgeben
  if (!search.value) return sortierteListe

  // 3. Wenn gesucht wird, die sortierte Liste filtern
  const lowerSearch = search.value.toLowerCase()
  return sortierteListe.filter(nutzer => {
    // Vor- und Nachname kombinieren, damit beides gefunden wird
    const fullName = `${nutzer.vorname} ${nutzer.nachname}`.toLowerCase()
    return fullName.includes(lowerSearch)
  })
})
</script>

<template>
  <!--
    Dozentenübersicht:
    Lightmode: heller Hintergrund
    Darkmode: schwarzer Hintergrund
  -->
  <div
      class="min-h-[calc(100vh-260px)] bg-slate-50 dark:bg-black
         font-sans text-slate-800 dark:text-gray-100
         p-6 md:p-12 transition-colors duration-300
         overflow-hidden"
  >
    <div class="max-w-4xl mx-auto">

      <!-- Überschrift -->
      <h1
          class="text-4xl font-black uppercase tracking-tight
               text-slate-800 dark:text-gray-100
               mb-8 ml-2"
      >
        Alle Dozenten
      </h1>

      <!-- Suchleiste -->
      <input
          v-model="search"
          type="text"
          placeholder="Dozenten suchen..."
          class="w-full mb-6 px-6 py-4 rounded-2xl
               border border-slate-200 dark:border-gray-700
               bg-white dark:bg-gray-900
               text-slate-800 dark:text-gray-100
               placeholder:text-slate-400 dark:placeholder:text-gray-500
               shadow-sm
               focus:outline-none focus:ring-2 focus:ring-teal-400
               transition-colors duration-300"
      />

      <!-- Dozentenliste scrollbar machen, damit Footer sichtbar ist -->
      <ul class="max-h-[70vh] overflow-y-auto pr-2 pt-2 pb-2 space-y-4">
        
        <!-- Hinweis, wenn keine Dozenten gefunden wurden -->
        <div 
          v-if="filteredDozenten.length === 0" 
          class="p-8 text-center text-slate-400 dark:text-gray-500 font-medium bg-slate-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-700"
        >
          Keine Dozenten gefunden.
        </div>

        <li
            v-for="nutzer in filteredDozenten"
            :key="nutzer.id"
            class="group bg-white dark:bg-gray-900
                 border border-slate-100 dark:border-gray-700
                 p-2 rounded-[2rem]
                 shadow-md shadow-blue-900/5 dark:shadow-black/40
                 hover:shadow-xl hover:shadow-teal-900/10
                 hover:border-teal-200 dark:hover:border-teal-500
                 transition-all duration-300 transform hover:-translate-y-1"
        >
          <NuxtLink
              :to="`/lecturers/${nutzer.id}`"
              class="flex items-center justify-between p-4 w-full cursor-pointer"
          >
            <!-- Dozentenname -->
            <h2
                class="text-xl md:text-2xl font-bold
                     text-slate-700 dark:text-gray-100
                     group-hover:text-transparent group-hover:bg-clip-text
                     group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600
                     dark:group-hover:from-teal-400 dark:group-hover:to-blue-500
                     transition-all duration-300"
            >
              {{ nutzer.vorname }} {{ nutzer.nachname }}
            </h2>

            <!-- Pfeil-Kreis -->
            <div
                class="w-12 h-12 flex items-center justify-center rounded-full
                     bg-slate-50 dark:bg-gray-800
                     text-slate-400 dark:text-gray-400
                     group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-blue-500
                     group-hover:text-white
                     transition-all duration-300 shadow-sm shrink-0"
            >
              <span class="text-2xl leading-none">&rarr;</span>
            </div>
          </NuxtLink>
        </li>
      </ul>

    </div>
  </div>
</template>