import { useEffect, useMemo, useState } from 'react'

export default function RotatingMealImage({
  images = [],
  interval = 5200,
  sizeClass = 'h-52 w-52',
  roundedClass = 'rounded-[44px]',
}) {
  const pool = useMemo(() => images.filter(Boolean), [images])
  const [index, setIndex] = useState(() => (pool.length ? Math.floor(Math.random() * pool.length) : 0))
  const [paused, setPaused] = useState(false)
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    if (pool.length < 2 || paused) return undefined

    const id = setInterval(() => {
      setPhase('exit')
      setTimeout(() => {
        setIndex((current) => {
          let next = current
          while (next === current) {
            next = Math.floor(Math.random() * pool.length)
          }
          return next
        })
        setPhase('enter')
      }, 1000)
    }, interval)

    return () => clearInterval(id)
  }, [pool, interval, paused])

  useEffect(() => {
    if (!paused) return undefined
    setPhase('enter')
    return undefined
  }, [paused])

  const src = pool[index]

  return (
    <div
      className={`${sizeClass} overflow-hidden ${roundedClass} bg-white/80 shadow-inner`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {src ? (
        <img
          key={src}
          src={src}
          alt="Meal preview"
          className={`h-full w-full object-cover will-change-transform ${
            phase === 'exit' ? 'slide-out-right' : 'slide-in-right'
          }`}
        />
      ) : null}
    </div>
  )
}
