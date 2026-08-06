import { useEffect, useRef, useCallback } from "react"
import React from "react"
import createGlobe from "cobe"

interface PulseMarker {
  id: string
  location: [number, number]
  delay: number
  label?: string
}

interface GlobePulseProps {
  markers?: PulseMarker[]
  className?: string
  speed?: number
  markerColor?: [number, number, number]
  pulseColor?: string
  lightMode?: boolean
  interactive?: boolean
  active?: boolean
}

const defaultMarkers: PulseMarker[] = [
  { id: "pulse-1", location: [51.51, -0.13], delay: 0, label: "London" },
  { id: "pulse-2", location: [40.71, -74.01], delay: 0.3, label: "New York" },
  { id: "pulse-3", location: [35.68, 139.65], delay: 0.6, label: "Tokyo" },
  { id: "pulse-4", location: [-33.87, 151.21], delay: 0.9, label: "Sydney" },
  { id: "pulse-5", location: [48.86, 2.35], delay: 1.2, label: "Paris" },
  { id: "pulse-6", location: [55.76, 37.62], delay: 1.5, label: "Moscow" },
  { id: "pulse-7", location: [19.43, -99.13], delay: 1.8, label: "Mexico City" },
  { id: "pulse-8", location: [-23.55, -46.63], delay: 2.1, label: "São Paulo" },
  { id: "pulse-9", location: [1.35, 103.82], delay: 2.4, label: "Singapore" },
  { id: "pulse-10", location: [28.61, 77.21], delay: 2.7, label: "Delhi" },
  { id: "pulse-11", location: [37.57, 126.98], delay: 3.0, label: "Seoul" },
  { id: "pulse-12", location: [-1.29, 36.82], delay: 3.3, label: "Nairobi" },
  { id: "pulse-13", location: [52.52, 13.41], delay: 3.6, label: "Berlin" },
  { id: "pulse-14", location: [34.05, -118.24], delay: 3.9, label: "Los Angeles" },
  { id: "pulse-15", location: [25.20, 55.27], delay: 4.2, label: "Dubai" },
]

export function GlobePulse({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
  markerColor = [0.6, 0.2, 0.9],
  pulseColor = "#a855f7",
  lightMode = false,
  interactive = true,
  active = true,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const activeRef = useRef(active)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = 600
      if (globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: lightMode ? 0 : 1,
        diffuse: lightMode ? 1.2 : 1.5,
        mapSamples: 8000,
        mapBrightness: lightMode ? 5 : 8,
        baseColor: lightMode ? [0.8, 0.8, 0.8] : [0.5, 0.5, 0.5],
        markerColor: markerColor,
        glowColor: lightMode ? [0.9, 0.9, 0.9] : [0.05, 0.05, 0.05],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.03, id: m.id })),
        opacity: lightMode ? 0.9 : 0.7,
      })

      function animate() {
        if (activeRef.current && !isPausedRef.current) {
          phi += speed
          globe!.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
            markers: markers.map((m) => ({ location: m.location, size: 0.03, id: m.id })),
          })
        }
        animationId = requestAnimationFrame(animate)
      }
      animate()
    }

    if (canvas.offsetWidth > 0) {
      init()
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed, markerColor, lightMode])

  return (
    <div className={`relative w-[600px] h-[600px] select-none overflow-hidden ${className}`}>
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scaleX(0.3) scaleY(0.3); opacity: 0.8; }
          100% { transform: scaleX(1.5) scaleY(1.5); opacity: 0; }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onPointerDown={interactive ? handlePointerDown : undefined}
        style={{
          width: "600px",
          height: "600px",
          maxWidth: "600px",
          maxHeight: "600px",
          cursor: interactive ? "grab" : "default",
          opacity: 1,
          borderRadius: "50%",
          touchAction: interactive ? "none" : "pan-y",
          pointerEvents: interactive ? "auto" : "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}` as any,
            bottom: "anchor(center)",
            left: "anchor(center)",
            translate: "-50% 50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none" as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          <span style={{
            position: "absolute", inset: 0,
            border: `2px solid ${pulseColor}`, borderRadius: "50%", opacity: 0,
            animation: `pulse-expand 2s ease-out infinite ${m.delay}s`,
          }} />
          <span style={{
            position: "absolute", inset: 0,
            border: `2px solid ${pulseColor}`, borderRadius: "50%", opacity: 0,
            animation: `pulse-expand 2s ease-out infinite ${m.delay + 0.5}s`,
          }} />
          <span style={{
            width: 8, height: 8, background: pulseColor, borderRadius: "50%",
            boxShadow: `0 0 0 2px ${lightMode ? '#fff' : '#111'}, 0 0 0 4px ${pulseColor}`,
          }} />
        </div>
      ))}
      {markers.map((m) => (
        m.label && (
          <div
            key={`label-${m.id}`}
            style={{
              position: "absolute",
              positionAnchor: `--cobe-${m.id}` as any,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% 0",
              marginBottom: 12,
              padding: "3px 8px",
              background: lightMode ? "rgba(255,255,255,0.95)" : "rgba(26,26,46,0.95)",
              color: lightMode ? "#1a1a2e" : "#ffffff",
              fontFamily: "system-ui, monospace",
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
              whiteSpace: "nowrap" as const,
              pointerEvents: "none" as const,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 4px))`,
              transition: "opacity 0.6s, filter 0.6s",
              boxShadow: lightMode ? "0 2px 8px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.3)",
              borderRadius: "4px",
              zIndex: 10,
            }}
          >
            {m.label}
            <span
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translate3d(-50%, -2px, 0)",
                border: "6px solid transparent",
                borderTopColor: lightMode ? "rgba(255,255,255,0.95)" : "rgba(26,26,46,0.95)",
              }}
            />
          </div>
        )
      ))}
    </div>
  )
}
