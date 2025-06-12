<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await auth.signOut()
  router.push('/')
}

const profileData = ref({
  username: '',
  email: '',
  image: '',
})

const inventory = ref([])

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

const focusedImage = ref(null)
const showModal = ref(false)
function openImage(src) {
  focusedImage.value = src
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  focusedImage.value = null
}

onMounted(async () => {
  if (!auth.user) await auth.fetchUser()

  // Get profile info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('username, ImageURL')
    .eq('id', auth.user.id)
    .single()

  if (!userError) {
    profileData.value = {
      email: auth.user.email,
      username: userData.username,
      image: userData.ImageURL,
    }
  }

  // Get user's cards directly from your table
  const { data: cardData, error: cardError } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', auth.user.id)

  if (!cardError) {
    const grouped = {}

    cardData.forEach((card) => {
      const key = card.card_name
      if (!grouped[key]) {
        grouped[key] = { ...card, count: 1 }
      } else {
        grouped[key].count++
      }
    })

    inventory.value = Object.values(grouped)
  }
})
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-avatar-wrap">
        <img
          v-if="profileData.image"
          :src="profileData.image"
          alt="Profile image"
          class="profile-img"
        />
        <div v-else class="profile-placeholder">
          <span>{{ profileData.username ? profileData.username[0].toUpperCase() : '?' }}</span>
        </div>
      </div>
      <div class="profile-info">
        <h1 class="profile-title">User Profile</h1>
        <p class="profile-username">@{{ profileData.username }}</p>
        <p class="profile-email">{{ profileData.email }}</p>
        <button v-if="auth.user" @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>

    <div class="inventory-container" v-if="inventory.length">
      <h2 class="cards-heading">Your Cards</h2>
      <div class="card-grid">
        <div
          class="card-item"
          v-for="card in inventory"
          :key="card.card_name"
          :class="rarityClass(card.rarity)"
        >
          <div class="card-content">
            <div class="card-img-wrapper" @click="openImage(card.image)">
              <img :src="card.image" :alt="card.card_name" class="card-img" />
              <div class="view-full-photo">🔍</div>
            </div>
            <div class="card-overlay" v-if="card.count > 1">x{{ card.count }}</div>
            <div class="card-meta">
              <div class="rarity-row">
                <span class="rarity-border" :class="rarityClass(card.rarity)">
                  {{ card.rarity }}
                </span>
              </div>
              <span class="card-stars">
                <span v-for="n in getStars(card.rarity)" :key="n" class="star">⭐</span>
              </span>
            </div>
            <div class="card-name">{{ card.card_name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for full photo view -->
    <transition name="fade">
      <div v-if="showModal" class="modal-backdrop" @click="closeModal">
        <div class="modal-img-container" @click.stop>
          <img :src="focusedImage" alt="Full Card" class="modal-img" />
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Make all font bolded Arial */
.profile-container,
.profile-header,
.profile-avatar-wrap,
.profile-img,
.profile-placeholder,
.profile-info,
.profile-title,
.profile-username,
.profile-email,
.logout-btn,
.cards-heading,
.inventory-container,
.card-grid,
.card-item,
.card-content,
.card-img-wrapper,
.card-img,
.view-full-photo,
.card-overlay,
.card-meta,
.rarity-row,
.rarity-border,
.card-stars,
.star,
.card-name {
  font-family: Arial, sans-serif !important;
  font-weight: bold !important;
}

.profile-container {
  max-width: 50vw;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  background: #fff;
}
@media (max-width: 900px) {
  .profile-container {
    max-width: 90vw;
    padding: 1.2rem;
  }
}
@media (max-width: 600px) {
  .profile-container {
    max-width: 100vw;
    margin: 0.5rem 0 2rem 0;
    border-radius: 0;
    box-shadow: none;
    padding: 0.5rem;
  }
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}
@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
  }
}

.profile-avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 2px 16px #cbd5e1aa;
  border: 3px solid #e0e7ef;
  background: #f3f4f6;
  transition: box-shadow 0.18s;
}
.profile-img:hover {
  box-shadow: 0 6px 22px #2563eb33;
}
@media (max-width: 600px) {
  .profile-img {
    width: 80px;
    height: 80px;
    border-width: 2px;
  }
}
.profile-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ef 60%, #f1f5f9 100%);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  border: 3px solid #e0e7ef;
  box-shadow: 0 2px 16px #cbd5e1aa;
}
@media (max-width: 600px) {
  .profile-placeholder {
    width: 80px;
    height: 80px;
    font-size: 2rem;
    border-width: 2px;
  }
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.3rem;
  flex: 1;
}
@media (max-width: 600px) {
  .profile-info {
    align-items: center;
    width: 100%;
  }
}

.profile-title {
  font-size: 2rem;
  margin: 0 0 0.2em 0;
  color: #2563eb;
  letter-spacing: -1px;
}
@media (max-width: 600px) {
  .profile-title {
    font-size: 1.25rem;
  }
}

.profile-username {
  font-size: 1.13rem;
  color: #334155;
  margin-bottom: 0.05em;
  letter-spacing: 0.01em;
  opacity: 0.88;
}
@media (max-width: 600px) {
  .profile-username {
    font-size: 1rem;
  }
}

.profile-email {
  font-size: 0.97rem;
  color: #64748b;
  margin-bottom: 0.6em;
  letter-spacing: 0.01em;
  opacity: 0.77;
  word-break: break-all;
}
@media (max-width: 600px) {
  .profile-email {
    font-size: 0.88rem;
    margin-bottom: 0.5em;
  }
}

.logout-btn {
  padding: 0.52rem 1.2rem;
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 2px 10px #ef444422;
  transition:
    background 0.2s,
    box-shadow 0.18s;
  margin-top: 0.6rem;
  outline: none;
}
.logout-btn:hover,
.logout-btn:focus {
  background: linear-gradient(90deg, #dc2626 0%, #f87171 100%);
  box-shadow: 0 4px 16px #ef444455;
}

.cards-heading {
  text-align: left;
  font-size: 1.2rem;
  color: #334155;
  margin-bottom: 0.8rem;
  margin-top: 0.5rem;
  letter-spacing: 0.01em;
}
@media (max-width: 600px) {
  .cards-heading {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
}

/* --- Rest of the styles (cards, modal, etc.) are unchanged --- */

/* Inventory Styles */
.inventory-container {
  margin-top: 3rem;
  text-align: left;
}
@media (max-width: 600px) {
  .inventory-container {
    margin-top: 2rem;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1.4rem;
  margin-top: 1rem;
  justify-items: center;
}
@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.8rem;
  }
}
@media (max-width: 600px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
}

.card-item {
  background: linear-gradient(135deg, #f9fafb 80%, #e0e7ef 100%);
  border-radius: 1rem;
  box-shadow: 0 2px 10px 2px #9eacc922;
  border: 3px solid #f3f4f6;
  min-height: 235px;
  min-width: 135px;
  max-width: 220px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: stretch;
  transition:
    transform 0.18s,
    box-shadow 0.18s;
  cursor: pointer;
}
.card-item:hover {
  transform: scale(1.04);
  box-shadow: 0 4px 18px 2px #bbc8e933;
  z-index: 2;
}
@media (max-width: 900px) {
  .card-item {
    min-height: 120px;
    min-width: 65px;
    max-width: 120px;
    border-radius: 0.5rem;
  }
}
@media (max-width: 600px) {
  .card-item {
    min-height: 90px;
    min-width: 56px;
    max-width: 100vw;
    border-radius: 0.4rem;
  }
}

.card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 0 0 0.7rem 0;
}

.card-img-wrapper {
  width: 100%;
  aspect-ratio: 5/7;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  overflow: hidden;
  position: relative;
  background: #ced3db;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #fff;
  transition: filter 0.18s;
}
.card-img-wrapper:hover .view-full-photo {
  opacity: 1;
}
.view-full-photo {
  position: absolute;
  bottom: 7px;
  right: 10px;
  background: rgba(30, 41, 59, 0.86);
  color: #fffbe6;
  border-radius: 999px;
  padding: 0.1em 0.28em 0.18em 0.28em;
  font-size: 1em;
  opacity: 0.82;
  pointer-events: none;
  transition: opacity 0.18s;
  box-shadow: 0 2px 8px #0002;
  font-weight: bold;
}
@media (max-width: 900px) {
  .card-img-wrapper {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
}
@media (max-width: 600px) {
  .card-img-wrapper {
    border-top-left-radius: 0.4rem;
    border-top-right-radius: 0.4rem;
  }
}

/* Card overlay for count */
.card-overlay {
  position: absolute;
  top: 4px;
  right: 7px;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 12px;
  z-index: 2;
}
@media (max-width: 900px) {
  .card-overlay {
    font-size: 0.6rem;
    top: 3px;
    right: 5px;
    padding: 1.5px 4px;
  }
}
@media (max-width: 600px) {
  .card-overlay {
    font-size: 0.5rem;
    top: 2px;
    right: 2px;
    padding: 1px 3px;
  }
}

.card-meta {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.25rem;
  gap: 0.13em;
}
@media (max-width: 900px) {
  .card-meta {
    margin-top: 0.12rem;
    font-size: 0.7rem;
  }
}
@media (max-width: 600px) {
  .card-meta {
    font-size: 0.64rem;
    gap: 0.09em;
    margin-top: 0.08rem;
  }
}

.rarity-row {
  width: 100%;
  display: flex;
  justify-content: center;
}

.rarity-border {
  border-radius: 6px;
  padding: 1.5px 6px;
  font-size: 0.88rem;
  margin-right: 0.2em;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  min-width: 56px;
  text-align: center;
  text-transform: capitalize;
}
@media (max-width: 900px) {
  .rarity-border {
    font-size: 0.67rem;
    min-width: 36px;
    padding: 1.1px 3.2px;
  }
}
@media (max-width: 600px) {
  .rarity-border {
    font-size: 0.55rem;
    min-width: 22px;
    padding: 0.8px 2px;
  }
}
.border-common {
  border-color: #d1d5db !important;
  color: #374151 !important;
  background: #f9fafb !important;
}
.border-rare {
  border-color: #3b82f6 !important;
  color: #2563eb !important;
  background: #dbeafe !important;
}
.border-legendary {
  border-color: #f59e0b !important;
  color: #b45309 !important;
  background: #fef3c7 !important;
}
.border-korean {
  border-color: #a855f7 !important;
  color: #7c3aed !important;
  background: #ede9fe !important;
}
.border-lebron {
  border-color: #ef4444 !important;
  color: #b91c1c !important;
  background: #fee2e2 !important;
}

.card-stars {
  margin-left: 0rem;
  white-space: nowrap;
  font-size: 1.23rem;
  display: flex;
  justify-content: center;
}
.star {
  filter: drop-shadow(0 0 2px #facc15);
  text-shadow: 0 1px 3px #fef3c7;
  font-size: 1em;
}
@media (max-width: 900px) {
  .card-stars {
    font-size: 0.82rem;
  }
}
@media (max-width: 600px) {
  .card-stars {
    font-size: 0.6rem;
  }
}

.card-name {
  width: 100%;
  text-align: center;
  font-size: 1.01rem;
  margin-top: 0.18rem;
  color: #334155;
  letter-spacing: 0.01em;
  text-shadow:
    0 1px 8px #fff,
    0 1px 1px #e0e7ef;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 900px) {
  .card-name {
    font-size: 0.76rem;
    margin-top: 0.13rem;
  }
}
@media (max-width: 600px) {
  .card-name {
    font-size: 0.68rem;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(30, 41, 59, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-img-container {
  position: relative;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 36px 4px #222a4c88;
  max-width: 92vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
}
.modal-img {
  width: 38vw;
  max-width: 400px;
  height: auto;
  max-height: 86vh;
  border-radius: 1rem;
  object-fit: contain;
  background: #f9fafb;
  box-shadow: 0 2px 18px #0002;
}
.close-btn {
  position: absolute;
  top: 0.8rem;
  right: 1.2rem;
  background: rgba(30, 41, 59, 0.9);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  padding: 0 0.5rem;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 8px #0003;
  transition: background 0.18s;
}
.close-btn:hover {
  background: #ef4444;
}
@media (max-width: 900px) {
  .modal-img {
    width: 70vw;
    max-width: 95vw;
  }
}
@media (max-width: 600px) {
  .modal-img-container {
    border-radius: 0.7rem;
    padding: 0.5rem;
  }
  .modal-img {
    width: 95vw;
    max-width: 98vw;
    border-radius: 0.5rem;
  }
  .close-btn {
    font-size: 1.3rem;
    top: 0.2rem;
    right: 0.32rem;
  }
}
</style>
