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

            // Calculate when to start in AudioContext time
            // startAtDate is a Date object. 
            // We need to sync it to AudioContext.currentTime

            const now = new Date()
            const diff = startAtDate.getTime() - now.getTime()

            // If start time is in the future, schedule it
            // If it's in the past (e.g. "on the minute"), we catch the next beat

            let startDelay = 0
            if (diff > 0) {
                startDelay = diff / 1000
            } else {
                // Calculate time to next beat based on modulus if needed, 
                // or just start immediately if the user wants "start now" logic.
                // Assuming user picks a specific time, we wait for it.
                // If the time passed, we might want to start at the next interval point?
                // For now, let's assume immediate start if no specific time or passed time.
                startDelay = 0
            }

            this.nextNoteTime = this.audioContext.currentTime + startDelay
            this.scheduler()
        },

        stop() {
            this.isPlaying = false
            clearTimeout(this.timerID)
        },

        scheduler() {
            // While there are notes that will need to play before the next interval, 
            // schedule them and advance the pointer.
            const lookahead = 25.0 // How frequently to call scheduling function (in milliseconds)
            const scheduleAheadTime = 0.1 // How far ahead to schedule audio (sec)

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
            // Play sound
            const osc = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()

            osc.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            // High-pitched clock tick
            osc.frequency.value = 1500 // Higher pitch
            osc.type = 'sine'

            // Very short, sharp envelope
            gainNode.gain.setValueAtTime(0.3, time)
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03) // Fast decay

            osc.start(time)
            osc.stop(time + 0.03)

            // Trigger visual callback via state change or event?
            // Since we need to sync animation to audio time, we can setup a draw loop in component
            // or just use a reactive counter that flips slightly before 'time'. 
            // Setting state here works for rough sync.

            // We can emit an event or toggle a boolean for the UI to react
            // However, setTimeout for UI might drift from Audio. 
            // Ideally UI uses Draw loop checking AudioContext time.
        }
    }
})
