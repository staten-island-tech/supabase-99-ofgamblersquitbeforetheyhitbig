<template>
  <div class="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
    <h1 class="text-3xl font-bold mb-6 text-center text-purple-700">🎯 Gacha Pull</h1>

    <div class="flex justify-center gap-4 mb-6">
      <button
        @click="singlePull"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition"
      >
        Single Pull
      </button>
      <button
        @click="tenPull"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
      >
        10 Pull
      </button>
    </div>

    <div v-if="results.length" class="space-y-4">
      <div
        v-for="(item, index) in results"
        :key="index"
        class="flex items-center gap-4 p-4 border rounded-lg shadow-md"
        :class="rarityColor(item.Rarity)"
      >
        <img :src="item.Image" alt="Character" class="w-20 h-20 object-cover rounded-md" />
        <div>
          <p class="text-xl font-semibold">{{ item.Name }} <span class="text-sm">({{ item.Rarity }})</span></p>
          <p class="text-gray-700">{{ item.Desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const results = ref([])

const rarityRates = {
  'Lebron James': 0.1,
  'Korean': 0.9,
  'Legendary': 9,
  'Rare': 15,
  'Gooner': 20,
  'Common': 55
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
  const pool = gachaPool.filter(c => c.Rarity === rarity)
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


function rarityColor(rarity) {
  switch (rarity) {
    case 'Lebron James':
      return 'border-yellow-500 bg-yellow-50'
    case 'Korean':
      return 'border-pink-400 bg-pink-50'
    case 'Legendary':
      return 'border-purple-500 bg-purple-50'
    case 'Rare':
      return 'border-blue-400 bg-blue-50'
    case 'Gooner':
      return 'border-green-400 bg-green-50'
    case 'Common':
    default:
      return 'border-gray-300 bg-gray-50'
  }
}
</script>