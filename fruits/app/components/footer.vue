<script setup lang="ts">
const user = useSupabaseUser()

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains("dark")
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}
</script>

<template>
  <footer
      class="fixed bottom-0 left-0 w-full z-50
           bg-gray-900 dark:bg-gray-950
           text-gray-300 dark:text-gray-400
           py-2 md:py-4 border-t border-gray-800"
  >
    <div class="max-w-7xl mx-auto px-6">

      <div
          class="flex flex-wrap items-center justify-center md:justify-between
               gap-x-4 gap-y-2 md:gap-x-8"
      >

        <!-- LINKS -->
        <div class="flex-shrink-0 text-center md:text-left">
          <h2
              class="text-xl font-semibold text-white dark:text-gray-100
                   transition-all duration-300
                   hover:scale-105
                   hover:text-transparent
                   hover:bg-clip-text
                   hover:bg-gradient-to-r
                   hover:from-teal-500 hover:to-blue-600
                   dark:hover:from-teal-400 dark:hover:to-blue-500"
          >
            StudySync
          </h2>

          <p
              class="text-sm text-gray-400 dark:text-gray-500
                   transition-all duration-300
                   hover:scale-105
                   hover:text-transparent
                   hover:bg-clip-text
                   hover:bg-gradient-to-r
                   hover:from-teal-500 hover:to-blue-600"
          >
            From students, for students.
          </p>
        </div>

        <!-- MITTE -->
        <div class="flex-1 min-w-[260px] flex justify-center text-sm text-center">
          <NuxtLink
              :to="user ? '/dashboard' : '#'"
              @click="!user && $event.preventDefault()"
              :class="[
              'transition-all duration-300 hover:scale-105 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-600',

              user
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-300 dark:text-gray-600 cursor-default'
            ]"
          >
            © 2026 StudySync – From students, for students.
          </NuxtLink>
        </div>

        <!-- RECHTS -->
        <div class="flex items-center gap-6 flex-shrink-0">

          <a
              href="https://fsmathinf.uni-osnabrueck.de/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-gray-400 dark:text-gray-500
                   transition-all duration-300
                   hover:scale-105
                   hover:text-transparent
                   hover:bg-clip-text
                   hover:bg-gradient-to-r
                   hover:from-teal-500 hover:to-blue-600"
          >
            Fachschaft
          </a>

          <button
              @click="toggleDarkMode"
              class="text-lg text-gray-500 dark:text-gray-400
                   hover:text-white transition-all duration-300"
              aria-label="Darkmode umschalten"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>

        </div>

      </div>
    </div>
  </footer>
</template>