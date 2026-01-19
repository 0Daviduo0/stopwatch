<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-black transition-colors duration-300 relative overflow-hidden">
    
    <BackgroundClock />

    <div class="w-full max-w-sm relative z-10">
      <div class="mb-12 text-center">
        <h1 class="text-3xl font-serif font-heading tracking-heading text-black dark:text-white mb-2 transition-colors duration-300">Welcome Back.</h1>
        <p class="text-gray-500 dark:text-gray-400 font-sans font-body text-sm transition-colors duration-300">Sign in to your stopwatch account.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-1">
          <label class="block text-xs font-heading uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-4 mb-1 transition-colors duration-300">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="w-full px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-transparent focus:bg-white dark:focus:bg-black focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 text-base font-body text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-full shadow-sm"
            placeholder="name@example.com"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-heading uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-4 mb-1 transition-colors duration-300">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="w-full px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-transparent focus:bg-white dark:focus:bg-black focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 text-base font-body text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-full shadow-sm"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="text-red-600 dark:text-red-400 text-xs font-medium mt-2 ml-4">
          {{ error }}
        </div>

        <div class="pt-6">
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-4 bg-black dark:bg-white text-white dark:text-black text-sm font-heading tracking-wide uppercase hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-full"
          >
            <span v-if="loading">Processing...</span>
            <span v-else>Continue</span>
          </button>
        </div>

        <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 font-body transition-colors duration-300">
          NO ACCOUNT? 
          <router-link to="/register" class="text-black dark:text-white font-heading hover:underline ml-1 transition-colors duration-300">CREATE ONE</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import BackgroundClock from '../components/BackgroundClock.vue'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null
    await userStore.signIn(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
