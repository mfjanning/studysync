<script setup lang="ts">
/*
  Holt den aktuell eingeloggten User von Supabase:
  null = nicht eingeloggt
  Objekt = eingeloggt
*/
const user = useSupabaseUser()

/*
  Darkmode Zustand
*/
const isDark = ref(false)

/*
  Toggle Darkmode:
  - fügt oder entfernt die Klasse 'dark' am <html>-Element
*/
const toggleDarkMode = () => {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<template>

</template>