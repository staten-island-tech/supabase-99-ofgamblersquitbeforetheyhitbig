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
        <button @click="singlePull" class="button-single">Single Pull</button>
        <button @click="tenPull" class="button-ten">10 Pull</button>
      </div>

      <div
        v-if="results.length"
        class="flex flex-cols-2 sm:flex-cols-3 md:flex-cols-5 gap-4 w-full"
      >
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
import { ref } from 'vue'

const results = ref([])

const rarityRates = {
  'Lebron James': 0.01,
  Korean: 0.1,
  Legendary: 1,
  Rare: 25,
  Common: 73.89,
}

const gachaPool = [
  {
    Name: 'Barney',
    Rarity: 'Rare',
    Desc: 'Barney is a dinosaur that haunts your imagination',
    Image: 'Barney.webp',
  },
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
  {
    Name: 'Kim Jong Un',
    Rarity: 'Korean',
    Desc: 'Top three Korea right here',
    Image: 'KimJongUn.jpg',
  },
  {
    Name: 'LEBRON JAMES',
    Rarity: 'Lebron James',
    Desc: 'Dylan loves gooning',
    Image: 'Lebron.jpg',
  },
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

function singlePull() {
  const pull = pullOneCharacter()
  results.value = pull ? [pull] : []
}

function tenPull() {
  const pulls = []
  for (let i = 0; i < 10; i++) {
    const p = pullOneCharacter()
    if (p) pulls.push(p)
  }
  results.value = pulls
}

function rarityClass(rarity) {
  switch (rarity) {
    case 'Lebron James':
      return 'border-lebron'
    case 'Korean':
      return 'border-korean'
    case 'Legendary':
      return 'border-legendary'
    case 'Rare':
      return 'border-rare'
    case 'Gooner':
      return 'border-gooner'
    default:
      return 'border-common'
  }
}

function getStars(rarity) {
  switch (rarity) {
    case 'Lebron James':
      return 6
    case 'Legendary':
      return 5
    case 'Rare':
      return 4
    case 'Gooner':
      return 3
    case 'Korean':
      return 2
    default:
      return 1
  }
}
</script>

<style scoped>
.container {
  padding: 1.5rem;
  max-width: 48rem;
  margin: auto;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #7e22ce;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.button-single,
.button-ten {
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  color: white;
  transition: background-color 0.2s ease;
}

.button-single {
  background-color: #3b82f6;
}

.button-single:hover {
  background-color: #2563eb;
}

.button-ten {
  background-color: #22c55e;
}

.button-ten:hover {
  background-color: #16a34a;
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  border: 3px solid transparent;
  border-radius: 1rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  background: linear-gradient(to bottom right, #ffffff, #f3f4f6);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
}

.card:hover {
  transform: scale(1.03);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
}

.character-img {
  width: 6rem;
  height: 6rem;
  object-fit: cover;
  border-radius: 9999px;
  border: 3px solid white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.character-desc {
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.25rem;
}

.rarity-stars {
  margin-top: 0.25rem;
  color: gold;
  font-size: 1.25rem;
}

.border-lebron {
  border-image: linear-gradient(45deg, gold, orange) 1;
  background: radial-gradient(circle at center, #fffbe6, #ffe8b3);
}

.border-korean {
  border-image: linear-gradient(45deg, #ec4899, #f472b6) 1;
  background: radial-gradient(circle at center, #fdf2f8, #fce7f3);
}

.border-legendary {
  border-image: linear-gradient(45deg, #9333ea, #c084fc) 1;
  background: radial-gradient(circle at center, #f3e8ff, #ede9fe);
}

.border-rare {
  border-image: linear-gradient(45deg, #3b82f6, #93c5fd) 1;
  background: radial-gradient(circle at center, #eff6ff, #dbeafe);
}

.border-gooner {
  border-image: linear-gradient(45deg, #10b981, #6ee7b7) 1;
  background: radial-gradient(circle at center, #ecfdf5, #d1fae5);
}

.border-common {
  border-image: linear-gradient(45deg, #9ca3af, #d1d5db) 1;
  background: radial-gradient(circle at center, #f3f4f6, #e5e7eb);
}

.main-layout {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.rarity-tab {
  min-width: 200px;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  height: fit-content;
}

.rarity-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #374151;
  text-align: center;
}

.rarity-tab ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rarity-tab li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.95rem;
  background: #e5e7eb;
  transition: transform 0.2s;
}

.rarity-tab li:hover {
  transform: translateX(5px);
}

.rarity-label {
  flex-grow: 1;
}

.rarity-percent {
  font-weight: 600;
  color: #6b7280;
}
</style>
