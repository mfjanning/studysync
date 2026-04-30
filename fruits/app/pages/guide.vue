<script setup>
import { ref } from 'vue'

const openIndex = ref(null)

const faqs = [
  {
    frage: 'Für wen ist StudySync geeignet?',
    antwort: 'Für Studierende des Fachbereichs 06 der Universität Osnabrück.'
  },
  {
    frage: 'Wofür ist StudySync?',
    antwort: 'StudySync ist ein Ort, an dem Studierende Skripte, Mitschriften und Altklausuren teilen können. Je mehr wir unser Wissen miteinander teilen, ' +
        'desto einfacher wird das Lernen für alle.'
  },
  {
    frage: 'Wer kann Dateien hochladen?',
    antwort: 'Jeder, der bereit ist, seine Unterlagen zu teilen. Einfach den "Datei hochladen" Button nutzen Und die Felder entsprechens ausfüllen. Uploads sind bis ' +
        '50 MB möglich.'
  },
  {
    frage: 'Wie funktionieren die Bewertungen?',
    antwort: 'In der jeweiligen Modulübersicht findest du die Gesamtbewertung eines Kurses sowie des zugehörigen Dozenten. Dozenten können zusätzlich über den Menüpunkt' +
        ' "Dozenten" gesucht und dort anhand eines Sternesystems bewertet werden. Ein Stern steht für die niedrigste, fünf Sterne für die höchste Bewertung. Dabei wird ' +
        'bewusst zwischen Modulen und Dozenten unterschieden, da sich Dozenten im Laufe der Zeit ändern können. Einzelne Bewertungen spiegeln stets subjektive Eindrücke ' +
        'wider, während die Gesamtbewertung einen aktuellen Überblick über die Qualität eines Kurses oder eines Dozenten geben soll.'
  }
]

function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 p-6 md:p-12">
    <div class="max-w-4xl mx-auto">

      <h1 class="text-4xl font-black uppercase tracking-tight text-slate-800 mb-8 ml-2">
        Anleitung / FAQ
      </h1>

      <ul class="space-y-4">
        <li
            v-for="(faq, index) in faqs"
            :key="index"
            class="group bg-white border border-slate-100 p-2 rounded-[2rem] shadow-md shadow-blue-900/5 hover:shadow-xl hover:shadow-teal-900/10 hover:border-teal-200 transition-all duration-300 transform hover:-translate-y-1"
        >
          <button
              @click="toggle(index)"
              class="flex items-center justify-between p-4 w-full text-left"
          >
            <div class="flex-1 pr-4">
              <h2 class="text-xl md:text-2xl font-bold text-slate-700 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-blue-600 transition-all duration-300">
                {{ faq.frage }}
              </h2>

              <transition name="faq">
                <div
                    v-if="openIndex === index"
                    class="mt-4 text-slate-600 text-base leading-relaxed"
                >
                  {{ faq.antwort }}
                </div>
              </transition>
            </div>

            <div
                class="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-blue-500 group-hover:text-white transition-all duration-300 shadow-sm shrink-0"
            >
              <span class="text-2xl leading-none">
                {{ openIndex === index ? '−' : '+' }}
              </span>
            </div>
          </button>
        </li>
      </ul>

    </div>
  </div>
</template>

<style scoped>
.faq-enter-active,
.faq-leave-active {
  transition: all 0.25s ease;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.faq-enter-to,
.faq-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>