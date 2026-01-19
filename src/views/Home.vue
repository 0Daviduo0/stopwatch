<template>
  <div class="min-h-screen flex flex-col items-center justify-center relative bg-white dark:bg-black transition-colors duration-300">
    
    <!-- Logout / Navigation (Minimal absolute positioning) -->
    <button 
      @click="handleLogout"
      class="absolute top-6 right-6 text-sm font-heading uppercase tracking-widest text-gray-400 hover:text-black dark:text-gray-600 dark:hover:text-white transition-colors"
    >
      Sign Out
    </button>

    <!-- Main Clock Display -->
    <div class="text-center select-none">
      <div class="font-sans font-light text-black dark:text-white transition-colors duration-300 leading-none">
        <!-- Time Breakdown for scaling -->
        <span class="text-[12vw] sm:text-[15vw] font-bold tabular-nums tracking-tighter block md:inline">
          {{ formattedTime.main }}<span class="text-[4vw] sm:text-[5vw] text-gray-400 dark:text-gray-600 align-top ml-1">{{ formattedTime.ms }}</span>
        </span>
      </div>
      
      <p class="mt-4 text-xs sm:text-sm font-heading uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        Current Time
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const now = ref(new Date())
const isIntroDone = ref(false)
let animationFrameId = null

const formattedTime = computed(() => {
  const t = new Date(now.value)
  const h = String(t.getHours()).padStart(2, '0')
  const m = String(t.getMinutes()).padStart(2, '0')
  const s = String(t.getSeconds()).padStart(2, '0')
  const ms = String(t.getMilliseconds()).padStart(3, '0')
  return {
    main: `${h}:${m}:${s}`,
    ms: `.${ms}`
  }
})

const updateTime = () => {
  now.value = new Date()
  animationFrameId = requestAnimationFrame(updateTime)
}

const startIntroAnimation = () => {
  const duration = 2000 // 2 seconds
  const end = Date.now()
  const start = new Date().setHours(0, 0, 0, 0) // Start from midnight today
  const startTime = performance.now()

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4)
    
    const currentTimestamp = start + (end - start) * ease
    now.value = new Date(currentTimestamp)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      isIntroDone.value = true
      updateTime()
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  // Start animation immediately
  startIntroAnimation()
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

const handleLogout = async () => {
  await userStore.signOut()
  router.push('/login')
}
</script>
