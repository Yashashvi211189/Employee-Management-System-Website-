"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Laptop, Smartphone, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductDemoModal } from "@/components/product-demo-modal"

interface InteractiveProductPreviewProps {
  product: {
    id: string
    name: string
    description: string
    features: string[]
    demoScreens: {
      title: string
      description: string
      image: string
    }[]
  }
}

export function InteractiveProductPreview({ product }: InteractiveProductPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeDevice, setActiveDevice] = useState<"desktop" | "mobile">("desktop")

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="rounded-xl border border-border/40 bg-gradient-to-b from-background to-blue-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background p-1">
            <button
              onClick={() => setActiveDevice("desktop")}
              className={`flex h-8 items-center gap-1 rounded-full px-3 text-sm transition-all ${
                activeDevice === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setActiveDevice("mobile")}
              className={`flex h-8 items-center gap-1 rounded-full px-3 text-sm transition-all ${
                activeDevice === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        <div className="relative mb-6 aspect-video overflow-hidden rounded-lg border border-border/40 bg-muted shadow-inner">
          {/* Device Frame */}
          <div
            className={`relative h-full w-full transition-all duration-500 ${
              activeDevice === "mobile" ? "px-[30%]" : ""
            }`}
          >
            {/* Preview Image */}
            <img
              src={product.demoScreens[0].image || "/brand/abstract-grid.svg"}
              alt={`${product.name} preview`}
              className={`h-full w-full object-cover transition-all duration-500 ${
                activeDevice === "mobile" ? "rounded-xl" : ""
              }`}
            />

            {/* Mobile Frame */}
            {activeDevice === "mobile" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-[40%] rounded-[2rem] border-[8px] border-gray-800 bg-transparent">
                  <div className="absolute left-1/2 top-0 h-6 w-20 -translate-x-1/2 rounded-b-xl bg-gray-800"></div>
                </div>
              </div>
            )}

            {/* Play Button Overlay */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 hover:opacity-100"
              onClick={openModal}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Play className="h-8 w-8 fill-current pl-1" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 font-medium">Key Features:</h4>
          <ul className="space-y-2">
            {product.features.slice(0, 3).map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Plus className="mt-0.5 h-4 w-4 text-primary" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={openModal} className="group">
            Interactive Demo
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      <ProductDemoModal isOpen={isModalOpen} onClose={closeModal} product={product} />
    </>
  )
}
