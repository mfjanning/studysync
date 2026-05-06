<script setup lang="ts">
import { ref } from "vue"

const supabase = useSupabaseClient()

const selectedAvatar = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const message = ref("")
const errorMessage = ref("")

const avatars = [
  "/avatars/affe.png",
  "/avatars/eule.png",
  "/avatars/nashorn.png",
  "/avatars/schmetterling.png",
  "/avatars/tiger.png"
]

const user = useSupabaseUser()

// Aktuellen Avatar laden
const { data: profileData } = await (supabase as any)
  .from("profile")
  .select("avatar")
  .eq("id", user.value?.id)
  .single()

if (profileData?.avatar) {
  selectedAvatar.value = profileData.avatar
}

const saveAvatar = async () => {
  message.value = ""
  errorMessage.value = ""

  if (!selectedAvatar.value) {
    errorMessage.value = "Bitte wähle zuerst ein Profilbild aus."
    return
  }

  const { error } = await (supabase as any)
    .from("profile")
    .update({ avatar: selectedAvatar.value })
    .eq("id", user.value?.id)

  if (error) {
    errorMessage.value = "Profilbild konnte nicht gespeichert werden."
    console.error(error)
    return
  }

  message.value = "Profilbild wurde gespeichert."
}

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

  // Supabase erkennt den eingeloggten Nutzer, PW wird verschlüsselt und das alte überschrieben,
  // User bleibt eingeloggt
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
  <div class="min-h-[calc(100vh-260px)] bg-slate-50 font-sans text-slate-800 px-6 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-black uppercase tracking-tight text-slate-800 mb-8 ml-2">
        Mein Profil
      </h1>

      <div class="space-y-8">
        <section class="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-md shadow-blue-900/5">
          <h2 class="text-2xl font-bold text-slate-700 mb-2">
            Profilbild ändern
          </h2>

          <p class="text-slate-500 mb-6">
            Wähle eines der vorhandenen Profilbilder aus.
          </p>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <button
                v-for="avatar in avatars"
                :key="avatar"
                @click="selectedAvatar = avatar"
                class="rounded-[2rem] border p-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                :class="selectedAvatar === avatar
                ? 'border-teal-400 ring-2 ring-teal-300'
                : 'border-slate-200'"
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
              class="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition"
          >
            Profilbild speichern
          </button>
        </section>

        <section class="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-md shadow-blue-900/5">
          <h2 class="text-2xl font-bold text-slate-700 mb-2">
            Passwort ändern
          </h2>

          <p class="text-slate-500 mb-6">
            Gib dein neues Passwort zweimal ein.
          </p>

          <div class="space-y-4">
            <input
                v-model="newPassword"
                type="password"
                placeholder="Neues Passwort"
                class="w-full px-6 py-4 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            />

            <input
                v-model="confirmPassword"
                type="password"
                placeholder="Neues Passwort bestätigen"
                class="w-full px-6 py-4 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            />

            <button
                @click="changePassword"
                class="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition"
            >
              Passwort ändern
            </button>
          </div>
        </section>

        <p v-if="message" class="text-green-600 font-semibold ml-2">
          {{ message }}
        </p>

        <p v-if="errorMessage" class="text-red-600 font-semibold ml-2">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>