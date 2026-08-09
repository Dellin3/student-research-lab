import { useEffect, useRef, useState } from 'react'

export default function useInViewOnce({ threshold = 0.2, rootMargin = '0px' } = {}) {
  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined

    element.classList.add('reveal-ready')
    let observer
    let revealed = false

    const reveal = () => {
      if (revealed) return
      revealed = true
      setIsVisible(true)
      observer?.disconnect()
      window.removeEventListener('scroll', checkPosition)
    }

    const checkPosition = () => {
      const rect = element.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1) {
        reveal()
      }
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) reveal()
        },
        { threshold, rootMargin },
      )
      observer.observe(element)
    }

    window.addEventListener('scroll', checkPosition, { passive: true })
    const timer = window.setTimeout(checkPosition, 0)

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      window.removeEventListener('scroll', checkPosition)
    }
  }, [rootMargin, threshold])

  return [elementRef, isVisible]
}
