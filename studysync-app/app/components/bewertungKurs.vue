<script setup>
import { ref } from 'vue'

const props = defineProps({
  kursId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['gespeichert', 'abbrechen'])

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Alle Kriterien sind manuell einstellbar, inklusive Gesamtbewertung
const aufwand = ref(3)
const nutzen = ref(3)
const schwierigkeit = ref(3)
const praxisbezug = ref(3)
const gesamt = ref(3)

const isLoading = ref(false)

const speichern = async () => {
  if (!user.value) {
    alert("Man muss eingeloggt sein, um eine Bewertung abzugeben.")
    return
  }

  isLoading.value = true

  const { error } = await supabase
      .from('bewertung_kurs')
      .insert({
        kursID: props.kursId,
        nutzerID: user.value.sub, 
        aufwand: aufwand.value,
        nutzen: nutzen.value,
        schwierigkeit: schwierigkeit.value,
        praxisbezug: praxisbezug.value,
        gesamtbewertung: gesamt.value
      })

  isLoading.value = false

  if (error) {
    console.error("Fehler von Supabase:", error)
    
    //Prüfung auf doppelten Eintrag
    if (error.code === '23505') {
      alert("Du hast diesen Kurs bereits bewertet!")
    } else {
      alert("Fehler beim Speichern der Kurs-Bewertung.")
    }
  } else {
    emit('gespeichert')
  }
}
</script>

<template>
  <div
      class="bg-white dark:bg-gray-900
           p-8 rounded-[2rem]
           shadow-2xl dark:shadow-black/50
           border border-slate-100 dark:border-gray-700
           max-w-md w-full
           transition-colors duration-300"
  >
    <h3 class="font-black text-2xl text-slate-800 dark:text-gray-100 mb-6">
      Kurs bewerten
    </h3>

    <div class="space-y-6">

      <!-- Aufwand -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Aufwand (1★ = Viel Aufwand)</span>
          <span class="text-blue-600 dark:text-blue-400">{{ aufwand}}</span>
        </label>
        <input
            type="range" min="1" max="5" step="1" v-model.number="aufwand"
            class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
        >
      </div>

      <!-- Nutzen -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Nutzen (5★ = Hoher Nutzen)</span>
          <span class="text-blue-600 dark:text-blue-400">{{ nutzen }}</span>
        </label>
        <input
            type="range" min="1" max="5" step="1" v-model.number="nutzen"
            class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
        >
      </div>

      <!-- Schwierigkeit -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Schwierigkeit (1★ = Hohe Schwierigkeit)</span>
          <span class="text-blue-600 dark:text-blue-400">{{ schwierigkeit}}</span>
        </label>
        <input
            type="range" min="1" max="5" step="1" v-model.number="schwierigkeit"
            class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
        >
      </div>

      <!-- Praxisbezug -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Praxisbezug (5★ = Hoher Praxisbezug)</span>
          <span class="text-blue-600 dark:text-blue-400">{{ praxisbezug}}</span>
        </label>
        <input
            type="range" min="1" max="5" step="1" v-model.number="praxisbezug"
            class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
        >
      </div>

      <!-- Gesamtbewertung -->
      <div class="pt-6 border-t border-slate-100 dark:border-gray-700">
        <label class="flex justify-between text-lg font-black text-slate-800 dark:text-gray-100 mb-3">
          <span>Gesamtbewertung </span>
          <span class="text-amber-500">{{ gesamt}} ★</span>
        </label>
        <input
            type="range" min="1" max="5" step="1" v-model.number="gesamt"
            class="w-full h-5 bg-amber-100 dark:bg-amber-900/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
        >
      </div>

      <div class="flex gap-3 pt-4">
        <button
            @click="emit('abbrechen')"
            class="flex-1 py-4 font-bold
                 text-slate-500 dark:text-gray-400
                 bg-slate-100 dark:bg-gray-800
                 hover:bg-slate-200 dark:hover:bg-gray-700
                 rounded-2xl transition-colors"
        >
          Abbrechen
        </button>

        <button
            @click="speichern"
            :disabled="isLoading"
            class="flex-1 py-4 font-bold text-white
                 bg-blue-600 hover:bg-blue-700
                 dark:bg-blue-600 dark:hover:bg-blue-500
                 rounded-2xl transition-colors
                 shadow-lg shadow-blue-600/30 dark:shadow-blue-900/40"
        >
          {{ isLoading ? 'Speichert...' : 'Senden' }}
        </button>
      </div>
    </div>
  </div>
</template>