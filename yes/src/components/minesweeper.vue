<template>
    <div class="minesweeper p-4">
      <h2 class="text-xl font-semibold mb-2">Minesweeper</h2>
      <div
        class="grid"
        :style="`grid-template-columns: repeat(${cols}, 30px);`"
      >
        <div
          v-for="(cell, index) in grid"
          :key="index"
          @click="revealCell(cell)"
          @contextmenu.prevent="toggleFlag(cell)"
          class="w-8 h-8 border text-center flex items-center justify-center text-sm font-bold cursor-pointer"
          :class="{
            'bg-gray-300': !cell.revealed,
            'bg-white': cell.revealed,
            'bg-red-400': cell.revealed && cell.mine,
            'text-blue-700': cell.adjacentMines === 1,
            'text-green-700': cell.adjacentMines === 2,
            'text-red-700': cell.adjacentMines >= 3,
          }"
        >
          <span v-if="cell.flagged && !cell.revealed">🚩</span>
          <span v-else-if="cell.revealed">
            {{ cell.mine ? "💣" : cell.adjacentMines || '' }}
          </span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, onMounted } from 'vue'
  
  const rows = 10
  const cols = 10
  const mineCount = 15
  const grid = reactive([])
  
  function initGrid() {
    grid.length = 0
    for (let i = 0; i < rows * cols; i++) {
      grid.push({
        revealed: false,
        flagged: false,
        mine: false,
        adjacentMines: 0,
        x: i % cols,
        y: Math.floor(i / cols),
      })
    }
  
    let minesPlaced = 0
    while (minesPlaced < mineCount) {
      const index = Math.floor(Math.random() * grid.length)
      if (!grid[index].mine) {
        grid[index].mine = true
        minesPlaced++
      }
    }
  
    for (const cell of grid) {
      if (cell.mine) continue
      const neighbors = getNeighbors(cell)
      cell.adjacentMines = neighbors.filter(n => n.mine).length
    }
  }
  
  function getNeighbors(cell) {
    const neighbors = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue
        const x = cell.x + dx
        const y = cell.y + dy
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          neighbors.push(grid[y * cols + x])
        }
      }
    }
    return neighbors
  }
  
  function revealCell(cell) {
    if (cell.revealed || cell.flagged) return
    cell.revealed = true
  
    if (cell.mine) {
      alert('Game Over!')
      revealAll()
      return
    }
  
    if (cell.adjacentMines === 0) {
      getNeighbors(cell).forEach(revealCell)
    }
  }
  
  function revealAll() {
    grid.forEach(cell => (cell.revealed = true))
  }
  
  function toggleFlag(cell) {
    if (cell.revealed) return
    cell.flagged = !cell.flagged
  }
  
  onMounted(() => {
    initGrid()
  })
  </script>
  
  <style scoped>
  .grid {
    display: grid;
    gap: 2px;
  }
  </style>