"use client"
import { API_URL } from '@/lib/config';
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  created_at: string;
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  // Fetch gallery data from API
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/gallery/`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch gallery data')
        }
        
        const data = await response.json()
        setGalleryItems(data)
      } catch (err) {
        console.error('Error fetching gallery data:', err)
        setError('Failed to load gallery images')
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryData()
  }, [API_URL])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  }

  // Group and sort gallery items by category with proper order
  const groupedByCategory = galleryItems
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Oldest first
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GalleryItem[]>);

  // Define the category order
  const categoryOrder = ['office', 'events', 'celebration', 'others'];
  const categories = categoryOrder.filter(category => groupedByCategory[category]);

  const openModal = (index: number) => {
    setSelectedImage(index)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % galleryItems.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? galleryItems.length - 1 : selectedImage - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center">
        <div className="container px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading gallery...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center">
        <div className="container px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-lg text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30">
        <div className="container px-4 md:px-6 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Gallery</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Explore our modern office spaces, team celebrations, and collaborative work environment
            </p>
            {/* <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize"
                >
                  {category === 'office' ? 'Office Spaces' :
                   category === 'events' ? 'Company Events' :
                   category === 'celebration' ? 'Celebrations' : 'Others'}: {groupedByCategory[category].length}
                </span>
              ))}
            </div> */}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No gallery images found.</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category} className="mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold mb-8 text-center"
                >
                  {category === 'office' ? 'Office Spaces' :
                   category === 'events' ? 'Company Events' :
                   category === 'celebration' ? 'Celebrations' : 'Other Gallery Items'}
                </motion.h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {groupedByCategory[category].map((item, i) => (
                    <motion.div 
                      key={item.id} 
                      variants={itemVariants} 
                      whileHover={{ scale: 1.02 }} 
                      className="group cursor-pointer"
                      onClick={() => {
                        // Find the global index for modal navigation
                        const globalIndex = galleryItems.findIndex(g => g.id === item.id)
                        openModal(globalIndex)
                      }}
                    >
                      <Card className="overflow-hidden border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur transition-all hover:shadow-xl">
                        <div className="relative h-64 overflow-hidden">
                          <Image
                            src={
                              item.image?.startsWith('http') 
                                ? item.image 
                                : `${API_URL}${item.image}`
                            }
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-white font-bold text-lg">{item.title || "Untitled"}</h3>
                            <p className="text-white/80 text-sm">{item.description || "No description"}</p>
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">{item.title || "Untitled"}</h3>
                            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                              {category === 'office' ? 'Office' :
                               category === 'events' ? 'Event' :
                               category === 'celebration' ? 'Celebration' : 'Other'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {item.description || "No description"}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage !== null && galleryItems[selectedImage] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-6xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={
                  galleryItems[selectedImage].image?.startsWith('http') 
                    ? galleryItems[selectedImage].image 
                    : `${API_URL}${galleryItems[selectedImage].image}`
                }
                alt={galleryItems[selectedImage].title || "Gallery Image"}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
              <h3 className="text-xl font-bold mb-2">{galleryItems[selectedImage].title || "Untitled"}</h3>
              <p className="text-white/80">{galleryItems[selectedImage].description || "No description"}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/60 text-sm capitalize">
                  {galleryItems[selectedImage].category === 'office' ? 'Office Space' :
                   galleryItems[selectedImage].category === 'events' ? 'Company Event' :
                   galleryItems[selectedImage].category === 'celebration' ? 'Celebration' : 'Other'}
                </span>
                <span className="text-white/60 text-sm">
                  {selectedImage + 1} of {galleryItems.length}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
