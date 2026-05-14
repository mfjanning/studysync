<script setup>
import { ref, computed } from "vue"

const { data } = await useFetch("/api/kurse")

/*
  Suchtext für die Kurs-Suche
*/
const search = ref("")

/*
  Gefilterte Kurse:
  - ohne Suchtext: alle Kurse
  - mit Suchtext: nur passende Kurse
*/
const filteredCourses = computed(() => {
  if (!data.value?.courses) return []

  if (!search.value) return data.value.courses

  return data.value.courses.filter(course =>
      course.name.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>

<template>
  <!--
    Kursübersicht:
    Lightmode: heller Hintergrund
    Darkmode: schwarzer Hintergrund
  -->
  <div
      class="bg-slate-50 dark:bg-black
         font-sans text-slate-800 dark:text-gray-100
         px-6 pt-6 pb-0 md:px-12 md:pt-12 md:pb-0
         transition-colors duration-300
         overflow-hidden"
  >
    <div class="max-w-4xl mx-auto">

      <!-- Überschrift -->
      <h1
          class="text-4xl font-black uppercase tracking-tight
               text-slate-800 dark:text-gray-100
               mb-8 ml-2"
      >
        Alle Kurse
      </h1>

      <!-- Suchleiste -->
      <input
          v-model="search"
          type="text"
          placeholder="Kurse suchen..."
          class="w-full mb-6 px-6 py-4 rounded-2xl
               border border-slate-200 dark:border-gray-700
               bg-white dark:bg-gray-900
               text-slate-800 dark:text-gray-100
               placeholder:text-slate-400 dark:placeholder:text-gray-500
               shadow-sm
               focus:outline-none focus:ring-2 focus:ring-teal-400
               transition-colors duration-300"
      />

      <!-- Kursliste scrollbar machen, damit Footer sichtbar ist -->
      <ul class="max-h-[55vh] overflow-y-auto pr-2 pt-2 pb-2 space-y-4">
        <li
            v-for="course in filteredCourses"
            :key="course.id"
            class="group bg-white dark:bg-gray-900
                 border border-slate-100 dark:border-gray-700
                 p-2 rounded-[2rem]
                 shadow-md shadow-blue-900/5 dark:shadow-black/40
                 hover:shadow-xl hover:shadow-teal-900/10
                 hover:border-teal-200 dark:hover:border-teal-500
                 transition-all duration-300 transform hover:-translate-y-1"
        >
          <NuxtLink
              :to="`/courses/${course.id}`"
              class="flex items-center justify-between p-4 w-full cursor-pointer"
          >
            <!-- Kursname OHNE Markierung -->
            <h2
                class="text-xl md:text-2xl font-bold
                     text-slate-700 dark:text-gray-100
                     group-hover:text-transparent group-hover:bg-clip-text
                     group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600
                     dark:group-hover:from-teal-400 dark:group-hover:to-blue-500
                     transition-all duration-300"
            >
              {{ course.name }}
            </h2>

            <!-- Pfeil-Kreis -->
            <div
                class="w-12 h-12 flex items-center justify-center rounded-full
                     bg-slate-50 dark:bg-gray-800
                     text-slate-400 dark:text-gray-400
                     group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-blue-500
                     group-hover:text-white
                     transition-all duration-300 shadow-sm"
            >
              <span class="text-2xl leading-none">&rarr;</span>
            </div>
          </NuxtLink>
        </li>
      </ul>

    </div>
  </div>
</template>