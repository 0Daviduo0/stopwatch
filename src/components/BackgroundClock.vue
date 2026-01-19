<template>
  <div class="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
    <div class="font-sans font-bold text-[25vw] leading-none text-black dark:text-white opacity-[0.03] tracking-tighter tabular-nums">
      {{ time }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const time = ref('')
let frameId = null

const updateTime = () => {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    time.value = `${h}:${m}:${s}`
    frameId = requestAnimationFrame(updateTime)
}

onMounted(() => {
    updateTime()
})

onUnmounted(() => {
    if (frameId) cancelAnimationFrame(frameId)
})
</script>
