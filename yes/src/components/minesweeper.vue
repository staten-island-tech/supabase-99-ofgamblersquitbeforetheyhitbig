<template>
  <div class="minesweeper p-4 space-y-4">
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

    <div v-if="gameOver || gameWon" class="mt-4 text-center">
      <p v-if="gameOver" class="text-lg font-semibold text-red-600 mb-2">💥 Game Over!</p>
      <p v-if="gameWon" class="text-lg font-semibold text-green-600 mb-2">🎉 You Won!</p>
      <button @click="resetGame" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Restart Game
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
async function giveMeCoins() {
  const amount = 100 // change this if you want a different amount

  try {
    await auth.addCoins(amount)
    console.log(`Gave you ${amount} coins. Total: ${auth.user.coins}`)
  } catch (e) {
    console.error('Failed to give coins:', e)
  }
}

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
  const allSafeCellsRevealed = grid.every((cell) => {
    return cell.mine || cell.revealed
  })

  if (allSafeCellsRevealed) {
    gameWon.value = true
    rewardCoins()
  }
}

async function rewardCoins() {
  const rewards = {
    easy: 10,
    medium: 25,
    hard: 50,
  }

  const reward = rewards[selectedDifficulty.value] || 0

  try {
    await auth.addCoins(reward)
    console.log(`You earned ${reward} coins! Total: ${auth.user.coins}`)
  } catch (e) {
    console.error('Coin reward failed:', e)
  }
}

onMounted(() => {
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
</style>
