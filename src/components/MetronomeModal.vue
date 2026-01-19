<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div @click="close" class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>
      
      <!-- Content -->
      <div class="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-zinc-800 transform transition-all">
        <h3 class="text-xl font-heading font-bold mb-6 text-black dark:text-white uppercase tracking-wider text-center">
            Metronome
        </h3>

        <div class="space-y-6">
            <!-- Start Time -->
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold uppercase tracking-widest text-gray-500">Start Time</label>
                    <button 
                        @click="setNow"
                        class="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-600 tracking-wider"
                    >
                        Set Now
                    </button>
                </div>
                <!-- Time Inputs Container -->
                <div class="flex gap-2">
                    <div class="relative flex-1">
                        <label class="absolute -top-2 left-2 px-1 bg-white dark:bg-zinc-900 text-[8px] font-bold text-gray-400 uppercase tracking-wider">Time</label>
                        <input 
                            v-model="startTime" 
                            type="time" 
                            step="1"
                            class="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white rounded-xl p-4 text-center text-xl font-bold font-mono outline-none transition-all"
                        />
                    </div>
                    <!-- Milliseconds -->
                    <div class="relative w-28">
                        <label class="absolute -top-2 left-2 px-1 bg-white dark:bg-zinc-900 text-[8px] font-bold text-gray-400 uppercase tracking-wider">Millis</label>
                        <input 
                            v-model="startMs" 
                            @input="handleMsInput"
                            type="text" 
                            inputmode="numeric"
                            placeholder="000"
                            class="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white rounded-xl p-4 text-center text-xl font-bold font-mono outline-none transition-all placeholder-gray-300 dark:placeholder-zinc-700"
                        />
                    </div>
                </div>
                <p class="text-xs text-gray-400 text-center pt-1">Leave empty to start immediately</p>
            </div>

            <!-- Interval -->
            <div class="space-y-4">
                <label class="block text-xs font-bold uppercase tracking-widest text-gray-500">Interval</label>
                <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                        <label class="absolute -top-2 left-2 px-1 bg-white dark:bg-zinc-900 text-[8px] font-bold text-gray-400 uppercase tracking-wider">Value</label>
                        <input 
                            v-model="intervalValue" 
                            @input="handleIntervalInput"
                            type="text" 
                            inputmode="decimal"
                            class="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white rounded-xl p-4 text-center text-xl font-bold font-mono outline-none transition-all placeholder-gray-300 dark:placeholder-zinc-700"
                            placeholder="1.0"
                        />
                    </div>
                    <div class="relative w-28">
                        <label class="absolute -top-2 left-2 px-1 bg-white dark:bg-zinc-900 text-[8px] font-bold text-gray-400 uppercase tracking-wider">Unit</label>
                        <select 
                            v-model="intervalUnit"
                            class="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white rounded-xl p-4 font-bold outline-none transition-all appearance-none text-center"
                        >
                            <option value="s">Sec</option>
                            <option value="ms">Ms</option>
                            <option value="m">Min</option>
                        </select>
                        <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
                            <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
                <button 
                    @click="close"
                    class="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 font-bold uppercase text-xs tracking-widest transition-colors"
                >
                    Cancel
                </button>
                <button 
                    @click="start"
                    class="flex-1 py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-bold uppercase text-xs tracking-widest transition-opacity shadow-lg shadow-black/20 dark:shadow-white/20"
                >
                    Start
                </button>
            </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { useMetronomeStore } from '../stores/metronome'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])
const store = useMetronomeStore()

const startTime = ref('') // HH:MM:SS
const startMs = ref('')   // 0-999
const intervalValue = ref(1)
const intervalUnit = ref('s')

const setNow = () => {
    const now = new Date()
    // HH:MM:SS
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    startTime.value = `${h}:${m}:${s}`
    
    // MS
    startMs.value = String(now.getMilliseconds()).padStart(3, '0')
}

const handleMsInput = (e) => {
    // allow only numbers
    let val = e.target.value.replace(/\D/g, '')
    // max 3 digits
    if (val.length > 3) val = val.slice(0, 3)
    startMs.value = val
}

const handleIntervalInput = (e) => {
    // Allow numbers and one decimal point
    let val = e.target.value.replace(/[^0-9.]/g, '')
    
    // Prevent multiple dots
    const parts = val.split('.')
    if (parts.length > 2) {
        val = parts[0] + '.' + parts.slice(1).join('')
    }
    
    intervalValue.value = val
}

const start = () => {
    let rawVal = parseFloat(intervalValue.value)
    if (isNaN(rawVal) || rawVal <= 0) rawVal = 1 // Fallback default
    
    let intervalMs = rawVal
    if (intervalUnit.value === 's') intervalMs *= 1000
    if (intervalUnit.value === 'm') intervalMs *= 60000

    let startAt = new Date()
    
    // Parse Start Time if provided
    if (startTime.value) {
        const [hours, minutes, seconds] = startTime.value.split(':').map(Number)
        // Default ms to 0 if empty
        const ms = startMs.value ? parseInt(startMs.value) : 0
        
        startAt.setHours(hours, minutes, seconds || 0, ms)
        
        // Handle past times naturally (store will catch up or start immed depending on diff logic)
    }

    store.start(intervalMs, startAt)
    emit('close')
}

const close = () => {
    emit('close')
}
</script>
