import { useEffect } from 'react'

// Progressive enhancement: content is visible before JS and stays visible if
// animation APIs are unavailable. Drafts and form state are never involved.
const ARRIVAL_TARGETS = [
  '.home-heading', '.home-paths', '.home-quick', '.example-heading',
  '.page-intro .narrow', '.hub-heading', '.begin-steps', '.resource-tabs',
  '.program-list', '.mentor-first', '.mentor-directory-list', '.guide-layout',
  '.core-guide-list', '.core-tool-list', '.tn-toolbar', '.qb-tool-toolbar', '.ip-toolbar',
  '.three-column', '.notebook-basics',
].join(', ')

export default function useSurfaceMotion(rootRef, pathname) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const animations = new Set()
    const cleanups = []
    let observer

    const stopArrivals = () => {
      observer?.disconnect()
      animations.forEach(animation => animation.cancel())
      animations.clear()
    }

    if (!reduced.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        let stagger = 0
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          observer.unobserve(entry.target)
          if (!entry.target.animate || entry.target.contains(document.activeElement)) return
          const animation = entry.target.animate([
            { opacity: 0.72, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], {
            duration: 560,
            delay: Math.min(stagger++ * 65, 130),
            easing: 'cubic-bezier(.2,.75,.2,1)',
          })
          animations.add(animation)
          animation.onfinish = () => animations.delete(animation)
        })
      }, { threshold: 0.08 })
      root.querySelectorAll(ARRIVAL_TARGETS).forEach(element => observer.observe(element))
    }

    // Only the two large navigation links tilt. Reading and writing surfaces
    // remain still, with equivalent focus and press feedback for keyboard/touch.
    root.querySelectorAll('.home-path').forEach(surface => {
      let frame = 0
      let bounds = null
      let position = null
      const reset = () => {
        cancelAnimationFrame(frame)
        frame = 0
        bounds = null
        position = null
        surface.removeAttribute('data-tracking')
        for (const property of ['--tilt-x', '--tilt-y', '--light-x', '--light-y']) {
          surface.style.removeProperty(property)
        }
      }
      const move = event => {
        if (reduced.matches || !finePointer.matches || event.pointerType !== 'mouse') return
        bounds ||= surface.getBoundingClientRect()
        position = { x: event.clientX, y: event.clientY }
        if (frame) return
        frame = requestAnimationFrame(() => {
          frame = 0
          if (!bounds || !position) return
          const x = Math.max(0, Math.min(1, (position.x - bounds.left) / bounds.width))
          const y = Math.max(0, Math.min(1, (position.y - bounds.top) / bounds.height))
          surface.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`)
          surface.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`)
          surface.style.setProperty('--light-x', `${x * 100}%`)
          surface.style.setProperty('--light-y', `${y * 100}%`)
          surface.setAttribute('data-tracking', '')
        })
      }
      surface.addEventListener('pointermove', move, { passive: true })
      surface.addEventListener('pointerleave', reset)
      surface.addEventListener('pointercancel', reset)
      window.addEventListener('scroll', reset, { passive: true })
      window.addEventListener('resize', reset, { passive: true })
      window.addEventListener('blur', reset)
      reduced.addEventListener('change', reset)
      finePointer.addEventListener('change', reset)
      cleanups.push(() => {
        reset()
        surface.removeEventListener('pointermove', move)
        surface.removeEventListener('pointerleave', reset)
        surface.removeEventListener('pointercancel', reset)
        window.removeEventListener('scroll', reset)
        window.removeEventListener('resize', reset)
        window.removeEventListener('blur', reset)
        reduced.removeEventListener('change', reset)
        finePointer.removeEventListener('change', reset)
      })
    })

    const respectPreference = () => { if (reduced.matches) stopArrivals() }
    const settleFocusedContent = event => {
      animations.forEach(animation => {
        if (animation.effect?.target?.contains(event.target)) {
          animation.cancel()
          animations.delete(animation)
        }
      })
    }
    reduced.addEventListener('change', respectPreference)
    root.addEventListener('focusin', settleFocusedContent)
    return () => {
      stopArrivals()
      cleanups.forEach(cleanup => cleanup())
      reduced.removeEventListener('change', respectPreference)
      root.removeEventListener('focusin', settleFocusedContent)
    }
  }, [rootRef, pathname])
}
