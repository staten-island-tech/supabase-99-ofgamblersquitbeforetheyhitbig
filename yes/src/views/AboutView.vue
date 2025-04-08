<script setup lang="ts">
import Profile from '@/components/Profile.vue'
</script>

<template>
  <div class="about">
    <Profile />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
