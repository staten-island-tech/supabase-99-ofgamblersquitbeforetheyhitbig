<template>
  <div class="main-layout">
    <!-- Side Tab for Rarity Rates -->
    <aside class="rarity-tab">
      <h2 class="rarity-title">Rarity Rates</h2>
      <ul>
        <li v-for="(rate, rarity) in rarityRates" :key="rarity" :class="rarityClass(rarity)">
          <span class="rarity-label">{{ rarity }}</span>
          <span class="rarity-percent">{{ rate }}%</span>
        </li>
      </ul>
    </aside>

    <!-- Main Gacha Content -->
    <div class="container">
      <h1 class="title">🎯 Gacha Pull</h1>

      <div class="buttons">
        <button @click="singlePull" :disabled="isCooldown" class="button-single">Single Pull</button>
        <button @click="tenPull" :disabled="isCooldown" class="button-ten">10 Pull</button>
      </div>

      <div v-if="results.length" class="results-grid">
        <div
          v-for="(item, index) in results"
          :key="index"
          class="card"
          :class="rarityClass(item.Rarity)"
        >
          <img :src="item.Image" alt="Character" class="character-img" />
          <p class="character-name">{{ item.Name }}</p>
          <p class="rarity-stars">
            <span v-for="n in getStars(item.Rarity)" :key="n">⭐</span>
          </p>
          <p class="character-desc">{{ item.Desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { gsap } from 'gsap'

const results = ref([])
const isCooldown = ref(false)
const COOLDOWN_MS = 1000

const rarityRates = {
  'Lebron James': 0.01,
  Korean: 0.1,
  Legendary: 1,
  Rare: 25,
  Common: 73.89,
}

const gachaPool = [
  { Name: 'Barney', Rarity: 'Rare', Desc: 'Barney is a dinosaur that haunts your imagination', Image: 'Barney.webp' },
  { Name: 'Belle', Rarity: 'Korean', Desc: 'ryyan loves gooning', Image: 'Belle.jpg' },
  { Name: 'Bob', Rarity: 'Rare', Desc: 'licks you', Image: 'Bob.jpg' },
  { Name: 'Brude', Rarity: 'Common', Desc: 'mander', Image: 'Brude.jpg' },
  { Name: 'Bunger', Rarity: 'Common', Desc: 'Bunger goes Bunger', Image: 'Bunger.webp' },
  { Name: 'Chaewon', Rarity: 'Korean', Desc: 'Dlyan loves gooning', Image: 'Chaewon.jpg' },
  { Name: 'Daniel', Rarity: 'Rare', Desc: 'UwU', Image: 'Daniel.png' },
  { Name: 'Drake', Rarity: 'Rare', Desc: 'UwU', Image: 'Drake.jpg' },
  { Name: 'EDP', Rarity: 'Common', Desc: 'I want some cupcakes', Image: 'EDP.gif' },
  { Name: 'Einstein', Rarity: 'Legendary', Desc: 'Erm actually', Image: 'Einstein.webp' },
  { Name: 'Elon', Rarity: 'Common', Desc: 'I love daddy Trump', Image: 'Elon.webp' },
  { Name: 'GoJong', Rarity: 'Korean', Desc: 'Back in my day', Image: 'GoJong.jpg' },
  { Name: 'Greg', Rarity: 'Common', Desc: 'Im taking a massive dump', Image: 'Greg.jpg' },
  { Name: 'Hanni', Rarity: 'Korean', Desc: 'Dlyan loves gooning', Image: 'Hanni.jpg' },
  { Name: 'Jason', Rarity: 'Rare', Desc: 'FBoy in the making', Image: 'jason.jpg' },
  { Name: 'Jay Park', Rarity: 'Korean', Desc: 'I love a women', Image: 'Jay Park.webp' },
  { Name: 'Jeff', Rarity: 'Legendary', Desc: 'My name is jeff', Image: 'Jeff.jpg' },
  { Name: 'Jennie', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Jennie.jpg' },
  { Name: 'JoYuri', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'JoYuri.jpg' },
  { Name: 'Julie', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Julie.jpg' },
  { Name: 'Jungkook', Rarity: 'Korean', Desc: 'Standing next to you', Image: 'Jungkook.jpg' },
  { Name: 'Kanye', Rarity: 'Legendary', Desc: 'I love my cousin', Image: 'Kanye.jpg' },
  { Name: 'Keshi', Rarity: 'Common', Desc: 'Socal Asian moment', Image: 'Keshi.jpg' },
  { Name: 'Kim Jong Un', Rarity: 'Korean', Desc: 'Top three Korea right here', Image: 'KimJongUn.jpg' },
  { Name: 'LEBRON JAMES', Rarity: 'Lebron James', Desc: 'Dylan loves gooning', Image: 'Lebron.jpg' },
  { Name: 'Big Mac', Rarity: 'Common', Desc: 'Big back big back', Image: 'Mac.jpg' },
  { Name: 'McConner', Rarity: 'Common', Desc: 'Wsg gang', Image: 'McConner.jpg' },
  { Name: 'Minji', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Minji.jpg' },
  { Name: 'NingNing', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'NingNing.jpg' },
  { Name: 'Salmon', Rarity: 'Common', Desc: 'Im a fish', Image: 'Salmon.jpg' },
  { Name: 'Sung', Rarity: 'Korean', Desc: 'Arise', Image: 'Sung.jpg' },
  { Name: 'Vanilla', Rarity: 'Legendary', Desc: 'Dylan loves gooning', Image: 'Vanilla.webp' },
  { Name: 'Winter', Rarity: 'Korean', Desc: 'Dylan loves gooning', Image: 'Winter.webp' },
]

function getRandomRarity() {
  const roll = Math.random() * 100
  let total = 0
  for (const [rarity, rate] of Object.entries(rarityRates)) {
    total += rate
    if (roll <= total) return rarity
  }
  return 'Common'
}

function pullOneCharacter() {
  const rarity = getRandomRarity()
  const pool = gachaPool.filter((c) => c.Rarity === rarity)
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
}

function startCooldown() {
  isCooldown.value = true
  setTimeout(() => {
    isCooldown.value = false
  }, COOLDOWN_MS)
}

function singlePull() {
  if (isCooldown.value) return
  const pull = pullOneCharacter()
  results.value = pull ? [pull] : []
  startCooldown()
}

function tenPull() {
  if (isCooldown.value) return
  const pulls = []
  for (let i = 0; i < 10; i++) {
    const p = pullOneCharacter()
    if (p) pulls.push(p)
  }
  results.value = pulls
  startCooldown()
}

function rarityClass(rarity) {
  switch (rarity) {
    case 'Lebron James': return 'border-lebron'
    case 'Korean': return 'border-korean'
    case 'Legendary': return 'border-legendary'
    case 'Rare': return 'border-rare'
    case 'Gooner': return 'border-gooner'
    default: return 'border-common'
  }
}

function getStars(rarity) {
  switch (rarity) {
    case 'Lebron James': return 6
    case 'Legendary': return 5
    case 'Rare': return 4
    case 'Gooner': return 3
    case 'Korean': return 2
    default: return 1
  }
}

onMounted(() => {
  gsap.from('.rarity-tab', {
    x: -50,
    opacity: 0,
    duration: 1,
    ease: 'power2.out'
  })

  gsap.from('.title', {
    scale: 0.8,
    opacity: 0,
    duration: 0.8,
    delay: 0.5,
    ease: 'back.out(1.7)'
  })
})

watch(results, async () => {
  await nextTick()
  gsap.from('.card', {
    duration: 0.6,
    opacity: 0,
    y: 50,
    stagger: 0.1,
    ease: 'power3.out'
  })
})
</script>

<style scoped>
/* Keep your existing styles */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transition: opacity 0.3s;
}
</style>

<style scoped>
.main-layout {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.rarity-tab {
  background: #f3f4f6;
  border-radius: 1rem;
  padding: 1rem;
  width: 220px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rarity-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.rarity-tab ul {
  list-style: none;
  padding: 0;
}

.rarity-tab li {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0.6rem;
  margin-bottom: 0.4rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
}

.container {
  flex-grow: 1;
  max-width: 1000px;
  margin: 0 auto;
}

.title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

button {
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.button-single {
  background-color: #3b82f6;
  color: white;
}

.button-ten {
  background-color: #10b981;
  color: white;
}

.button-single:hover {
  background-color: #2563eb;
}

.button-ten:hover {
  background-color: #059669;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.card {
  background-color: white;
  padding: 1rem;
  border: 4px solid transparent;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.character-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
}

.character-name {
  font-weight: bold;
  font-size: 1.2rem;
}

.rarity-stars {
  color: gold;
  margin: 0.3rem 0;
}

.character-desc {
  font-size: 0.9rem;
  color: #4b5563;
}

/* Rarity Border Styles */
.border-common {
  border-color: #d1d5db;
}

.border-rare {
  border-color: #3b82f6;
}

.border-legendary {
  border-color: #f59e0b;
}

.border-korean {
  border-color: #a855f7;
}

.border-gooner {
  border-color: #ec4899;
}

.border-lebron {
  border-color: #ef4444;
}

/* Tab rarity backgrounds */
.rarity-tab .border-common {
  background-color: #f9fafb;
}

.rarity-tab .border-rare {
  background-color: #dbeafe;
}

.rarity-tab .border-legendary {
  background-color: #fef3c7;
}

.rarity-tab .border-korean {
  background-color: #ede9fe;
}

.rarity-tab .border-gooner {
  background-color: #fce7f3;
}

.rarity-tab .border-lebron {
  background-color: #fee2e2;
}
</style>