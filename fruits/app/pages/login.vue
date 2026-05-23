<template>
  <div class="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4 transition-colors duration-300">
    
    <!-- Login/Register Karte im neuen Design -->
    <div class="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 dark:shadow-black/40 border border-slate-100 dark:border-gray-800 transition-colors duration-300">

      <!-- Dynamischer Titel -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-gray-100 mb-2">
          {{ mode === 'login' ? 'Willkommen zurück!' : 'Account erstellen' }}
        </h1>
        <p class="text-slate-500 dark:text-gray-400 font-medium">
          {{ mode === 'login' ? 'Schön, dass du wieder da bist.' : 'Werde Teil der StudySync Community.' }}
        </p>
      </div>

      <!-- Tab Toggle -->
      <div class="flex bg-slate-100 dark:bg-gray-800 rounded-xl p-1 mb-8 transition-colors duration-300">
        <button
            @click="mode = 'login'"
            :class="mode === 'login'
            ? 'bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 shadow-sm'
            : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'"
            class="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
        >
          Login
        </button>

        <button
            @click="mode = 'register'"
            :class="mode === 'register'
            ? 'bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 shadow-sm'
            : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'"
            class="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
        >
          Registrieren
        </button>
      </div>

      <!-- Formular -->
      <div class="space-y-4">
        
        <!-- Vorname (nur bei Registrierung) -->
        <div v-if="mode === 'register'">
          <label class="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-1">
            Benutzername
          </label>
          <input
              type="text"
              v-model="firstName"
              placeholder="Max"
              class="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
          />
        </div>

        <!-- E-Mail (immer) -->
        <div>
          <label class="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-1">
            E-Mail
          </label>
          <input
              type="email"
              v-model="email"
              placeholder="max@example.com"
              class="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
          />
        </div>

        <!-- Passwort (immer) -->
        <div>
          <label class="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-1">
            Passwort
          </label>
          <input
              type="password"
              v-model="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
          />
        </div>

        <!-- Passwort wiederholen (nur bei Registrierung) -->
        <div v-if="mode === 'register'">
          <label class="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-1">
            Passwort wiederholen
          </label>
          <input
              type="password"
              v-model="passwordConfirm"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
          />
        </div>

        <!-- Feedback-Nachricht -->
        <div 
          v-if="message" 
          :class="[
            'p-3 rounded-xl font-bold text-center text-sm transition-all mt-4',
            isError ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
          ]"
        >
          {{ message }}
        </div>

        <!-- Haupt-Button -->
        <button
            @click="mode === 'login' ? login() : createAccount()"
            class="w-full mt-6 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          {{ mode === 'login' ? 'Einloggen' : 'Konto erstellen' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const supabase = useSupabaseClient()

const mode = ref("login")
const email = ref("")
const password = ref("")
const passwordConfirm = ref("") 
const firstName = ref("")
const message = ref("")
const isError = ref(false)

function showMessage(text, error = false) {
  message.value = text
  isError.value = error

  setTimeout(() => {
    message.value = ""
  }, 4000) 
}

// Hilfsfunktion: Prüft, ob eine E-Mail gültig aussieht
function istEmailGueltig(mail) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(mail)
}

async function istNameVergeben(name) {
  const { vergeben } = await $fetch(`/api/auth/check-name?name=${encodeURIComponent(name.trim())}`)
  return vergeben
}

async function createAccount() {
  if (!firstName.value || firstName.value.trim() === "") {
    showMessage("Bitte einen Vornamen eingeben.", true)
    return
  }

  // NEU: Name auf Einzigartigkeit prüfen
  const namevergeben = await istNameVergeben(firstName.value)
  if (namevergeben) {
    showMessage("Dieser Name ist bereits vergeben. Bitte wähle einen anderen.", true)
    return
  }

  if (!istEmailGueltig(email.value)) {
    showMessage("Bitte eine gültige E-Mail-Adresse eingeben.", true)
    return
  }

  // Sicherheitscheck: Stimmen die Passwörter überein?
  if (password.value !== passwordConfirm.value) {
    showMessage("Die Passwörter stimmen nicht überein.", true)
    return
  }

  // Sicherheitscheck: Ist das Passwort lang genug?
  if (password.value.length < 6) {
    showMessage("Das Passwort muss mindestens 6 Zeichen lang sein.", true)
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { first_name: firstName.value }
    }
  })

  if (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      showMessage("Dieser Name ist bereits vergeben.", true)
    } else {
      showMessage(error.message, true)
    }
  }
  else {
    showMessage("Account erstellt! Bitte E-Mail bestätigen.")
    password.value = ""
    passwordConfirm.value = ""
  }
}

async function login() {
  // Auch beim Login prüfen, ob die E-Mail überhaupt gültig ist
  if (!istEmailGueltig(email.value)) {
    showMessage("Bitte eine gültige E-Mail-Adresse eingeben.", true)
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    showMessage("Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen.", true)
  } else {
    showMessage("Erfolgreich eingeloggt!")
    await navigateTo("/dashboard")
  }
}
</script>