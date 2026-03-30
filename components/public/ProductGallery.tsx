'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

export default function ProductGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)

  if (images.length === 0) return (
    <div className="aspect-square bg-[#16213e] flex items-center justify-center border border-[#c9a84c]/10 opacity-30">
      <span className="text-xs uppercase tracking-widest font-bold">No Image Available</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="relative aspect-square bg-[#16213e] border border-[#c9a84c]/10 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Image
              src={images[index]}
              alt="Product View"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setIndex((index - 1 + images.length) % images.length)}
              className="w-12 h-12 bg-[#1a1a2e]/60 backdrop-blur-md text-[#e8d5b7] hover:bg-[#c9a84c] hover:text-[#1a1a2e] transition flex items-center justify-center rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setIndex((index + 1) % images.length)}
              className="w-12 h-12 bg-[#1a1a2e]/60 backdrop-blur-md text-[#e8d5b7] hover:bg-[#c9a84c] hover:text-[#1a1a2e] transition flex items-center justify-center rounded-full"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`relative aspect-square border-2 transition-all duration-300 ${index === i ? 'border-[#c9a84c]' : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
