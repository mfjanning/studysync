<script setup lang="ts">
import { ref, onMounted, computed } from "vue"

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const colorMode = useColorMode()

const selectedAvatar = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const message = ref("")
const errorMessage = ref("")
const currentAvatar = ref("")
const currentName = ref("")

const themeLabel = computed(() => colorMode.value === 'dark' ? 'Dark' : 'Light')
const displayName = computed(() => {
  return currentName.value || user.value?.user_metadata?.full_name || 'Dein Profil'
})

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const avatars = [
  "/avatars/affe.png",
  "/avatars/eule.png",
  "/avatars/nashorn.png",
  "/avatars/schmetterling.png",
  "/avatars/tiger.png"
]

const saveAvatar = async () => {
  message.value = ""
  errorMessage.value = ""

  if (!user.value) return

  if (!selectedAvatar.value) {
    errorMessage.value = "Bitte wähle zuerst ein Profilbild aus."
    return
  }

  const avatarName = selectedAvatar.value.split("/").pop()?.replace(".png", "")
  try {
    const result = await $fetch('/api/profile/avatar', {
      method: 'POST',
      body: {
        avatar: avatarName
      }
    })

    currentAvatar.value = `/avatars/${avatarName}.png`
    console.log(currentAvatar.value)
    message.value = "Profilbild wurde gespeichert."
  } catch (error: any) {
    console.error('Avatar Update Error:', error)
    errorMessage.value = error.data?.statusMessage || "Profilbild konnte nicht gespeichert werden."
  }
}

onMounted(async () => {
  try {
    // Dem Fetch-Aufruf sagen, dass ein Objekt mit einem String 'avatar' und optionalem Namen zurückkommt
    const res = await $fetch<{ avatar: string; name?: string }>('/api/profile/avatar')
    
    // Prüfen, ob res und res.avatar existieren
    if (res?.avatar) {
      currentAvatar.value = `/avatars/${res.avatar}.png`
    } else {
      currentAvatar.value = '/avatars/affe.png'
    }

    currentName.value = res?.name || ''
  } catch (e) {
    console.error("Avatar Load Error:", e)
  }
})

const changePassword = async () => {
  message.value = ""
  errorMessage.value = ""

  if (!newPassword.value || !confirmPassword.value) {
    errorMessage.value = "Bitte beide Passwortfelder ausfüllen."
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Die Passwörter stimmen nicht überein."
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = "Das Passwort muss mindestens 6 Zeichen lang sein."
    return
  }

  /*
    Supabase erkennt den eingeloggten Nutzer.
    Das neue Passwort wird verschlüsselt gespeichert.
    Der User bleibt dabei eingeloggt.
  */
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value
  })

  if (error) {
    errorMessage.value = "Passwort konnte nicht geändert werden."
    console.error(error)
    return
  }

  newPassword.value = ""
  confirmPassword.value = ""
  message.value = "Passwort wurde geändert."
}
</script>

<template>
  <!--
    Profilseite:
    Lightmode: heller Hintergrund
    Darkmode: schwarzer Hintergrund
  -->
  <div
      class="min-h-[calc(100vh-260px)]
             bg-slate-50 dark:bg-black
             font-sans text-slate-800 dark:text-gray-100
             px-6 py-8 transition-colors duration-300"
  >
    <div class="max-w-4xl mx-auto">

      <!-- Überschrift -->
      <h1
          class="text-4xl font-black uppercase tracking-tight
                 text-slate-800 dark:text-gray-100
                 mb-8 ml-2"
      >
        Mein Profil
      </h1>
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 ml-2">
        <div class="flex items-center gap-6">
          <img
            :src="currentAvatar || '/avatars/affe.png'"
            alt="Profilbild"
            class="w-24 h-24 rounded-full object-cover border-4 border-teal-400 shadow"
          />

          <div>
            <p class="text-2xl font-bold text-slate-800 dark:text-gray-100">
              {{ displayName }}
            </p>
            <p class="text-slate-500 dark:text-gray-400">
              Hier kannst du dein Profilbild und Theme einstellen.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <p class="text-slate-700 dark:text-gray-100 font-medium">
            Aktueller Modus: <span class="font-semibold">{{ themeLabel }}</span>
          </p>
          <button
              @click="toggleTheme"
              class="w-full md:w-auto bg-teal-500 text-white px-6 py-3 rounded-xl
                     hover:bg-teal-600 transition-colors duration-300"
          >
            {{ colorMode.value === 'dark' ? 'Zu Light wechseln' : 'Zu Dark wechseln' }}
          </button>
        </div>
      </div>

      <div class="space-y-8">

        <!-- Profilbild ändern -->
        <section
            class="bg-white dark:bg-gray-900
                   border border-slate-100 dark:border-gray-700
                   rounded-[2rem] p-8
                   shadow-md shadow-blue-900/5 dark:shadow-black/40
                   transition-colors duration-300"
        >
          <h2 class="text-2xl font-bold text-slate-700 dark:text-gray-100 mb-2">
            Profilbild ändern
          </h2>

          <p class="text-slate-500 dark:text-gray-400 mb-6">
            Wähle eines der vorhandenen Profilbilder aus.
          </p>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <button
                v-for="avatar in avatars"
                :key="avatar"
                @click="selectedAvatar = avatar"
                class="rounded-[2rem] border p-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                :class="selectedAvatar === avatar
                ? 'border-teal-400 ring-2 ring-teal-300 dark:ring-teal-500'
                : 'border-slate-200 dark:border-gray-700'"
            >
              <img
                  :src="avatar"
                  alt="Profilbild"
                  class="w-full aspect-square object-cover rounded-[1.5rem]"
              />
            </button>
          </div>

          <button
              @click="saveAvatar"
              class="bg-gray-500 dark:bg-gray-700
                     text-white px-6 py-3 rounded-xl
                     hover:bg-gray-600 dark:hover:bg-gray-600
                     transition"
          >
            Profilbild speichern
          </button>
        </section>

        <!-- Passwort ändern -->
        <section
            class="bg-white dark:bg-gray-900
                   border border-slate-100 dark:border-gray-700
                   rounded-[2rem] p-8
                   shadow-md shadow-blue-900/5 dark:shadow-black/40
                   transition-colors duration-300"
        >
          <h2 class="text-2xl font-bold text-slate-700 dark:text-gray-100 mb-2">
            Passwort ändern
          </h2>

          <p class="text-slate-500 dark:text-gray-400 mb-6">
            Gib dein neues Passwort zweimal ein.
          </p>

          <div class="space-y-4">
            <input
                v-model="newPassword"
                type="password"
                placeholder="Neues Passwort"
                class="w-full px-6 py-4 rounded-2xl
                       border border-slate-200 dark:border-gray-700
                       shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-400
                       bg-white dark:bg-gray-800
                       text-slate-800 dark:text-gray-100
                       placeholder:text-slate-400 dark:placeholder:text-gray-500
                       transition-colors duration-300"
            />

            <input
                v-model="confirmPassword"
                type="password"
                placeholder="Neues Passwort bestätigen"
                class="w-full px-6 py-4 rounded-2xl
                       border border-slate-200 dark:border-gray-700
                       shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-400
                       bg-white dark:bg-gray-800
                       text-slate-800 dark:text-gray-100
                       placeholder:text-slate-400 dark:placeholder:text-gray-500
                       transition-colors duration-300"
            />

            <button
                @click="changePassword"
                class="bg-gray-500 dark:bg-gray-700
                       text-white px-6 py-3 rounded-xl
                       hover:bg-gray-600 dark:hover:bg-gray-600
                       transition"
            >
              Passwort ändern
            </button>
          </div>
        </section>

        <!-- Erfolgsmeldung -->
        <p v-if="message" class="text-green-600 dark:text-green-400 font-semibold ml-2">
          {{ message }}
        </p>

        <!-- Fehlermeldung -->
        <p v-if="errorMessage" class="text-red-600 dark:text-red-400 font-semibold ml-2">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>