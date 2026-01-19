import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useUserStore } from './user'

export const useMomentsStore = defineStore('moments', {
    state: () => ({
        moments: [],
        loading: false
    }),
    actions: {
        async fetchMoments(date) {
            const userStore = useUserStore()
            if (!userStore.user) return

            this.loading = true

            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)

            const { data, error } = await supabase
                .from('moments')
                .select('*')
                .gte('recorded_at', startOfDay.toISOString())
                .lte('recorded_at', endOfDay.toISOString())
                .order('recorded_at', { ascending: false })

            if (error) {
                console.error('Error fetching moments:', error)
            } else {
                this.moments = data
            }
            this.loading = false
        },
        async addMoment(dateObj) {
            const userStore = useUserStore()
            if (!userStore.user) return

            const { data, error } = await supabase
                .from('moments')
                .insert({
                    user_id: userStore.user.id,
                    recorded_at: dateObj.toISOString(),
                    note: ''
                })
                .select()
                .single()

            if (error) throw error
            if (data) this.moments.unshift(data)
            return data
        },
        async updateNote(id, note) {
            const { error } = await supabase
                .from('moments')
                .update({ note })
                .eq('id', id)

            if (error) throw error
            // Update local state
            const m = this.moments.find(x => x.id === id)
            if (m) m.note = note
        },
        async deleteMoment(id) {
            const { error } = await supabase
                .from('moments')
                .delete()
                .eq('id', id)

            if (error) throw error
            this.moments = this.moments.filter(x => x.id !== id)
        }
    }
})
