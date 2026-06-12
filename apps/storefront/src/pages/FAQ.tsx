import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ScrollReveal } from '../components/ScrollReveal';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

export const FAQ = () => {
  const [faqs, setFaqs]         = useState<FaqItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    supabase
      .from('faqs')
      .select('id, question, answer, category, sort_order')
      .eq('is_active', true)
      .order('category')
      .order('sort_order')
      .then(({ data }) => {
        setFaqs(data ?? []);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...new Set(faqs.map(f => f.category))];
  const filtered   = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen bg-[#060b18] pt-[120px] pb-[160px]">
      {/* Hero */}
      <section className="container mx-auto px-6 mb-[100px] text-center">
        <ScrollReveal>
          <div className="space-y-6 max-w-2xl mx-auto">
            <div style={{ width: 64, height: 64, background: 'rgba(201,164,106,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <HelpCircle size={28} color="#c9a46a" />
            </div>
            <span style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase' }}>Common Questions</span>
            <h1
              className="text-white"
              style={{ ...sfDisplay, fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' }}
            >
              Frequently Asked Questions
            </h1>
            <p style={{ ...sfDisplay, color: '#a0a8b8', fontSize: 17, fontWeight: 400, lineHeight: 1.6 }}>
              Everything you need to know about bespoke furniture, ordering, and delivery.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="container mx-auto px-6 max-w-3xl">
        {/* Category filter */}
        {!loading && categories.length > 1 && (
          <ScrollReveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 48 }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...sfText,
                    padding: '8px 18px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.15s',
                    borderColor: activeCategory === cat ? '#c9a46a' : 'rgba(255,255,255,0.1)',
                    background:  activeCategory === cat ? 'rgba(201,164,106,0.12)' : 'transparent',
                    color:       activeCategory === cat ? '#c9a46a' : '#6a7080',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* FAQ list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#5a6070' }}>
            <p style={{ ...sfText, fontSize: 15 }}>No questions in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <ScrollReveal key={faq.id} delay={i * 0.04}>
                <div
                  style={{
                    background: expanded === faq.id ? 'rgba(201,164,106,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${expanded === faq.id ? 'rgba(201,164,106,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Question row */}
                  <button
                    onClick={() => toggle(faq.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '18px 20px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        ...sfText,
                        fontSize: 15,
                        fontWeight: 500,
                        color: expanded === faq.id ? '#fff' : '#c8d0e0',
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.question}
                    </span>
                    <span
                      style={{
                        color: '#c9a46a',
                        flexShrink: 0,
                        transform: expanded === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s',
                        display: 'flex',
                      }}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  {/* Answer */}
                  {expanded === faq.id && (
                    <div
                      style={{
                        padding: '0 20px 20px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <p
                        style={{
                          ...sfText,
                          fontSize: 15,
                          color: '#8a9ab0',
                          lineHeight: 1.7,
                          paddingTop: 16,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <ScrollReveal delay={0.2}>
            <div
              style={{
                marginTop: 80,
                background: 'rgba(201,164,106,0.06)',
                border: '1px solid rgba(201,164,106,0.15)',
                borderRadius: 20,
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <p style={{ ...sfDisplay, color: '#fff', fontSize: 21, fontWeight: 600, marginBottom: 8 }}>Still have questions?</p>
              <p style={{ ...sfText, color: '#6a7080', fontSize: 14, marginBottom: 24 }}>Our team is available Monday–Friday, 09:00–17:00.</p>
              <a href="/contact">
                <button
                  style={{
                    background: '#c9a46a',
                    color: '#000',
                    border: 'none',
                    borderRadius: 999,
                    padding: '12px 28px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...sfText,
                  }}
                >
                  Contact Us
                </button>
              </a>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
};
