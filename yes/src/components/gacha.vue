<template>
    <div>

    </div>
</template>

<script setup>

const gachaPool = [
    
]


function pull() {
  const random = Math.random();
  let rarity;

  if (random < dropRate["6-Star"]) {
    rarity = "6-Star";
  } else if (random < dropRate["6-Star"] + dropRate["5-Star"]) {
    rarity = "5-Star";
  } else if (random < dropRate["6-Star"] + dropRate["5-Star"] + dropRate["4-Star"]) {
    rarity = "4-Star";
  } else {
    rarity = "2-Star";
  }
  const items = gachaPool.filter(item => item.rarity === rarity);
  const result = items[Math.floor(Math.random() * items.length)];

}
</script>

<style scoped>

</style>