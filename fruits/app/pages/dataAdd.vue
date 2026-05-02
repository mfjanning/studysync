<script setup>
import { ref } from 'vue';

const { data: kurseData, pending, error } = await useFetch('/api/kurse');

const selectedKurs = ref(null);
const selectedTyp = ref('altklausur');
const selectedFile = ref(null);
const selectedJahr = ref(null);
const isUploading = ref(false);
const uploadMessage = ref('');

function handleFileChange(event) {
  selectedFile.value = event.target.files[0];
}

async function uploadFile() {
  if (!selectedFile.value || !selectedKurs.value || !selectedTyp.value || !selectedJahr.value) {
    uploadMessage.value = 'Bitte alle Felder ausfüllen.';
    return;
  }

  isUploading.value = true;
  uploadMessage.value = '';

  const formData = new FormData();
  formData.append('kursID', selectedKurs.value);
  formData.append('typ', selectedTyp.value);
  formData.append('jahr', selectedJahr.value);
  formData.append('file', selectedFile.value, selectedFile.value.name);

  try {
    const result = await $fetch('/api/dateien', {
      method: 'POST',
      body: formData,
    });

    uploadMessage.value = `Upload erfolgreich! Datei: ${result.file.dateiname}`;
    selectedKurs.value = null;
    selectedTyp.value = 'altklausur';
    selectedJahr.value = null;
    selectedFile.value = null;
    document.getElementById('file').value = '';

  } catch (error) {
    console.error('Upload-Fehler:', error);
    uploadMessage.value = error.data?.statusMessage || 'Ein Fehler ist aufgetreten.';
  } finally {
    isUploading.value = false;
  }
}
</script>

<template>
  <div>
    <h2>Datei hochladen</h2>
    <form @submit.prevent="uploadFile">
      
      <div>
        <label for="kurs">Kurs:</label>
        <select id="kurs" v-model="selectedKurs" required>
          <option :value="null" disabled>
            {{ pending ? 'Lade Kurse...' : 'Bitte einen Kurs wählen...' }}
          </option>
          
          <option 
            v-for="course in kurseData?.courses" 
            :key="course.id" 
            :value="course.id"
          >
            {{ course.name }}
          </option>
        </select>
        <p v-if="error">Fehler beim Laden der Kurse.</p>
      </div>

      <div>
        <label for="typ">Typ:</label>
        <select id="typ" v-model="selectedTyp" required>
          <option value="altklausur">Altklausuren</option>
          <option value="loesung">Aufgabenlösungen</option>
          <option value="mitschrift">Mitschriften</option>
        </select>
      </div>

      <div>
        <label for="jahr">Jahr:</label>
        <input type="number" id="jahr" v-model="selectedJahr" required />
      </div>

      <div>
        <label for="file">Datei:</label>
        <input type="file" id="file" @change="handleFileChange" required>
      </div>

      <button type="submit" :disabled="isUploading">
        {{ isUploading ? 'Lade hoch...' : 'Hochladen' }}
      </button>

      <p v-if="uploadMessage">{{ uploadMessage }}</p>
    </form>
  </div>
</template>