<template>
  <div class="min-h-screen flex flex-col items-center relative bg-white dark:bg-black transition-colors duration-300">
    
    <!-- Logout / Navigation -->
    <div class="absolute top-6 right-6 z-50">
      <button 
        @click="handleLogout"
        class="text-sm font-heading uppercase tracking-widest text-gray-400 hover:text-black dark:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
      >
        Sign Out
      </button>
    </div>

    <!-- Calendar -->
    <div class="w-full mt-4 mb-0 z-10">
      <HorizontalCalendar v-model="selectedDate" />
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 w-full flex flex-col items-center justify-start pt-12 relative">
      <!-- Real-time Clock (Only if Today is selected) -->
      <transition name="fade" mode="out-in">
        <div v-if="isTodaySelected" class="flex flex-col items-center w-full relative z-10">
          <!-- Clock -->
          <div class="text-center select-none w-full mb-12">
            <div class="font-sans font-light text-black dark:text-white transition-colors duration-300 leading-none">
              <span class="text-[12vw] sm:text-[15vw] font-bold tabular-nums tracking-tighter block md:inline flex items-baseline justify-center gap-2">
                {{ formattedTime.main }}<span class="text-[4vw] sm:text-[5vw] text-gray-400 dark:text-gray-600 align-top ml-1">{{ formattedTime.ms }}</span>
                
                <!-- Metronome Indicator -->
                <button 
                    @click="handleMetronomeClick"
                    class="group relative w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 dark:border-zinc-700 ml-4 overflow-hidden focus:outline-none hover:border-black dark:hover:border-white transition-all duration-300"
                    :class="{ 'hover:border-red-500 dark:hover:border-red-500 hover:bg-red-500': metronomeStore.isPlaying }"
                >
                    <div 
                        v-show="!metronomeStore.isPlaying || (metronomeStore.isPlaying)"
                        class="absolute inset-0 rounded-full transition-opacity duration-200"
                        :class="[
                            { 'animate-pulse-fill': metronomeStore.isPlaying },
                            { 'group-hover:opacity-0': metronomeStore.isPlaying }
                        ]"
                        :style="metronomeStyle"
                    ></div>

                    <div 
                        v-if="metronomeStore.isPlaying"
                        class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                        <PhStop weight="fill" class="text-white w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                </button>
              </span>
            </div>
          </div>
          
          <!-- Record Button with State Cycling -->
          <div class="h-28 flex items-center justify-center">
            <button 
              @click="recordMoment"
              class="group relative flex items-center justify-center bg-black dark:bg-white text-white dark:text-black shadow-xl transition-all duration-300 ease-out"
              :class="[
                buttonState === 'icon' 
                    ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full hover:scale-105 active:scale-95 border-2 border-transparent' 
                    : '',
                buttonState === 'text' 
                    ? 'w-48 h-20 rounded-full hover:scale-105 active:scale-95 border-2 border-transparent' 
                    : '',
                buttonState === 'space' 
                    ? 'w-64 h-16 rounded-lg border-b-[6px] border-gray-800 dark:border-gray-300 active:border-b-[2px] active:translate-y-[4px]' 
                    : '',
                isPressed && buttonState === 'space'
                    ? 'border-b-[2px] translate-y-[4px] shadow-none' 
                    : '',
                isPressed && buttonState !== 'space'
                    ? 'scale-90'
                    : ''
              ]"
            >
               <div v-if="buttonState !== 'space'" class="absolute inset-0 rounded-inherit border-2 border-transparent group-hover:border-black dark:group-hover:border-white opacity-20 group-hover:scale-110 transition-all duration-500 rounded-[inherit]"></div>
               
               <!-- Content Transitions -->
               <transition name="fade" mode="out-in">
                 <div v-if="buttonState === 'icon'" class="absolute inset-0 flex items-center justify-center">
                    <PhPlus :size="32" weight="bold" />
                 </div>
                 
                 <div v-else-if="buttonState === 'text'" class="absolute inset-0 flex items-center justify-center">
                    <span class="font-heading uppercase tracking-widest text-sm font-bold">Add Moment</span>
                 </div>

                 <div v-else-if="buttonState === 'space'" class="absolute inset-0 flex items-center justify-center space-x-3">
                    <span class="font-mono text-xs opacity-60">PRESS</span>
                    <div class="h-8 border-r border-white/20 dark:border-black/20"></div>
                    <span class="font-heading uppercase tracking-widest text-lg font-bold">SPACE</span>
                 </div>
               </transition>
            </button>
          </div>
        </div>

        <!-- Past Date / Moments List View -->
        <div v-else class="w-full max-w-xl px-6 pb-20">
          <h2 class="text-2xl font-serif font-heading text-black dark:text-white mb-6 text-center">
            Moments from {{ formatDateText(selectedDate) }}
          </h2>
          
          <div v-if="momentsStore.loading" class="text-center py-10">
            <span class="animate-pulse text-gray-400">Loading moments...</span>
          </div>

          <div v-else-if="momentsStore.moments.length === 0" class="text-center py-10">
            <p class="text-gray-400 dark:text-gray-600 text-sm font-body">No moments recorded for this day.</p>
          </div>

          <div class="space-y-4">
             <div 
              v-for="moment in momentsStore.moments" 
              :key="moment.id"
              :id="'moment-' + moment.id"
              :ref="el => setMomentRef(el, moment.id)"
              class="flex flex-wrap items-center gap-4 p-4 rounded-3xl border border-transparent transition-all duration-300 group overflow-hidden relative"
              :class="[
                deletingMomentId === moment.id 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-50 dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-800'
              ]"
             >
               
               <!-- Normal State -->
               <template v-if="deletingMomentId !== moment.id">
                 <!-- Time -->
                 <div class="font-sans font-bold text-xl tabular-nums text-black dark:text-white shrink-0 pt-0.5 order-1">
                    {{ formatMomentTime(moment.recorded_at) }}
                 </div>
                 
                 <!-- Note Input -->
                 <div 
                    class="transition-all duration-300"
                    :class="[
                        isLong(moment.note) 
                            ? 'w-full order-3 mt-2' 
                            : 'flex-1 order-2'
                    ]"
                 >
                   <textarea 
                      v-model="moment.note"
                      @blur="updateNote(moment)"
                      @input="autoResize($event.target)"
                      @focus="autoResize($event.target)"
                      @keydown.enter.prevent="$event.target.blur()"
                      placeholder="Add a note..." 
                      rows="1"
                      class="w-full bg-transparent border-none p-0 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-0 resize-none overflow-hidden"
                   ></textarea>
                 </div>

                 <!-- Delete Action -->
                 <button 
                  @click="initiateDelete(moment.id)"
                  class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all duration-200 order-2 ml-auto"
                  title="Delete moment"
                 >
                   <PhTrash :size="20" weight="regular" />
                 </button>
               </template>

               <!-- Confirm Delete State -->
               <template v-else>
                  <div class="flex-1 font-heading uppercase text-sm font-bold tracking-wider">
                    Delete this moment?
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      @click="cancelDelete"
                      class="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wide transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      @click="confirmDelete"
                      class="px-4 py-2 rounded-full bg-white text-red-600 hover:bg-gray-100 text-xs font-bold uppercase tracking-wide transition-colors"
                    >
                      Delete
                    </button>
                  </div>
               </template>

             </div>
          </div>
        </div>
      </transition>
      
      <!-- Today's moments list (Below clock) -->
      <transition name="fade">
        <div v-if="isTodaySelected && momentsStore.moments.length > 0" class="w-full max-w-xl px-6 mt-12 pb-20">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-heading uppercase tracking-widest text-gray-400">Today's Moments</h3>
            <span class="text-xs font-bold bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-gray-500">{{ momentsStore.moments.length }}</span>
          </div>
          
          <div class="space-y-3">
             <div 
              v-for="moment in momentsStore.moments" 
              :key="moment.id"
              :id="'moment-' + moment.id"
              :ref="el => setMomentRef(el, moment.id)"
              class="flex flex-wrap items-center gap-4 p-4 rounded-3xl border border-transparent transition-all duration-300 group overflow-hidden relative"
              :class="[
                deletingMomentId === moment.id 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-50 dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-800'
              ]"
             >
               <!-- Normal State -->
               <template v-if="deletingMomentId !== moment.id">
                 <div class="font-sans font-bold text-lg tabular-nums text-black dark:text-white shrink-0 pt-0.5 order-1">
                    {{ formatMomentTime(moment.recorded_at) }}
                 </div>
                 <div 
                    class="transition-all duration-300"
                    :class="[
                        isLong(moment.note) 
                            ? 'w-full order-3 mt-2' 
                            : 'flex-1 order-2'
                    ]"
                 >
                   <textarea 
                      v-model="moment.note"
                      @blur="updateNote(moment)"
                      @input="autoResize($event.target)"
                      @focus="autoResize($event.target)"
                      @keydown.enter.prevent="$event.target.blur()"
                      placeholder="Add a note..." 
                      rows="1"
                      class="w-full bg-transparent border-none p-0 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-0 resize-none overflow-hidden"
                   ></textarea>
                 </div>
                 <button 
                  @click="initiateDelete(moment.id)"
                  class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all duration-200 order-2 ml-auto"
                 >
                   <PhTrash :size="18" weight="regular" />
                 </button>
               </template>

               <!-- Confirm Delete State -->
               <template v-else>
                  <div class="flex-1 font-heading uppercase text-sm font-bold tracking-wider">
                    Delete?
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      @click="cancelDelete"
                      class="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold uppercase tracking-wide transition-colors"
                    >
                      No
                    </button>
                    <button 
                      @click="confirmDelete"
                      class="px-3 py-1.5 rounded-full bg-white text-red-600 hover:bg-gray-100 text-[10px] font-bold uppercase tracking-wide transition-colors"
                    >
                      Yes
                    </button>
                  </div>
               </template>
             </div>
          </div>
        </div>
      </transition>
    </div>

    <MetronomeModal 
        :is-open="isMetronomeModalOpen"
        @close="isMetronomeModalOpen = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useMomentsStore } from '../stores/moments'
import { useMetronomeStore } from '../stores/metronome'
import HorizontalCalendar from '../components/HorizontalCalendar.vue'
import MetronomeModal from '../components/MetronomeModal.vue'
import { PhPlus, PhTrash, PhStop } from '@phosphor-icons/vue'
import { vaporize } from '../utils/vaporize'

const router = useRouter()
const userStore = useUserStore()
const momentsStore = useMomentsStore()
const metronomeStore = useMetronomeStore()

const isMetronomeModalOpen = ref(false)
const openMetronomeSettings = () => isMetronomeModalOpen.value = true

const handleMetronomeClick = () => {
    if (metronomeStore.isPlaying) {
        metronomeStore.stop()
    } else {
        openMetronomeSettings()
    }
}

const metronomeStyle = computed(() => {
    return {
        animationDuration: `${metronomeStore.intervalMs}ms`
    }
})
const now = ref(new Date())
const selectedDate = ref(new Date())
const isIntroDone = ref(false)
let animationFrameId = null
const momentRefs = ref({})

const setMomentRef = (el, id) => {
  if (el) momentRefs.value[id] = el
}

// Button Logic
const buttonState = ref('icon') // 'icon', 'text', 'space'
let buttonCycleInterval = null
const isPressed = ref(false)

const startButtonCycle = () => {
    buttonCycleInterval = setInterval(() => {
        if (buttonState.value === 'icon') buttonState.value = 'text'
        else if (buttonState.value === 'text') buttonState.value = 'space'
        else buttonState.value = 'icon'
    }, 4000)
}

const handleKeydown = (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        isPressed.value = true
        recordMoment()
        setTimeout(() => isPressed.value = false, 200)
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    startButtonCycle()
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (buttonCycleInterval) clearInterval(buttonCycleInterval)
})

const isTodaySelected = computed(() => {
  const s = new Date(selectedDate.value)
  const t = new Date()
  return s.getDate() === t.getDate() && 
         s.getMonth() === t.getMonth() && 
         s.getFullYear() === t.getFullYear()
})

const formatDateText = (date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

const autoResize = (target) => {
    target.style.height = 'auto'
    target.style.height = target.scrollHeight + 'px'
}

const isLong = (text) => text && text.length > 35

const formatMomentTime = (isoString) => {
  const date = new Date(isoString)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

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

// Moment Actions
const deletingMomentId = ref(null)

const recordMoment = async () => {
  await momentsStore.addMoment(new Date())
}

const updateNote = async (moment) => {
  await momentsStore.updateNote(moment.id, moment.note)
}

const initiateDelete = (id) => {
  deletingMomentId.value = id
}

const cancelDelete = () => {
  deletingMomentId.value = null
}

const confirmDelete = async () => {
  const id = deletingMomentId.value
  if (id) {
    // Try via ref, fallback to DOM ID
    let el = momentRefs.value[id]
    if (!el) {
        el = document.getElementById('moment-' + id)
    }

    if (el) {
       // Apply fade out to the element while particles fly
       el.style.transition = 'opacity 0.2s ease-out'
       el.style.opacity = '0' 
       await vaporize(el)
    }
    
    await momentsStore.deleteMoment(id)
    deletingMomentId.value = null
    delete momentRefs.value[id]
  }
}

// Watch date selection to fetch moments
watch(selectedDate, (newDate) => {
  momentsStore.fetchMoments(newDate)
}, { immediate: true })

onMounted(() => {
  // Start animation immediately
  startIntroAnimation()
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

const handleLogout = async () => {
  try {
    await userStore.signOut()
  } catch (e) {
    console.error(e)
  } finally {
    router.push('/login')
  }
}
</script>
