import { createRouter, createWebHistory, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    // Ensure user state is loaded
    if (!userStore.user) {
        await userStore.fetchUser()
    }

    if (to.meta.requiresAuth && !userStore.user) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && userStore.user) {
        next('/')
    } else {
        next()
    }
})

export default router
