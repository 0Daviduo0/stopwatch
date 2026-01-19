export const vaporize = (element) => {
    return new Promise((resolve) => {
        if (!element) {
            resolve()
            return
        }

        const rect = element.getBoundingClientRect()
        const particles = []
        const particleCount = 200 // Increased count for denser effect

        // Create a fixed container for particles on top of everything
        const container = document.createElement('div')
        container.style.position = 'fixed'
        container.style.top = '0'
        container.style.left = '0'
        container.style.width = '100vw'
        container.style.height = '100vh'
        container.style.pointerEvents = 'none'
        container.style.zIndex = '2147483647' // Max z-index
        document.body.appendChild(container)

        // Force colors to be visible
        const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark')
        const white = '255, 255, 255'
        const black = '0, 0, 0'
        const red = '239, 68, 68'

        const themeColor = isDark ? white : black

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div')

            // Random position within the element rect
            const relativeX = Math.random() * rect.width
            const x = rect.left + relativeX
            const y = rect.top + Math.random() * rect.height

            // Vary size more significantly (2px to 6px)
            const size = Math.random() * 4 + 2

            p.style.position = 'absolute'
            p.style.left = `${x}px`
            p.style.top = `${y}px`
            p.style.width = `${size}px`
            p.style.height = `${size}px`

            // 70% chance of being red (the "delete" color), 30% theme color
            const color = Math.random() > 0.3 ? red : themeColor
            p.style.backgroundColor = `rgb(${color})`

            // Make them round
            p.style.borderRadius = '50%'
            p.style.opacity = '1'
            p.style.boxShadow = `0 0 2px rgba(${color}, 0.5)` // Add glow

            container.appendChild(p)
            particles.push(p)

            // Animation Settings
            // Slower: 800ms - 1500ms
            const duration = Math.random() * 700 + 800

            // Direction: Right to Left (Force coming from Right)
            // X: -100px to -300px (Strong left movement)
            const destX = -(Math.random() * 200 + 100)

            // Y: -50px to +50px (Slight varying vertical spread)
            const destY = (Math.random() - 0.5) * 100

            const rotation = Math.random() * 720 - 360

            // Propagation Delay: Right side starts first (0ms), Left side starts later (up to 300ms)
            // relativeX is 0 at left, rect.width at right.
            const waveDelay = (1 - (relativeX / rect.width)) * 300

            // Native Animation
            p.animate([
                {
                    transform: `translate(0, 0) scale(1) rotate(0deg)`,
                    opacity: 1
                },
                {
                    transform: `translate(${destX}px, ${destY}px) scale(0) rotate(${rotation}deg)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                delay: waveDelay,
                easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', // Ease out
                fill: 'forwards'
            })
        }

        // Return promise after the "wave" has mostly passed so the element can be removed
        setTimeout(() => {
            resolve()
        }, 600)

        // Cleanup DOM after all animations effectively finished
        setTimeout(() => {
            if (document.body.contains(container)) {
                document.body.removeChild(container)
            }
        }, 2000)
    })
}
