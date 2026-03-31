import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Hammer, MapPin } from 'lucide-react';

export const About = () => {
  return (
    <div className="pt-40 pb-32 min-h-screen bg-cream-50">
      <div className="container mx-auto px-6">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
          <div className="space-y-12">
            <header className="space-y-6">
              <span className="section-label">Our Story</span>
              <h1 className="text-6xl md:text-8xl font-serif text-walnut-950 tracking-tight leading-none">
                Handcrafted <br/> for Life.
              </h1>
            </header>
            <div className="space-y-8 text-lg font-light text-charcoal-700 leading-relaxed italic max-w-xl">
              <p>
                Space2Standard was born from a deep respect for the ancient craft of woodworking — 
                elevated with modern design principles to create furniture that is both functional 
                and breathtakingly beautiful.
              </p>
              <p>
                Each piece is handcrafted by our team of master artisans using only the finest 
                sustainably sourced hardwoods. We believe that furniture should be an heirloom — 
                built to last generations.
              </p>
            </div>
            <div className="flex gap-12 items-center border-t border-gold-500/10 pt-12">
               <div>
                  <p className="text-4xl font-serif text-walnut-950 tracking-wide">2018</p>
                  <p className="text-[10px] uppercase font-bold text-gold-500 tracking-widest mt-1">Founded</p>
               </div>
               <div>
                  <p className="text-4xl font-serif text-walnut-950 tracking-wide">12+</p>
                  <p className="text-[10px] uppercase font-bold text-gold-500 tracking-widest mt-1">Master Artisans</p>
               </div>
               <div>
                  <p className="text-4xl font-serif text-walnut-950 tracking-wide">500+</p>
                  <p className="text-[10px] uppercase font-bold text-gold-500 tracking-widest mt-1">Bespoke Pieces</p>
               </div>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-[4/5] bg-walnut-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">
               <img 
                 src="https://images.unsplash.com/photo-1541810271594-733f6ce5813f?q=80&w=2670&auto=format&fit=crop" 
                 alt="Artisan at work" 
                 className="w-full h-full object-cover grayscale opacity-70"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/80 via-transparent to-transparent" />
             </div>
             <div className="absolute -top-12 -right-12 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl z-0" />
             <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-walnut-800/10 rounded-full blur-3xl z-0" />
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-gold-500/10 pt-32 text-center">
          {[
            { icon: <ShieldCheck size={32} />, title: 'Quality', desc: 'Lietime guarantee on every joint and finish. Built to endure the test of time.' },
            { icon: <Heart size={32} />, title: 'Sustainability', desc: 'Environmentally conscious sourcing. 2 trees planted for every order delivered.' },
            { icon: <Hammer size={32} />, title: 'Authenticity', desc: 'Traditional artisan techniques. No mass-production, no compromises.' },
          ].map((item, idx) => (
            <motion.div 
               key={idx}
               whileHover={{ y: -10 }}
               className="space-y-6"
            >
              <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto text-gold-500 shadow-sm border border-gold-500/10">
                {item.icon}
              </div>
              <h3 className="text-2xl font-serif text-walnut-950 tracking-wide">{item.title}</h3>
              <p className="text-sm font-light text-charcoal-600 leading-relaxed italic">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
