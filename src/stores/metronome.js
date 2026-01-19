import { defineStore } from 'pinia'

export const useMetronomeStore = defineStore('metronome', {
    state: () => ({
        isPlaying: false,
        intervalMs: 1000, // Default 1 second
        startTime: null,
        audioContext: null,
        nextNoteTime: 0.0,
        timerID: null,
        // For visual sync
        currentBeat: 0
    }),

    actions: {
        initAudio() {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            }
        },

        start(intervalMs, startAtDate) {
            this.initAudio()
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume()
            }

            this.intervalMs = intervalMs
            this.isPlaying = true
            this.currentBeat = 0

            // Sync start time to AudioContext
            const now = new Date()
            const diff = startAtDate.getTime() - now.getTime()
            const startDelay = diff > 0 ? diff / 1000 : 0

            this.nextNoteTime = this.audioContext.currentTime + startDelay
            this.scheduler()
        },

        stop() {
            this.isPlaying = false
            clearTimeout(this.timerID)
        },

        scheduler() {
            const lookahead = 25.0
            const scheduleAheadTime = 0.1

            while (this.nextNoteTime < this.audioContext.currentTime + scheduleAheadTime) {
                this.scheduleNote(this.nextNoteTime)
                this.nextNote();
            }

            if (this.isPlaying) {
                this.timerID = setTimeout(() => this.scheduler(), lookahead)
            }
        },

        nextNote() {
            const secondsPerBeat = this.intervalMs / 1000
            this.nextNoteTime += secondsPerBeat
            this.currentBeat++
        },

        scheduleNote(time) {
            const osc = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()

            osc.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            // High-pitched clock tick
            osc.frequency.value = 1500
            osc.type = 'sine'

            gainNode.gain.setValueAtTime(0.3, time)
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03)

            osc.start(time)
            osc.stop(time + 0.03)
        }
    }
})
