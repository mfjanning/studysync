<template>
  <nav class="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-gray-800 transition-colors duration-300">
    <!-- HAUPTLEISTE -->
    <div class="flex items-center justify-between px-6 md:px-12 py-4 w-full">

      <!--  Linke Seite (Nur Desktop) -->
      <ul class="hidden lg:flex items-center gap-8">
        <template v-if="user">
          <li>
            <NuxtLink :to="startseiteLink" class="group flex items-center font-bold text-slate-600 dark:text-gray-300">
              <span class="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600 dark:group-hover:from-teal-400 dark:group-hover:to-blue-400 transition-all duration-300">Startseite</span>
              <span class="w-0 opacity-0 overflow-hidden group-hover:w-4 group-hover:opacity-100 group-hover:ml-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300 ease-out font-black">&rarr;</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/guide" class="group flex items-center font-bold text-slate-600 dark:text-gray-300">
              <span class="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600 dark:group-hover:from-teal-400 dark:group-hover:to-blue-400 transition-all duration-300">Anleitung</span>
              <span class="w-0 opacity-0 overflow-hidden group-hover:w-4 group-hover:opacity-100 group-hover:ml-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300 ease-out font-black">&rarr;</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/courses" class="group flex items-center font-bold text-slate-600 dark:text-gray-300">
              <span class="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600 dark:group-hover:from-teal-400 dark:group-hover:to-blue-400 transition-all duration-300">Kurse</span>
              <span class="w-0 opacity-0 overflow-hidden group-hover:w-4 group-hover:opacity-100 group-hover:ml-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300 ease-out font-black">&rarr;</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/lecturers" class="group flex items-center font-bold text-slate-600 dark:text-gray-300">
              <span class="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600 dark:group-hover:from-teal-400 dark:group-hover:to-blue-400 transition-all duration-300">Dozenten</span>
              <span class="w-0 opacity-0 overflow-hidden group-hover:w-4 group-hover:opacity-100 group-hover:ml-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300 ease-out font-black">&rarr;</span>
            </NuxtLink>
          </li>
        </template>
      </ul>

      <!-- LOGO FÜR DAS HANDY -->
      <div class="lg:hidden flex items-center">
        <span class="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">StudySync</span>
      </div>

      <!--Rechte Seite Buttons (Nur Desktop) -->
      <div class="hidden lg:flex items-center gap-3">
        <button @click="spendenClick" class="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2">
          <span>🤍</span> Spenden
        </button>

        <NuxtLink v-if="user" to="/dataAdd">
          <button class="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold flex items-center gap-1">
            <span class="text-lg leading-none">+</span> Hochladen 
          </button>
        </NuxtLink>

        <NuxtLink v-if="!user" to="/login">
          <button class="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white px-5 py-2 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold">
            Login
          </button>
        </NuxtLink>

        <div v-else class="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-gray-700 pl-4">
          <NuxtLink to="/profil">
            <button class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-xl shadow-md shadow-green-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold">
              Profil
            </button>
          </NuxtLink>
          <button @click="logout" class="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white px-4 py-2 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold">
            Logout
          </button>
        </div>
      </div>

      <!-- Hamburger-Menü-Knopf (Nur Handy) -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="lg:hidden p-2 text-slate-600 dark:text-gray-300 focus:outline-none">
        <span v-if="!isMobileMenuOpen" class="text-3xl leading-none">☰</span>
        <span v-else class="text-3xl leading-none">&times;</span>
      </button>

    </div>

    <!-- Handy-Menü (aufklappabr) -->
    <div v-if="isMobileMenuOpen" class="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-black border-b border-slate-100 dark:border-gray-800 shadow-2xl flex flex-col px-6 py-6 transition-all duration-300">
      
      <template v-if="user">
        <!-- Handy Links -->
        <div class="flex flex-col gap-4 border-b border-slate-100 dark:border-gray-800 pb-6 mb-6">
          <NuxtLink :to="startseiteLink" @click="isMobileMenuOpen = false" class="text-lg font-bold text-slate-700 dark:text-gray-200">Startseite</NuxtLink>
          <NuxtLink to="/guide" @click="isMobileMenuOpen = false" class="text-lg font-bold text-slate-700 dark:text-gray-200">Anleitung</NuxtLink>
          <NuxtLink to="/courses" @click="isMobileMenuOpen = false" class="text-lg font-bold text-slate-700 dark:text-gray-200">Kurse</NuxtLink>
          <NuxtLink to="/lecturers" @click="isMobileMenuOpen = false" class="text-lg font-bold text-slate-700 dark:text-gray-200">Dozenten</NuxtLink>
        </div>
        
        <!-- Handy Buttons -->
        <div class="flex flex-col gap-3">
          <button @click="spendenClick(); isMobileMenuOpen = false" class="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-3 rounded-xl font-bold flex justify-center items-center gap-2">
            <span>🤍</span> Spenden
          </button>

          <NuxtLink to="/dataAdd" @click="isMobileMenuOpen = false">
            <button class="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-3 rounded-xl font-bold flex justify-center items-center gap-1">
              <span class="text-lg leading-none">+</span> Datei hochladen
            </button>
          </NuxtLink>

          <div class="grid grid-cols-2 gap-3 mt-2">
            <NuxtLink to="/profil" @click="isMobileMenuOpen = false">
              <button class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-bold">Profil</button>
            </NuxtLink>
            <button @click="logout(); isMobileMenuOpen = false" class="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-xl font-bold">Logout</button>
          </div>
        </div>
      </template>

      <!-- Wenn auf dem Handy niemand eingeloggt ist -->
      <template v-else>
        <NuxtLink to="/login" @click="isMobileMenuOpen = false">
          <button class="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-3 rounded-xl font-bold">Login</button>
        </NuxtLink>
      </template>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()

// Speichert den aktuellen User
const user = ref(null)

// Steuert das Handy-Menü
const isMobileMenuOpen = ref(false)

// Startseite-Link
const startseiteLink = ref('/')

onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  user.value = data.session?.user ?? null
  startseiteLink.value = data.session?.user ? '/dashboard' : '/'

  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
    startseiteLink.value = session?.user ? '/dashboard' : '/'
  })
})

// Logout Funktion
const logout = async () => {
  await supabase.auth.signOut()
  user.value = null
  startseiteLink.value = '/'
  isMobileMenuOpen.value = false
  navigateTo('/')
}

// Spenden Alert
const spendenClick = () => {
  alert('Vielen Dank für das Interesse! Die Möglichkeit zu spenden wird in naher Zukunft freigeschaltet.')
}
</script>