<template>
  <div class="flex min-h-screen flex-col bg-slate-50 dark:bg-black transition-colors duration-300">
    <NavBar />

    <!-- pb-10 wichtig wegen fixed Footer -->
    <main class="flex-grow bg-slate-50 dark:bg-black">
      <NuxtPage />
    </main>

    <Footer />
  </div>
</template>