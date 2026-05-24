<template>
  <div class="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4 transition-colors duration-300">
    
    <div class="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-gray-800">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-slate-800 dark:text-gray-100 mb-2">Neues Passwort</h1>
        <p class="text-slate-500 dark:text-gray-400 font-medium">Bitte lege ein sicheres neues Passwort fest.</p>
      </div>

      <div class="space-y-4">
        <!-- Neues Passwort -->
        <div>
          <label class="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-1">Neues Passwort</label>
          <input
              type="password"
              v-model="newPassword"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-teal-400 outline-none transition"
          />
        </div>

        <!-- Passwort bestätigen -->
        <div>
          <label class="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-1">Passwort wiederholen</label>
          <input
              type="password"
              v-model="confirmPassword"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-teal-400 outline-none transition"
          />
        </div>

        <!-- Feedback -->
        <div v-if="message" :class="[
          'p-3 rounded-xl font-bold text-center text-sm mt-4',
          isError ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        ]">
          {{ message }}
        </div>

        <button
            @click="updatePassword"
            :disabled="loading"
            class="w-full mt-6 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-all"
        >
          {{ loading ? 'Wird gespeichert...' : 'Passwort speichern' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const supabase = useSupabaseClient()
const newPassword = ref("")
const confirmPassword = ref("")
const message = ref("")
const isError = ref(false)
const loading = ref(false)
const isReady = ref(false)

onMounted(() => {
  // Erkennt Supabase automatisch den Reset-Token aus der URL und wechselt in den PASSWORD_RECOVERY Modus, wenn er gültig ist.
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      isReady.value = true
    }
  })
})

async function updatePassword() {
  if (newPassword.value.length < 6) {
    message.value = "Das Passwort muss mindestens 6 Zeichen lang sein."
    isError.value = true
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = "Die Passwörter stimmen nicht überein."
    isError.value = true
    return
  }

  loading.value = true
  
  // Versuchen password zu aktualisieren. Supabase wird automatisch den Reset-Token aus der URL verwenden.
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value
  })

  loading.value = false

  if (error) {
    message.value = "Fehler: " + error.message
    isError.value = true
  } else {
    message.value = "Passwort erfolgreich geändert! Du wirst weitergeleitet..."
    isError.value = false
    setTimeout(() => {
      navigateTo("/login")
    }, 2000)
  }
}
</script>