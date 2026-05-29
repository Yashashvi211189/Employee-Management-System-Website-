"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductDemoModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    demoScreens: {
      title: string
      description: string
      image: string
    }[]
  }
}

export function ProductDemoModal({ isOpen, onClose, product }: ProductDemoModalProps) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const totalScreens = product?.demoScreens?.length || 0

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentScreen((prev) => {
          if (prev === totalScreens - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, totalScreens])

  useEffect(() => {
    // Reset progress when screen changes
    setProgress(0)

    // Animate progress if playing
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0
          }
          return prev + 1
        })
      }, 30)

      return () => clearInterval(interval)
    }
  }, [currentScreen, isPlaying])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const nextScreen = () => {
    if (currentScreen < totalScreens - 1) {
      setCurrentScreen(currentScreen + 1)
    }
  }

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (!product) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative max-h-[90vh] w-full overflow-hidden rounded-2xl bg-background shadow-2xl ${
              isFullscreen ? "h-[90vh] max-w-[90vw]" : "max-w-5xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 p-4 backdrop-blur-sm">
              <h3 className="text-lg font-semibold">{product.name} Demo</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Demo Content */}
            <div className={`relative ${isFullscreen ? "h-[calc(90vh-8rem)]" : "h-[60vh]"}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <img
                    src={product.demoScreens[currentScreen].image || "/brand/abstract-grid.svg"}
                    alt={product.demoScreens[currentScreen].title}
                    className="h-full w-full object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevScreen}
                disabled={currentScreen === 0}
                className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm disabled:opacity-0"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextScreen}
                disabled={currentScreen === totalScreens - 1}
                className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm disabled:opacity-0"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Screen Indicators */}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {product.demoScreens.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreen(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      currentScreen === index ? "w-8 bg-primary" : "bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to screen ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-border/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium">{product.demoScreens[currentScreen].title}</h4>
                  <p className="text-sm text-muted-foreground">{product.demoScreens[currentScreen].description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={togglePlayPause} className="flex items-center gap-2">
                    {isPlaying ? (
                      <>
                        <span className="h-3 w-3 rounded-sm bg-primary"></span>
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" />
                        Auto Play
                      </>
                    )}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {currentScreen + 1} / {totalScreens}
                  </div>
                </div>
              </div>

              {/* Progress bar for auto-play */}
              {isPlaying && (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
