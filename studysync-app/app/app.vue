<template>
  <div class="flex min-h-screen flex-col bg-slate-50 dark:bg-black transition-colors duration-300">
    <!-- Loading bis Auth geklärt ist -->
    <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
      <div class="text-slate-500">Loading...</div>
    </div>

    <!-- Nur rendern wenn Auth geklärt -->
    <template v-else>
      <NavBar />
      <main class="flex-grow bg-slate-50 dark:bg-black">
        <NuxtPage />
      </main>
      <Footer />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const router = useRouter()
const supabase = useSupabaseClient()
const isLoading = ref(true)

// Nur hier dürfen Nutzer hin, die nicht eingeloggt sind und umgekehrt dürfen eingeloggte Nutzer hier nicht hin
const publicRoutes = ['/', '/login', '/update-password']

onMounted(async () => {
  // Warte bis Session geladen ist
  const { data: { session } } = await supabase.auth.getSession()

  const currentPath = router.currentRoute.value.path

  // NICHT eingeloggt
  if (!session) {
    if (!publicRoutes.includes(currentPath)) {
      await router.push('/login')
    }
  }

  // EINGELOGGT
  else {
    // Nur vom Login oder der Startseite ins Dashboard leiten!
    // Auf /update-password darf man auch mit Session bleiben.
    if (currentPath === '/' || currentPath === '/login') {
      await router.push('/dashboard')
    }
  }

  isLoading.value = false
})
</script>