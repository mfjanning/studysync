<script setup lang="ts">
/*
  Holt den aktuell eingeloggten User von Supabase:
  null = nicht eingeloggt
  Objekt = eingeloggt
*/
const user = useSupabaseUser()
</script>

<template>
  <!-- Footer Container -->
  <footer class="bg-gray-900 text-gray-300 py-10 mt-16">
    <div class="max-w-7xl mx-auto px-6">

      <!-- Flex Layout:
           - mobil: untereinander
           - desktop: nebeneinander -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">

        <!-- LEFT: Logo und Slogan: -->
        <div class="text-center md:text-left">

          <!-- Logo / Name -->
          <h2 class="text-xl font-semibold text-white
                     transition-all duration-300
                     hover:scale-105
                     hover:text-transparent
                     hover:bg-clip-text
                     hover:bg-gradient-to-r
                     hover:from-teal-500 hover:to-blue-600">
            StudySync
          </h2>

          <!-- Slogan -->
          <p class="text-sm text-gray-400
                    transition-all duration-300
                    hover:scale-105
                    hover:text-transparent
                    hover:bg-clip-text
                    hover:bg-gradient-to-r
                    hover:from-teal-500 hover:to-blue-600">
            From students, for students.
          </p>
        </div>

        <!-- CENTER: Copyright -->
        <div class="w-full flex justify-center text-sm">

          <!--
            Dynamischer Link:
            - Eingeloggt: Verlinkung zum Dashboard
            - Nicht eingeloggt: nicht klickbar ("#")
          -->
          <NuxtLink
              :to="user ? '/dashboard' : '#'"

              :class="[
              // Basis-Styling (immer aktiv)
              'text-sm transition-all duration-300',

              // Zustand: User eingeloggt
              user
                ? 'text-gray-400 hover:scale-105 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-600'

                // Zustand: User NICHT eingeloggt
                : 'text-gray-300 cursor-default pointer-events-none'
            ]"
          >
            © 2026 StudySync – From students, for students.
          </NuxtLink>
        </div>

        <!-- RIGHT: Fachschaft Link -->
        <div class="text-sm text-gray-400 text-center md:text-right">

          <!-- Externer Link zur FS Mathe/ Info -->
          <a
              href="https://fsmathinf.uni-osnabrueck.de/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-gray-400
                   transition-all duration-300
                   hover:scale-105
                   hover:text-transparent
                   hover:bg-clip-text
                   hover:bg-gradient-to-r
                   hover:from-teal-500 hover:to-blue-600"
          >
            Fachschaft
          </a>
        </div>

      </div>
    </div>
  </footer>
</template>