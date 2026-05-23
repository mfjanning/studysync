<script setup>
defineProps({
  titel: { type: String, default: 'Bist du sicher?' },
  nachricht: { type: String, default: 'Diese Aktion kann nicht rückgängig gemacht werden.' },
  bestaetigenText: { type: String, default: 'Löschen' },
  abbrechenText: { type: String, default: 'Abbrechen' },
  laedt: { type: Boolean, default: false }
})

defineEmits(['bestaetigen', 'abbrechen'])
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-100 dark:border-gray-700">
      
      <h3 class="text-base font-extrabold text-slate-800 dark:text-gray-100 mb-2">
        {{ titel }}
      </h3>
      <p class="text-sm text-slate-500 dark:text-gray-400 mb-6">
        {{ nachricht }}
      </p>

      <div class="flex gap-3">
        <button
          @click="$emit('abbrechen')"
          :disabled="laedt"
          class="flex-1 py-2.5 rounded-xl font-bold text-sm border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          {{ abbrechenText }}
        </button>
        <button
          @click="$emit('bestaetigen')"
          :disabled="laedt"
          class="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 transition-colors"
        >
          <span v-if="laedt">Wird gelöscht...</span>
          <span v-else>{{ bestaetigenText }}</span>
        </button>
      </div>

    </div>
  </div>
</template>