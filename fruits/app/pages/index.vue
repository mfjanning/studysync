//Landingpage für ausgeloggte User

<script setup lang="ts">
const goToLogin = () => {
  navigateTo('/login')
}
</script>

<template>
  <div class="hero">

    <!-- Mittlerer Bereich -->
    <div class="center">
      <img
          src="/StudySync_Logo.png"
          class="logo"
          @click="goToLogin"
      />
      <p class="slogan">Study smarter. Not harder.</p>
    </div>

    <!-- Icons drumherum -->
    <img src="/icon1.png" class="floating top-left" title="Teile Lernmaterialien mit anderen Studierenden!" />
    <img src="/icon7.png" class="floating top-right" title="Finde die besten Zusammenfassungen!" />
    <img src="/icon3.png" class="floating left" title="Bewerte Kurse und Dozenten!" />
    <img src="/icon4.png" class="floating right" title="Diskutiere im Forum!" />
    <img src="/icon5.png" class="floating bottom-left" title="Lerne effizienter mit StudySync!" />
    <img src="/icon6.png" class="floating bottom-right" title="Wusstest du, dass der Master Nils Burger nach dem Erfinder der SWOSY App benannt ist?" />

  </div>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100vh - 260px);
  background: white;
  overflow: hidden;
}

/* MITTLERER BEREICH */
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
}

.logo {
  width: 250px;
  height: auto;
  border-radius: 18px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.logo:hover {
  transform: scale(1.04);
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.22);
  cursor: pointer;
}

.slogan {
  margin-top: 20px;
  color: #ccc;
  font-size: 20px;
  position: relative;
  z-index: 3;
  transition: transform 0.25s ease, color 0.25s ease, text-shadow 0.25s ease;
}

.slogan:hover {
  transform: scale(1.05);
  color: #aaa;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: default;
}

/* ICONS */
.floating {
  position: absolute;
  width: 120px;
  border-radius: 20px;
  z-index: 1;
  transition: filter 0.3s ease, box-shadow 0.3s ease;
}

.floating:hover {
  filter: brightness(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  cursor: default;
}

.top-left {
  top: 2%;
  left: 40%;
  animation: drift-1 6.2s ease-in-out infinite;
  animation-delay: 0.4s;
}

.top-right {
  top: 18%;
  right: 25%;
  animation: drift-2 7.1s ease-in-out infinite;
  animation-delay: 1.3s;
}

.left {
  top: 30%;
  left: 22%;
  transform: translateY(-50%);
  animation: drift-middle-1 6.8s ease-in-out infinite;
  animation-delay: 0.9s;
}

.right {
  top: 52%;
  right: 20%;
  transform: translateY(-50%);
  animation: drift-middle-2 7.6s ease-in-out infinite;
  animation-delay: 1.8s;
}

.bottom-left {
  bottom: 25%;
  left: 27%;
  animation: drift-3 6.5s ease-in-out infinite;
  animation-delay: 0.7s;
}

.bottom-right {
  bottom: 10%;
  right: 32%;
  animation: drift-4 7.3s ease-in-out infinite;
  animation-delay: 1.1s;
}

/* ANIMATIONEN */
@keyframes drift-1 {
  0%   { transform: translate(0px, 0px); }
  25%  { transform: translate(4px, -6px); }
  50%  { transform: translate(8px, -2px); }
  75%  { transform: translate(3px, 5px); }
  100% { transform: translate(0px, 0px); }
}

@keyframes drift-2 {
  0%   { transform: translate(0px, 0px); }
  25%  { transform: translate(-5px, -4px); }
  50%  { transform: translate(-9px, 3px); }
  75%  { transform: translate(-3px, 6px); }
  100% { transform: translate(0px, 0px); }
}

@keyframes drift-3 {
  0%   { transform: translate(0px, 0px); }
  25%  { transform: translate(6px, -3px); }
  50%  { transform: translate(10px, 4px); }
  75%  { transform: translate(2px, 7px); }
  100% { transform: translate(0px, 0px); }
}

@keyframes drift-4 {
  0%   { transform: translate(0px, 0px); }
  25%  { transform: translate(-4px, -5px); }
  50%  { transform: translate(-8px, 2px); }
  75%  { transform: translate(-2px, 6px); }
  100% { transform: translate(0px, 0px); }
}

@keyframes drift-middle-1 {
  0%   { transform: translateY(-50%) translate(0px, 0px); }
  25%  { transform: translateY(-50%) translate(5px, -5px); }
  50%  { transform: translateY(-50%) translate(9px, 2px); }
  75%  { transform: translateY(-50%) translate(2px, 6px); }
  100% { transform: translateY(-50%) translate(0px, 0px); }
}

@keyframes drift-middle-2 {
  0%   { transform: translateY(-50%) translate(0px, 0px); }
  25%  { transform: translateY(-50%) translate(-5px, -4px); }
  50%  { transform: translateY(-50%) translate(-10px, 3px); }
  75%  { transform: translateY(-50%) translate(-3px, 7px); }
  100% { transform: translateY(-50%) translate(0px, 0px); }
}

/* Tablet */
@media (max-width: 900px) {
  .top-left { left: 34%; }
  .top-right { right: 20%; }
  .left { left: 12%; }
  .right { right: 12%; }
  .bottom-left { left: 22%; }
  .bottom-right { right: 28%; }
  .floating { width: 100px; }
  .logo { width: 220px; }
  .slogan { font-size: 18px; }
}

/* Handy */
@media (max-width: 600px) {
  .hero {
    min-height: calc(100vh - 180px);
  }

  .center {
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .logo {
    width: 160px;
  }

  .slogan {
    font-size: 15px;
    margin-top: 12px;
    padding: 0 12px;
  }

  .floating {
    width: 58px;
  }

  .top-left { top: 10%; left: 20%; }
  .top-right { top: 14%; right: 12%; }
  .left { top: 34%; left: 6%; }
  .right { top: 42%; right: 6%; }
  .bottom-left { bottom: 18%; left: 16%; }
  .bottom-right { bottom: 14%; right: 16%; }
}
</style>