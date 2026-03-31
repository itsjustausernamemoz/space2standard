import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero_lux.png" 
            alt="Artisan Carpentry Workshop" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-charcoal-900/40 to-cream-50" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 space-y-12 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="section-label text-gold-400">Excellence in Craftsmanship</span>
            <h1 className="text-7xl md:text-9xl font-serif text-walnut-950 tracking-tight leading-none">
              Space<span className="text-gold-500 italic">2</span>Standard
            </h1>
            <p className="text-lg md:text-2xl font-light uppercase tracking-[0.4em] text-walnut-800/80 max-w-3xl mx-auto">
              Bespoke furniture crafted to your vision. <br className="hidden md:inline" /> Built to last generations.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link to="/order">
              <Button size="xl" variant="primary">
                Order a Piece
              </Button>
            </Link>
            <Link to="/products">
              <Button size="xl" variant="outline" className="border-walnut-800 text-walnut-800 hover:bg-walnut-800 hover:text-gold-300">
                Explore Collection
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-40"
        >
          <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-gold-500 to-transparent" />
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-40 px-6 container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
          <div className="space-y-6">
            <span className="section-label">Our Masterpieces</span>
            <h2 className="text-5xl md:text-7xl font-serif text-walnut-950 tracking-tight">Featured Collection</h2>
          </div>
          <Link to="/products" className="group flex items-center gap-3 text-gold-600 uppercase text-xs font-bold tracking-[0.2em] pb-2 border-b border-gold-500/20 hover:border-gold-500 transition-all">
            Browse All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-center justify-center">
            {/* Reusing Home logic but simplified for now */}
            <p className="text-charcoal-500 italic col-span-full">High-quality product photography coming soon from our artisans.</p>
        </div>
      </section>

      {/* Trust / Process Section */}
      <section className="py-40 bg-walnut-800 text-gold-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold-500/5 -skew-x-12 translate-x-1/2" />
        
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <span className="section-label text-gold-500">The Artisan Way</span>
              <h2 className="text-5xl md:text-7xl font-serif tracking-tight leading-tight">From Tree <br/> to Table</h2>
              <p className="text-lg font-light leading-relaxed text-gold-300/80">
                At Space2Standard, we don't just build furniture; we curate masterpieces. 
                Our process combines ancient woodworking techniques with modern precision to 
                create pieces that are as functional as they are beautiful.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { title: 'Sustainably Sourced', desc: 'We only use premium hardwoods from certified sustainable forests.' },
                { title: 'Hand-Rubbed Finishes', desc: 'Natural oils and waxes that age gracefully over decades.' },
                { title: 'Bespoke Engineering', desc: 'Intricate joinery that removes the need for visible screws.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border border-gold-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-gold-500" size={20} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif tracking-wide">{item.title}</h3>
                    <p className="text-sm font-light opacity-60 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <div className="aspect-square bg-gold-500/10 border border-gold-500/20 rounded-2xl rotate-3 absolute inset-0 translate-x-4 translate-y-4" />
            <div className="aspect-square relative rounded-2xl overflow-hidden glass border-gold-500/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-walnut-950/40 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1581429035334-080b4334313f?q=80&w=2670&auto=format&fit=crop" 
                alt="Wood grain texture" 
                className="w-full h-full object-cover grayscale opacity-80"
              />
              <div className="absolute bottom-12 left-12 z-20 space-y-4">
                <div className="flex gap-1 text-gold-500">
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-2xl font-serif italic text-white leading-tight">
                  "Exceeded all my expectations. <br/> A true heirloom."
                </p>
                <p className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                  — Marc J. Kapstadt
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-60 bg-cream-50 text-center relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-4xl space-y-16">
          <h2 className="text-5xl md:text-8xl font-serif text-walnut-950 tracking-tight leading-[1.1]">
            Elevate your space with <span className="text-gold-500 italic">excellence</span>
          </h2>
          <div className="gold-divider" />
          <p className="text-xl font-light text-charcoal-600 tracking-wide">
            Our artisans are ready to bring your vision to life.
          </p>
          <Link to="/order">
            <Button size="xl" variant="primary" className="px-16">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
