<script setup>
const colorMode = useColorMode()

const toggle = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    @click="toggle"
    class="p-2 rounded-lg bg-slate-200 dark:bg-gray-700 transition-colors duration-300"
  >
    {{ colorMode.value === 'dark' ? '☀️ Light' : '🌙 Dark' }}
  </button>
</template>