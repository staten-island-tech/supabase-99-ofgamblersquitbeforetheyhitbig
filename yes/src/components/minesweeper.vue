<template>
  <div class="minesweeper p-8 space-y-8 relative max-w-fit mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold">Minesweeper</h2>
      <select v-model="selectedDifficulty" @change="resetGame" class="border px-4 py-2 rounded text-lg">
        <option value="easy">Easy (8x8, 10 mines) — {{ rewards.easy }} coins</option>
        <option value="medium">Medium (10x10, 15 mines) — {{ rewards.medium }} coins</option>
        <option value="hard">Hard (14x14, 25 mines) — {{ rewards.hard }} coins</option>
      </select>
    </div>
    <div class="text-center">
      <button
        @click="giveMeCoins"
        class="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded shadow text-lg"
      >
        💰 Give Me Coins
      </button>
    </div>
    <div class="flex justify-center">
      <div
        ref="gridEl"
        class="grid relative"
        :style="{
          gridTemplateColumns: 'repeat(' + cols + ', 42px)',
          gridAutoRows: '42px',
        }"
      >
        <div
          v-for="(cell, index) in grid"
          :key="index"
          @click="openDropdown(cell, $event)"
          :class="[
            'cell',
            {
              'bg-gray-300': !cell.revealed,
              'bg-white': cell.revealed && !cell.mine,
              'bg-red-400': cell.revealed && cell.mine,
              'text-blue-700': cell.revealed && cell.adjacentMines === 1,
              'text-green-700': cell.revealed && cell.adjacentMines === 2,
              'text-red-700': cell.revealed && cell.adjacentMines >= 3,
              'cell-action-target': dropdown.cell === cell && dropdown.visible,
            },
          ]"
        >
          <span v-if="cell.flagged && !cell.revealed" style="font-size: 1.4rem">🚩</span>
          <span v-else-if="cell.revealed" style="font-size: 1.4rem">
            {{ cell.mine ? '💣' : cell.adjacentMines || '' }}
          </span>
        </div>
        <!-- Dropdown menu absolutely positioned over the grid -->
        <div
          v-if="dropdown.visible && dropdown.position"
          class="cell-dropdown z-50"
          :style="{
            top: dropdown.position.top + 'px',
            left: dropdown.position.left + 'px',
            minWidth: '170px',
            padding: '14px 10px 7px 10px',
          }"
          @click.stop
        >
          <button
            class="dropdown-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-lg w-full mb-2"
            @click="doRevealCell(dropdown.cell); closeDropdown()"
            :disabled="dropdown.cell?.revealed"
          >
            Reveal
          </button>
          <button
            class="dropdown-btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg text-lg w-full mb-2"
            @click="toggleFlag(dropdown.cell); closeDropdown()"
            :disabled="dropdown.cell?.revealed"
          >
            {{ dropdown.cell?.flagged ? 'Unflag' : 'Flag' }}
          </button>
          <button
            class="dropdown-btn text-gray-600 underline text-base w-full"
            @click="closeDropdown"
          >
            Cancel
          </button>
        </div>
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
          class="overlay-content relative z-30 flex flex-col items-center p-12 rounded-3xl shadow-2xl backdrop-blur-lg"
        >
          <div v-if="gameOver" class="end-message game-over">
            💥 Game Over!
          </div>
          <div v-if="gameWon" class="end-message game-won">
            🎉 You Won!
            <div class="won-coins mt-5 text-3xl font-bold text-yellow-300">
              +{{ coinsRewarded }} coins
            </div>
          </div>
          <button
            @click="resetGame"
            class="mt-8 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold shadow-xl hover:scale-105 transition-transform"
          >
            Play Again
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const auth = useAuthStore()

const difficulties = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 10, cols: 10, mines: 15 },
  hard: { rows: 14, cols: 14, mines: 25 },
}

const rewards = {
  easy: 10,
  medium: 50,
  hard: 100,
}

const selectedDifficulty = ref('medium')
const grid = reactive([])
const gameOver = ref(false)
const gameWon = ref(false)
const firstClickMade = ref(false)
const coinsRewarded = ref(0)

const gridEl = ref(null)
const dropdown = reactive({
  visible: false,
  cell: null,
  position: null,
})

const rows = computed(() => difficulties[selectedDifficulty.value].rows)
const cols = computed(() => difficulties[selectedDifficulty.value].cols)
const mineCount = computed(() => difficulties[selectedDifficulty.value].mines)

// Make rewards available in template
// (already defined above, so no changes needed in <script setup>)

function resetGame() {
  grid.length = 0
  gameOver.value = false
  gameWon.value = false
  firstClickMade.value = false
  coinsRewarded.value = 0
  closeDropdown()

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

function doRevealCell(cell) {
  if (gameOver.value || gameWon.value || cell.revealed || cell.flagged) return

  if (!firstClickMade.value) {
    generateMines(cell)
    calculateAdjacentMines()
    firstClickMade.value = true
  }

  revealCell(cell)
}

function openDropdown(cell, event) {
  if (cell.revealed || gameOver.value || gameWon.value) return
  dropdown.cell = cell
  dropdown.visible = false
  nextTick(() => {
    const gridNode = gridEl.value
    if (!gridNode) return
    const cells = Array.from(gridNode.children)
    const idx = grid.indexOf(cell)
    const cellNode = cells[idx]
    if (cellNode) {
      const gridRect = gridNode.getBoundingClientRect()
      const cellRect = cellNode.getBoundingClientRect()
      // Position below and centered horizontally by default
      let top = cellRect.top - gridRect.top + cellRect.height + 2
      let left = cellRect.left - gridRect.left + cellRect.width / 2 - 85
      // Adjust if dropdown would overflow grid
      const dropdownWidth = 170
      if (left + dropdownWidth > gridRect.width) {
        left = gridRect.width - dropdownWidth - 8
      }
      if (left < 0) left = 8
      // If too far down, show above the cell
      const dropdownHeight = 130
      if (top + dropdownHeight > gridRect.height) {
        top = cellRect.top - gridRect.top - dropdownHeight - 2
      }
      dropdown.position = { left, top }
      dropdown.visible = true
    }
  })
}

function closeDropdown() {
  dropdown.visible = false
  dropdown.cell = null
  dropdown.position = null
}

function generateMines(safeCell) {
  let minesPlaced = 0
  const safeZone = new Set(
    getNeighbors(safeCell)
      .concat(safeCell)
      .map((c) => c.y * cols.value + c.x)
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

// Supabase coin logic
const addCoins = async (amount) => {
  if (!auth.user) return
  const currentCoins = auth.user.coins || 0
  const newCoins = currentCoins + amount

  const { error } = await supabase
    .from('users')
    .update({ coins: newCoins })
    .eq('id', auth.user.id)

  if (error) throw new Error(error.message)

  auth.user.coins = newCoins
}

async function rewardCoins() {
  const reward = rewards[selectedDifficulty.value] || 0
  coinsRewarded.value = reward // Display in overlay
  try {
    await addCoins(reward)
    // Optionally, show a toast or similar
    console.log(`You earned ${reward} coins! Total: ${auth.user.coins}`)
  } catch (e) {
    console.error('Coin reward failed:', e)
  }
}

async function giveMeCoins() {
  const amount = 1000000 // test amount
  try {
    await addCoins(amount)
    console.log(`Gave you ${amount} coins. Total: ${auth.user.coins}`)
  } catch (e) {
    console.error('Failed to give coins:', e)
  }
}

onMounted(() => {
  auth.fetchUser && auth.fetchUser()
  auth.fetchUserData && auth.fetchUserData()
  resetGame()
})

// Hide dropdown on any click outside the grid
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!gridEl.value?.contains(e.target)) {
      closeDropdown()
    }
  })
}
</script>

<style scoped>
.minesweeper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.grid {
  display: grid;
  gap: 8px;
  margin-top: 2rem;
  position: relative;
}
.cell {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background-color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.2s,
    transform 0.1s;
  position: relative;
  z-index: 1;
}
.cell-action-target {
  outline: 3px solid #fbbf24;
  box-shadow: 0 0 0 3px #fde68a;
  z-index: 3;
}

.cell:hover {
  background-color: #cbd5e1;
  transform: scale(1.07);
}
.bg-white {
  background-color: #f9fafb ;
}
.bg-red-400 {
  background-color: #f87171 ;
  color: white;
}
.text-blue-700 { color: #1d4ed8; }
.text-green-700 { color: #15803d; }
.text-red-700 { color: #b91c1c; }
.cell span { font-size: 1.4rem; }
.cell.revealed { box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.15); }
/* Dropdown styles */
.cell-dropdown {
  position: absolute;
  min-width: 170px;
  background: #fff;
  border-radius: 14px;
  padding: 14px 10px 7px 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 100;
}
.dropdown-btn {
  margin: 0;
  font-size: 1.1rem;
  border: none;
  outline: none;
  transition: background 0.13s;
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
  padding: 4rem 5rem;
  border-radius: 2.5rem;
  background: rgba(44, 62, 80, 0.93);
  box-shadow: 0 12px 40px rgba(0,0,0,0.36), 0 0 120px 10px rgba(0,160,255,0.12) inset;
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
.end-message {
  font-family: 'Segoe UI', 'Montserrat', 'Arial', sans-serif;
  font-size: 3.8rem;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 1.3rem 3rem;
  margin-bottom: 2rem;
  border-radius: 1.5rem;
  text-align: center;
  background: rgba(0,0,0,0.45);
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.25), 0 0 10px 2px rgba(255,255,255,0.07) inset;
  text-shadow: 0 3px 16px rgba(0,0,0,0.4), 0 1px 0 #fff;
}
.won-coins {
  text-shadow: 0 0 20px #fbbf24, 0 0 10px #fde047;
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
@media (max-width: 600px) {
  .minesweeper {
    padding: 0.3rem ;
  }
  .grid {
    gap: 2px ;
    margin-top: 0.4rem ;
  }
  .cell {
    width: 36px ;
    height: 36px ;
    font-size: 0.82rem ;
    border-radius: 5px ;
  }
  .cell span {
    font-size: 1.0rem ;
  }
  .cell-dropdown {
    min-width: 80px ;
    padding: 4px 2px 2px 2px ;
    border-radius: 5px ;
  }
  .dropdown-btn {
    font-size: 0.88rem ;
    min-height: 26px ;
    padding: 0.1rem 0.2rem ;
  }
  .overlay-content {
    padding: 0.8rem 0.5rem ;
    border-radius: 0.8rem ;
  }
  .end-message {
    font-size: 1.2rem ;
    padding: 0.2rem 0.5rem ;
    margin-bottom: 0.5rem ;
    border-radius: 0.5rem ;
  }
  .won-coins {
    font-size: 1.3rem ;
    margin-top: 1rem ;
  }
}

</style>