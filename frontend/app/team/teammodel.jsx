import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Calendar, GraduationCap, Briefcase, Award, Linkedin, Twitter, Github, Mail, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useState } from "react"

export default function TeamModal({ member, isOpen, onClose }) {
  const [imageScale, setImageScale] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  if (!member) return null

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.5, 0.5))
  }

  const handleReset = () => {
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (imageScale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && imageScale > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (imageScale > 1) {
      setIsDragging(true)
      const touch = e.touches[0]
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y
      })
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging && imageScale > 1) {
      e.preventDefault()
      const touch = e.touches[0]
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
              {/* Image Section */}
              <div className="relative lg:w-1/2 h-64 sm:h-80 lg:h-auto lg:min-h-[500px] flex-shrink-0 overflow-hidden">
                {/* Zoom Controls */}
                <div className="absolute top-4 right-16 z-20 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 bg-white/90 hover:bg-white"
                    onClick={handleZoomOut}
                    disabled={imageScale <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 bg-white/90 hover:bg-white"
                    onClick={handleZoomIn}
                    disabled={imageScale >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 bg-white/90 hover:bg-white"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Image Container with Zoom */}
                <div 
                  className="relative w-full h-full overflow-auto cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ 
                    overflow: imageScale > 1 ? 'auto' : 'hidden'
                  }}
                >
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                    }}
                  >
                    <Image
                      src={member.image || "/brand/avatar.svg"}
                      alt={member.name}
                      width={400}
                      height={400}
                      className="object-contain max-w-full max-h-full"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 pointer-events-none" />
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <Badge className="bg-primary/90 text-white">
                    {member.department}
                  </Badge>
                  {member.achievements && member.achievements.slice(0, 2).map((achievement, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                      <Award className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>

                {/* Join Date */}
                <div className="absolute bottom-4 right-4 z-10">
                  <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    Since {member.joinDate}
                  </div>
                </div>

                {/* Zoom Level Indicator */}
                {imageScale !== 1 && (
                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                      {Math.round(imageScale * 100)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="lg:w-1/2 p-4 lg:p-8 overflow-y-auto flex-1 min-h-0">
                <div className="space-y-4 lg:space-y-6 pb-4">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{member.name}</h2>
                    <p className="text-lg lg:text-xl text-primary font-semibold mb-4">{member.role}</p>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm lg:text-base">{member.location}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                      {member.longBio || member.bio}
                    </p>
                  </div>

                  {/* Education */}
                  {member.education && (
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 lg:w-5 lg:h-5" />
                        Education
                      </h3>
                      <p className="text-sm lg:text-base text-gray-700">{member.education}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {member.experience && (
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 lg:w-5 lg:h-5" />
                        Experience
                      </h3>
                      <p className="text-sm lg:text-base text-gray-700">{member.experience}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {member.skills && (
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs lg:text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {member.social && (
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">Connect</h3>
                      <div className="flex gap-2 lg:gap-3">
                        {Object.entries(member.social).map(([platform, url]) => {
                          const Icon = platform === "linkedin" ? Linkedin : 
                                      platform === "twitter" ? Twitter : 
                                      platform === "github" ? Github : Mail
                          return (
                            <Button
                              key={platform}
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full hover:bg-primary hover:text-white transition-colors"
                            >
                              <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
