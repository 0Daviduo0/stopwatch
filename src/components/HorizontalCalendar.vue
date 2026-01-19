<template>
  <div 
    ref="scrollContainer"
    class="w-full overflow-x-auto no-scrollbar py-4 px-6 relative"
    @scroll="handleScroll"
  >
    <div class="flex space-x-3 min-w-max items-center">
      <template v-for="item in items" :key="item.id">
        
        <!-- Month Marker -->
        <div 
          v-if="item.type === 'month'" 
          class="flex flex-col items-center justify-center p-2 mx-2"
        >
          <div class="h-8 w-px bg-gray-300 dark:bg-gray-700 mb-2"></div>
          <span class="text-xs font-heading font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap writing-vertical-rl transform rotate-180">
            {{ item.label }}
          </span>
          <div class="h-8 w-px bg-gray-300 dark:bg-gray-700 mt-2"></div>
        </div>

        <!-- Day Card -->
        <button 
          v-else
          :id="'day-' + item.id"
          :ref="el => setDayRef(el, item)"
          @click="selectDate(item)"
          :disabled="item.isFuture"
          class="flex flex-col items-center justify-center w-14 h-24 rounded-full transition-all duration-300 border border-transparent select-none relative group shrink-0"
          :class="[
            item.isSelected 
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-110 z-10' 
              : 'bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800',
            item.isFuture 
              ? 'opacity-30 cursor-not-allowed' 
              : 'cursor-pointer'
          ]"
        >
          <span class="text-[10px] font-heading uppercase tracking-wider mb-1">{{ item.dayName }}</span>
          <span class="text-xl font-bold font-sans">{{ item.dayNumber }}</span>
          
          <!-- Today Indicator -->
          <div v-if="item.isToday && !item.isSelected" class="absolute bottom-2 w-1 h-1 rounded-full bg-black dark:bg-white"></div>
        </button>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['update:modelValue'])
const scrollContainer = ref(null)
const items = ref([])
const dayRefs = ref({})

// Track the earliest date loaded to know where to pre-load from
let earliestDateLoaded = new Date()

// Helper to format a date item
const createDayItem = (date) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isToday = d.getTime() === today.getTime()
  const isFuture = d.getTime() > today.getTime()
  
  return {
    id: d.getTime(), // timestamp as unique id
    type: 'day',
    date: d,
    dayName: dayNames[d.getDay()],
    dayNumber: d.getDate(),
    month: d.getMonth(),
    year: d.getFullYear(),
    isToday,
    isFuture,
    isSelected: false // Will be updated by watcher
  }
}

// Helper to create a month marker
const createMonthItem = (date) => {
  const d = new Date(date)
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d)
  return {
    id: `month-${d.getMonth()}-${d.getFullYear()}`,
    type: 'month',
    label: monthName,
    month: d.getMonth(),
    year: d.getFullYear()
  }
}

// Generate a batch of days (backwards from 'from' date)
const generateBatch = (fromDate, daysCount = 30) => {
  const newItems = []
  let current = new Date(fromDate)
  
  // We are iterating backwards
  for (let i = 0; i < daysCount; i++) {
    const dayItem = createDayItem(current)
    newItems.unshift(dayItem)
    
    // If current day is the 1st of the month, prepend a Month Marker for THIS month.
    if (current.getDate() === 1) {
       newItems.unshift(createMonthItem(current))
    }

    current.setDate(current.getDate() - 1)
  }
  
  earliestDateLoaded = new Date(current)
  // Move earliestDateLoaded one day forward because the loop subtracted one too many at the end
  earliestDateLoaded.setDate(earliestDateLoaded.getDate() + 1)
  
  return newItems
}

// Initial Load
const initCalendar = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Start generation from a few days in the future to show context
  const startGenerationDate = new Date(today)
  startGenerationDate.setDate(today.getDate() + 5) // 5 days future
  
  // Generate initial batch (e.g., 60 days back)
  items.value = generateBatch(startGenerationDate, 60)
  
  updateSelection()
}

// Selection Logic
const updateSelection = () => {
  const selectedTime = new Date(props.modelValue).setHours(0,0,0,0)
  items.value.forEach(item => {
    if (item.type === 'day') {
      item.isSelected = item.date.getTime() === selectedTime
    }
  })
}

const selectDate = (item) => {
  if (item.isFuture) return
  emit('update:modelValue', item.date)
}

watch(() => props.modelValue, () => {
    updateSelection()
    centerSelected(true) // Animate on strict selection change
})

// Refs for scrolling
const setDayRef = (el, item) => {
  if (el && item.isSelected) {
    dayRefs.value['selected'] = el
  }
}

// Infinite Scroll
const handleScroll = (e) => {
  if (scrollContainer.value.scrollLeft < 100) {
    prependDays()
  }
}

const prependDays = () => {
  // Prepend another 30 days
  // We need to fetch moving backwards from earliestDateLoaded - 1 day
  const fetchFrom = new Date(earliestDateLoaded)
  fetchFrom.setDate(fetchFrom.getDate() - 1)
  
  const newBatch = generateBatch(fetchFrom, 30)
  
  // Maintain scroll position
  const oldScrollWidth = scrollContainer.value.scrollWidth
  
  items.value.unshift(...newBatch)
  
  nextTick(() => {
    const newScrollWidth = scrollContainer.value.scrollWidth
    const diff = newScrollWidth - oldScrollWidth
    scrollContainer.value.scrollLeft += diff
  })
}

// Centering Logic
const centerSelected = (smooth = true) => {
  nextTick(() => {
    let el = dayRefs.value['selected']
    // Fallback: try to find by ID if ref isn't set (e.g. init load)
    if (items.value.length > 0) {
         // Find selected item
         const selectedItem = items.value.find(i => i.isSelected)
         if (selectedItem) {
             const domEl = document.getElementById('day-' + selectedItem.id)
             if (domEl) el = domEl
         }
    }

    if (el && scrollContainer.value) {
      const containerWidth = scrollContainer.value.clientWidth
      const elWidth = el.clientWidth
      const elLeft = el.offsetLeft
      
      scrollContainer.value.scrollTo({
        left: elLeft - (containerWidth / 2) + (elWidth / 2),
        behavior: smooth ? 'smooth' : 'auto'
      })
    } 
  })
}

onMounted(() => {
  initCalendar()
  // Force instant centering on mount
  setTimeout(() => {
     centerSelected(false)
  }, 100)
})

</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.writing-vertical-rl {
  writing-mode: vertical-rl;
}
</style>
