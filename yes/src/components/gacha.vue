<template>
  <div style="position: relative; min-height: 100vh;">
    <!-- Main UI: only show if overlay is NOT active -->
    <div v-if="!isDimmed" class="main-bg">
      <div class="main-layout">
        <div class="rarity-toggle-col">
          <button class="rarity-toggle-btn" @click="toggleRarity">
            <span v-if="showRarity">🙈 Hide</span>
            <span v-else>👀 Show</span>
            Rarity Rates
          </button>
          <transition name="rarity-fade">
            <aside class="rarity-tab" v-show="showRarity">
              <h2 class="rarity-title">Rarity Rates</h2>
              <ul>
                <li
                  v-for="(rate, rarity) in rarityRates"
                  :key="rarity"
                  :class="rarityClass(rarity)"
                >
                  <span class="rarity-label">{{ rarity }}</span>
                  <span class="rarity-percent">{{ rate }}%</span>
                </li>
              </ul>
            </aside>
          </transition>
        </div>
        <div class="container">
          <h1 class="title">Dylans Special Goon</h1>
          <p class="coin-count">Coins: {{ coins }}</p>
          <div class="buttons">
            <button
              @click="startOverlayPull('single')"
              :disabled="isCooldown || coins < 10"
              class="button-single"
            >
              Single Pull (10 coins)
            </button>
            <button
              @click="startOverlayPull('ten')"
              :disabled="isCooldown || coins < 100"
              class="button-ten"
            >
              10 Pull (100 coins)
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Overlay: takes up full viewport, only shows when pulling -->
    <div
      v-if="isDimmed"
      class="results-overlay"
      @click="hidePullOverlay"
      tabindex="0"
    >
      <div
        v-if="pullType === 'single' && overlayResults.length === 1"
        class="results-grid overlay-grid overlay-grid-single"
      >
        <div
          class="card overlay-card"
          :class="rarityClass(overlayResults[0].Rarity)"
        >
          <img :src="overlayResults[0].Image" alt="Character" class="character-img" />
          <p class="character-name">{{ overlayResults[0].Name }}</p>
          <p class="rarity-stars">
            <span v-for="n in getStars(overlayResults[0].Rarity)" :key="n">⭐</span>
          </p>
          <p class="character-desc">{{ overlayResults[0].Desc }}</p>
        </div>
      </div>
      <div
        v-else
        class="overlay-ten-grid"
      >
        <div
          v-for="(item, index) in overlayResults"
          :key="index"
          class="card overlay-card"
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
      <p class="overlay-tip">Click anywhere or press <kbd>ESC</kbd> to continue</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const auth = useAuthStore()

// Only for overlay, do NOT show pulls on main page
const overlayResults = ref([])
const isCooldown = ref(false)
const COOLDOWN_MS = 1000
const coins = ref(0)
const showRarity = ref(true)
const isDimmed = ref(false)
const pullType = ref('single') // 'single' or 'ten'

function toggleRarity() {
  showRarity.value = !showRarity.value
}

async function fetchCoins() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('users')
    .select('coins')
    .eq('id', auth.user.id)
    .single()

  if (error) {
    console.error('Error fetching coins:', error)
  } else {
    coins.value = data.coins ?? 0
  }
}

async function addToInventory(cards) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const inventoryEntries = cards.map((card) => ({
    user_id: user.id,
    card_name: card.Name,
    rarity: card.Rarity,
    desc: card.Desc,
    image: card.Image,
  }))

  const { error } = await supabase.from('inventory').insert(inventoryEntries)
  if (error) {
    console.error('Error adding to inventory:', error)
  }
}

onMounted(() => {
  fetchCoins()
  if (showRarity.value) {
    gsap.from('.rarity-tab', {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
    })
  }
  gsap.from('.title', {
    scale: 0.8,
    opacity: 0,
    duration: 0.8,
    delay: 0.5,
    ease: 'back.out(1.7)',
  })
})

watch(showRarity, async (val) => {
  await nextTick()
  const tab = document.querySelector('.rarity-tab')
  if (!tab) return
  if (val) {
    gsap.fromTo(
      tab,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', display: 'block' }
    )
  } else {
    gsap.to(tab, {
      x: -50,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    })
  }
})

async function updateCoinsInDB() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('users')
    .update({ coins: coins.value })
    .eq('id', auth.user.id)

  if (error) {
    console.error('Error updating coins:', error)
  }
}

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

// This is the only entrypoint to pull now
async function startOverlayPull(type) {
  if (isCooldown.value) return
  if (type === 'single' && coins.value < 10) return
  if (type === 'ten' && coins.value < 100) return

  // Do not update any 'results' for main page, only overlayResults
  pullType.value = type
  overlayResults.value = []

  if (type === 'single') {
    coins.value -= 10
    const pull = pullOneCharacter()
    if (pull) overlayResults.value = [pull]
    if (pull) await addToInventory([pull])
  } else {
    coins.value -= 100
    const pulls = []
    for (let i = 0; i < 10; i++) {
      const p = pullOneCharacter()
      if (p) pulls.push(p)
    }
    overlayResults.value = pulls
    if (pulls.length) await addToInventory(pulls)
  }
  await updateCoinsInDB()
  await showPullOverlay()
  startCooldown()
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
    default:
      return 'border-common'
  }
}

function getStars(rarity) {
  switch (rarity) {
    case 'Lebron James':
      return 6
    case 'Legendary':
      return 4
    case 'Korean':
      return 5
    case 'Rare':
      return 3
    default:
      return 1
  }
}

async function showPullOverlay() {
  isDimmed.value = true
  await nextTick()
  gsap.fromTo(
    '.results-overlay',
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: 'power2.out' }
  )
  if (overlayResults.value.length === 1) {
    gsap.from('.overlay-card', {
      duration: 0.7,
      opacity: 0,
      y: 70,
      ease: 'power3.out',
      delay: 0.1,
    })
  } else {
    gsap.from('.overlay-card', {
      duration: 0.7,
      opacity: 0,
      y: 70,
      stagger: {
        amount: 0.6,
        grid: [2, 5],
        ease: "power3.out"
      },
      delay: 0.1,
    })
  }
}

function hidePullOverlay() {
  gsap.to('.results-overlay', {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => {
      isDimmed.value = false
      overlayResults.value = []
    },
  })
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (isDimmed.value && (e.key === 'Escape' || e.key === ' ')) {
      hidePullOverlay()
    }
  })
})
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transition: opacity 0.3s;
}
.main-bg {
  min-height: 100vh;
}
.main-layout {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}
.rarity-toggle-col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 220px;
}
.rarity-toggle-btn {
  margin-bottom: 1rem;
  padding: 0.7rem 1.2rem;
  border-radius: 0.8rem;
  background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%);
  color: #fff;
  font-weight: bold;
  font-size: 1.08rem;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(99,102,241,0.07);
  letter-spacing: 0.02em;
  transition: background 0.18s, transform 0.13s, box-shadow 0.18s;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.rarity-toggle-btn:hover, .rarity-toggle-btn:focus {
  background: linear-gradient(90deg, #4f46e5 60%, #818cf8 100%);
  transform: translateY(-2px) scale(1.045);
  box-shadow: 0 4px 16px rgba(99,102,241,0.14);
}
.rarity-tab {
  background: #f3f4f6;
  border-radius: 1rem;
  padding: 1rem;
  width: 100%;
  min-width: 220px;
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
  margin: 0;
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
.rarity-fade-enter-active,
.rarity-fade-leave-active {
  transition: opacity 0.35s;
}
.rarity-fade-enter-from,
.rarity-fade-leave-to {
  opacity: 0;
}
.container {
  flex-grow: 1;
  max-width: 1000px;
  margin: 0 auto;
}
.title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
}
.coin-count {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #374151;
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
.results-single {
  display: flex !important;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
}
.card {
  display: flex;
  flex-direction: column;
  width: 10rem;
  height: 20rem;
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
.border-lebron {
  border-color: #ef4444;
}
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
.results-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(30, 41, 59, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadein 0.5s;
  cursor: pointer;
}
@keyframes fadein {
  from { opacity: 0 }
  to { opacity: 1 }
}
.overlay-grid.overlay-grid-single {
  display: flex !important;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.overlay-ten-grid {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 2.5vw 2.5vw;
  align-items: center;
  justify-items: center;
  padding: 5vh 5vw 2vh 5vw;
  box-sizing: border-box;
}
.overlay-card {
  box-shadow: 0 0 32px 2px #fff4, 0 8px 32px rgba(0,0,0,0.29);
  border-width: 5px;
  transform: scale(1.06);
  width: min(15vw, 220px);
  height: min(33vh, 350px);
  background: white;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.overlay-tip {
  margin-top: 2rem;
  color: #fff;
  font-size: 1.1rem;
  text-shadow: 0 1px 6px #000a;
  font-weight: bold;
  z-index: 2;
}
.results-overlay:focus {
  outline: none;
}


</style>