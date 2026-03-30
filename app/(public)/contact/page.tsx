import { Mail, MapPin, Phone, Instagram, Facebook, MailOpen, ArrowRight, Hammer } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32 border-b border-[#c9a84c]/10 pb-16">
          <div className="space-y-6">
            <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Connect with Us</span>
            <h1 className="text-6xl md:text-9xl font-serif tracking-tight leading-none">Consultations</h1>
          </div>
          <p className="text-[#e8d5b7]/50 font-light max-w-xl text-lg md:text-2xl leading-relaxed italic">
            Your journey towards artisanal perfection begins with a conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-4 space-y-24">
            <div className="space-y-12">
              <h2 className="text-3xl font-serif text-[#e8d5b7] tracking-wide uppercase tracking-widest border-b border-[#c9a84c]/20 pb-8">
                The Workshop
              </h2>
              <div className="space-y-12">
                {[
                  { icon: MapPin, title: 'Our Location', content: '123 Artisan Way, Craftville, CT 06001' },
                  { icon: Phone, title: 'Artisan Support', content: '+1 (555) 123-4567' },
                  { icon: Mail, title: 'Inquiries', content: 'hello@space2standard.com' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="w-12 h-12 bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] group-hover:bg-[#c9a84c] group-hover:text-[#1a1a2e] transition duration-500">
                      <item.icon size={20} strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c] opacity-50">{item.title}</h3>
                      <p className="text-xl font-serif text-[#e8d5b7]">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#e8d5b7]/40">Social Channels</h2>
              <div className="flex gap-8">
                {[Instagram, Facebook, MailOpen].map((Icon, i) => (
                  <Link key={i} href="#" className="w-12 h-12 bg-[#16213e] border border-[#c9a84c]/10 flex items-center justify-center text-[#e8d5b7]/30 hover:text-[#c9a84c] hover:border-[#c9a84c] transition duration-500">
                    <Icon size={20} strokeWidth={1} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#16213e]/40 border border-[#c9a84c]/10 p-12 md:p-24 backdrop-blur-md shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a84c]/5 rounded-bl-full translate-x-48 -translate-y-48 group-hover:translate-x-32 group-hover:-translate-y-32 transition duration-1000" />
            <div className="space-y-12 relative z-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-serif tracking-tight">Request a Consult</h2>
                <p className="text-[#e8d5b7]/50 font-light max-w-xl text-lg italic leading-relaxed">
                  Tell us about your project, and our master craftsmen will get in touch with you.
                </p>
              </div>

              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Client Name</label>
                    <input className="w-full bg-transparent border-b border-[#c9a84c]/30 py-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light italic" placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Email Address</label>
                    <input className="w-full bg-transparent border-b border-[#c9a84c]/30 py-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light italic" placeholder="Enter your email address" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Inquiry Type</label>
                  <select className="w-full bg-transparent border-b border-[#c9a84c]/30 py-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light italic uppercase tracking-widest text-xs">
                    <option className="bg-[#1a1a2e]">Bespoke Furniture</option>
                    <option className="bg-[#1a1a2e]">Kitchen & Installation</option>
                    <option className="bg-[#1a1a2e]">Structural Carpentry</option>
                    <option className="bg-[#1a1a2e]">Restoration Project</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Your Message</label>
                  <textarea rows={6} className="w-full bg-transparent border-b border-[#c9a84c]/30 py-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light italic resize-none" placeholder="Describe your vision..." />
                </div>
                <div className="pt-12">
                  <button className="bg-[#c9a84c] text-[#1a1a2e] px-16 py-6 text-sm font-bold uppercase tracking-[0.3em] hover:bg-opacity-90 transition shadow-xl shadow-[#c9a84c]/10 flex items-center gap-6 group">
                    Send Message <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-40 text-center opacity-30">
          <Hammer className="mx-auto text-[#c9a84c] mb-8" size={64} strokeWidth={1} />
          <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Standard of Excellence Since 1998</p>
        </div>
      </div>
    </div>
  )
}
