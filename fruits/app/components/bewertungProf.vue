<script setup>
import { ref } from 'vue'

const props = defineProps({
  dozentId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['gespeichert', 'abbrechen'])

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Kriterien für Dozenten
const verstaendlichkeit = ref(3)
const struktur = ref(3)
const engagement = ref(3)
const freundlichkeit = ref(3)
const gesamt = ref(3)

const isLoading = ref(false)

const speichern = async () => {
  if (!user.value) {
    alert("Man muss eingeloggt sein.")
    return
  }

  isLoading.value = true

  const { error } = await supabase
      .from('bewertung_dozent')
      .insert({
        dozentID: props.dozentId,
        nutzerID: user.value.sub,
        verstaendlichkeit: verstaendlichkeit.value,
        struktur: struktur.value,
        engagement: engagement.value,
        freundlichkeit: freundlichkeit.value,
        gesamtbewertung: gesamt.value
      })

  isLoading.value = false

  if (error) {
    console.error("Fehler von Supabase:", error)
    
    //Prüfung auf doppelten Eintrag
    if (error.code === '23505') {
      alert("Du hast diesen Dozenten bereits bewertet!")
    } else {
      alert("Fehler beim Speichern.")
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
    <h3 class="font-black text-2xl text-slate-800 dark:text-gray-100 mb-6">Dozent bewerten</h3>

    <div class="space-y-6">

      <!-- Verständlichkeit -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Verständlichkeit</span>
          <span class="text-green-600 dark:text-green-400">{{ verstaendlichkeit}}</span>
        </label>
        <input type="range" min="1" max="5" step="1" v-model.number="verstaendlichkeit"
               class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 dark:accent-green-500">
      </div>

      <!-- Struktur -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Struktur</span>
          <span class="text-green-600 dark:text-green-400">{{ struktur}}</span>
        </label>
        <input type="range" min="1" max="5" step="1" v-model.number="struktur"
               class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 dark:accent-green-500">
      </div>

      <!-- Engagement -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Engagement</span>
          <span class="text-green-600 dark:text-green-400">{{ engagement }}</span>
        </label>
        <input type="range" min="1" max="5" step="1" v-model.number="engagement"
               class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 dark:accent-green-500">
      </div>

      <!-- Freundlichkeit -->
      <div>
        <label class="flex justify-between text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">
          <span>Freundlichkeit</span>
          <span class="text-green-600 dark:text-green-400">{{ freundlichkeit }}</span>
        </label>
        <input type="range" min="1" max="5" step="1" v-model.number="freundlichkeit"
               class="w-full h-4 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 dark:accent-green-500">
      </div>

      <!-- Gesamtbewertung -->
      <div class="pt-6 border-t border-slate-100 dark:border-gray-700">
        <label class="flex justify-between text-lg font-black text-slate-800 dark:text-gray-100 mb-3">
          <span>Gesamtbewertung</span>
          <span class="text-amber-500">{{ gesamt}} ★</span>
        </label>
        <input type="range" min="1" max="5" step="1" v-model.number="gesamt"
               class="w-full h-5 bg-amber-100 dark:bg-amber-900/40 rounded-lg appearance-none cursor-pointer accent-amber-500">
      </div>

      <div class="flex gap-3 pt-4">
        <button @click="emit('abbrechen')" class="flex-1 py-4 font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-2xl transition-colors">
          Abbrechen
        </button>
        <button @click="speichern" :disabled="isLoading" class="flex-1 py-4 font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 rounded-2xl transition-colors shadow-lg shadow-green-600/30 dark:shadow-green-900/40">
          {{ isLoading ? 'Speichert...' : 'Senden' }}
        </button>
      </div>
    </div>
  </div>
</template>