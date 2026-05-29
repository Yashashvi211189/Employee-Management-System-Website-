"use client"

import { useEffect, useRef } from "react"

export default function AmbientAIBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const ctx2d = ctx

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width * 0.6, // LEFT SIDE ONLY
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }))

    function draw() {
      ctx2d.clearRect(0, 0, width, height)

      ctx2d.fillStyle = "rgba(120,140,255,0.08)"
      ctx2d.strokeStyle = "rgba(120,140,255,0.05)"

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width * 0.6) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx2d.beginPath()
        ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx2d.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx2d.beginPath()
            ctx2d.moveTo(p.x, p.y)
            ctx2d.lineTo(q.x, q.y)
            ctx2d.stroke()
          }
        }
      })

      requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    })
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  )
}
