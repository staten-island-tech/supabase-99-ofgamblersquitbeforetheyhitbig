<template>
  <div class="minesweeper p-4 space-y-4 relative">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Minesweeper</h2>
      <select v-model="selectedDifficulty" @change="resetGame" class="border px-2 py-1 rounded">
        <option value="easy">Easy (8x8, 10 mines)</option>
        <option value="medium">Medium (10x10, 15 mines)</option>
        <option value="hard">Hard (14x14, 25 mines)</option>
      </select>
    </div>
    <div class="text-center">
      <button
        @click="giveMeCoins"
        class="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow"
      >
        💰 Give Me Coins
      </button>
    </div>
    <div class="grid" :style="{ gridTemplateColumns: 'repeat(' + cols + ', 30px)' }">
      <div
        v-for="(cell, index) in grid"
        :key="index"
        @click="handleFirstClick(cell)"
        @contextmenu.prevent="toggleFlag(cell)"
        :class="[
          'cell',
          {
            'bg-gray-300': !cell.revealed,
            'bg-white': cell.revealed && !cell.mine,
            'bg-red-400': cell.revealed && cell.mine,
            'text-blue-700': cell.revealed && cell.adjacentMines === 1,
            'text-green-700': cell.revealed && cell.adjacentMines === 2,
            'text-red-700': cell.revealed && cell.adjacentMines >= 3,
          },
        ]"
      >
        <span v-if="cell.flagged && !cell.revealed">🚩</span>
        <span v-else-if="cell.revealed">
          {{ cell.mine ? '💣' : cell.adjacentMines || '' }}
        </span>
      </div>
    </div>

    <!-- Overlay for win or lose -->
    <transition name="overlay-fade">
      <div
        v-if="gameOver || gameWon"
        class="overlay absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-20"
      >
        <div class="overlay-bg absolute inset-0"></div>
        <div
          class="overlay-content relative z-30 flex flex-col items-center p-8 rounded-2xl shadow-2xl backdrop-blur-lg"
        >
          <div
            v-if="gameOver"
            class="end-message game-over"
          >
            💥 Game Over!
          </div>
          <div
            v-if="gameWon"
            class="end-message game-won"
          >
            🎉 You Won!
          </div>
          <button
            @click="resetGame"
            class="mt-6 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-xl hover:scale-105 transition-transform"
          >
            Play Again
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const auth = useAuthStore()

const difficulties = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 10, cols: 10, mines: 15 },
  hard: { rows: 14, cols: 14, mines: 25 },
}

const selectedDifficulty = ref('medium')
const grid = reactive([])
const gameOver = ref(false)
const gameWon = ref(false)
const firstClickMade = ref(false)

const rows = computed(() => difficulties[selectedDifficulty.value].rows)
const cols = computed(() => difficulties[selectedDifficulty.value].cols)
const mineCount = computed(() => difficulties[selectedDifficulty.value].mines)

function resetGame() {
  grid.length = 0
  gameOver.value = false
  gameWon.value = false
  firstClickMade.value = false

  for (let i = 0; i < rows.value * cols.value; i++) {
    grid.push({
      revealed: false,
      flagged: false,
      mine: false,
      adjacentMines: 0,
      x: i % cols.value,
      y: Math.floor(i / cols.value),
    })
  }
}

function handleFirstClick(cell) {
  if (gameOver.value || gameWon.value || cell.revealed || cell.flagged) return

  if (!firstClickMade.value) {
    generateMines(cell)
    calculateAdjacentMines()
    firstClickMade.value = true
  }

  revealCell(cell)
}

function generateMines(safeCell) {
  let minesPlaced = 0
  const safeZone = new Set(
    getNeighbors(safeCell)
      .concat(safeCell)
      .map((c) => c.y * cols.value + c.x),
  )

  while (minesPlaced < mineCount.value) {
    const index = Math.floor(Math.random() * grid.length)
    if (!grid[index].mine && !safeZone.has(index)) {
      grid[index].mine = true
      minesPlaced++
    }
  }
}

function calculateAdjacentMines() {
  for (const cell of grid) {
    if (cell.mine) continue
    const neighbors = getNeighbors(cell)
    cell.adjacentMines = neighbors.filter((n) => n.mine).length
  }
}

function getNeighbors(cell) {
  const neighbors = []
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const x = cell.x + dx
      const y = cell.y + dy
      if (x >= 0 && x < cols.value && y >= 0 && y < rows.value) {
        neighbors.push(grid[y * cols.value + x])
      }
    }
  }
  return neighbors
}

function revealCell(cell) {
  if (cell.revealed || cell.flagged || gameOver.value || gameWon.value) return

  cell.revealed = true

  if (cell.mine) {
    gameOver.value = true
    revealAll()
    return
  }

  if (cell.adjacentMines === 0) {
    getNeighbors(cell).forEach(revealCell)
  }

  checkWinCondition()
}

function revealAll() {
  grid.forEach((cell) => (cell.revealed = true))
}

function toggleFlag(cell) {
  if (cell.revealed || gameOver.value || gameWon.value) return
  cell.flagged = !cell.flagged
}

function checkWinCondition() {
  const allSafeCellsRevealed = grid.every((cell) => cell.mine || cell.revealed)

  if (allSafeCellsRevealed) {
    gameWon.value = true
    rewardCoins()
  }
}

const addCoins = async (amount) => {
  if (!auth.user) return

  const currentCoins = auth.user.coins || 0
  const newCoins = currentCoins + amount

  const { error } = await supabase
    .from('users') // Use 'users' if your coins are stored there
    .update({ coins: newCoins })
    .eq('id', auth.user.id)

  if (error) throw new Error(error.message)

  auth.user.coins = newCoins
}

async function rewardCoins() {
  const rewards = {
    easy: 10,
    medium: 50,
    hard: 100,
  }
  const reward = rewards[selectedDifficulty.value] || 0

  try {
    await addCoins(reward)
    console.log(`You earned ${reward} coins! Total: ${auth.user.coins}`)
  } catch (e) {
    console.error('Coin reward failed:', e)
  }
}

async function giveMeCoins() {
  const amount = 1000000 // arbitrary test amount
  try {
    await addCoins(amount)
    console.log(`Gave you ${amount} coins. Total: ${auth.user.coins}`)
  } catch (e) {
    console.error('Failed to give coins:', e)
  }
}

onMounted(() => {
  auth.fetchUser()
  auth.fetchUserData()
  resetGame()
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 4px;
  margin-top: 1rem;
}

.cell {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background-color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.cell:hover {
  background-color: #cbd5e1;
  transform: scale(1.05);
}

.bg-white {
  background-color: #f9fafb !important;
}

.bg-red-400 {
  background-color: #f87171 !important;
  color: white;
}

.text-blue-700 {
  color: #1d4ed8;
}
.text-green-700 {
  color: #15803d;
}
.text-red-700 {
  color: #b91c1c;
}

.cell span {
  font-size: 1rem;
}

.cell.revealed {
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
}

/* Overlay styles */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  min-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
}

.overlay-bg {
  position: absolute;
  inset: 0;
  background: rgba(24, 29, 41, 0.85);
  z-index: 10;
}

.overlay-content {
  z-index: 30;
  padding: 3rem 4rem;
  border-radius: 2rem;
  background: rgba(44, 62, 80, 0.93);
  box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 80px 5px rgba(0,160,255,0.10) inset;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid rgba(255,255,255,0.1);
  animation: overlay-pop 0.4s cubic-bezier(.16,1,.3,1) backwards;
}

@keyframes overlay-pop {
  0% { transform: scale(0.85) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* Improved end message styles */
.end-message {
  font-family: 'Segoe UI', 'Montserrat', 'Arial', sans-serif;
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 1rem 2.5rem;
  margin-bottom: 1rem;
  border-radius: 1rem;
  text-align: center;
  background: rgba(0,0,0,0.45);
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.25), 0 0 10px 2px rgba(255,255,255,0.07) inset;
  text-shadow: 0 3px 16px rgba(0,0,0,0.4), 0 1px 0 #fff;
}

.game-over {
  background: linear-gradient(90deg,rgba(220,38,38,0.74),rgba(30,41,59,0.7));
  color: #fff1f1;
  text-shadow: 0 0 16px #ef4444, 0 0 32px #991b1b, 0 3px 16px rgba(0,0,0,0.5);
}

.game-won {
  background: linear-gradient(90deg,rgba(251,191,36,0.85),rgba(34,197,94,0.7));
  color: #fffbe8;
  text-shadow: 0 0 12px #fde047, 0 0 28px #fbbf24, 0 3px 16px rgba(0,0,0,0.4);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
.overlay-fade-enter-to,
.overlay-fade-leave-from {
  opacity: 1;
}
</style>