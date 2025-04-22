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

  if (random < dropRate["Lebron James"]) {
    rarity = "Lebron James";
  } else if (random < dropRate["Lebron James"] + dropRate["Godly"]) {
    rarity = "Godly";
  } else if (random < dropRate["Lebron James"] + dropRate["Godly"] + dropRate["Korean"]) {
    rarity = "Korean";
  } else {
    rarity = "2-Star";
  }
  const items = gachaPool.filter(item => item.rarity === rarity);
  const result = items[Math.floor(Math.random() * items.length)];

}
</script>

<style scoped>

</style>