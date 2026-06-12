import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    supabase.from('faqs').select('id, question, answer, category, sort_order')
      .eq('is_active', true).order('category').order('sort_order')
      .then(({ data }) => { setFaqs(data ?? []); setLoading(false); });
  }, []);

  const categories = ['All', ...new Set(faqs.map(f => f.category))];
  const filtered   = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#060b18]" style={{ paddingTop: 88, paddingBottom: 100 }}>
      <div className="max-w-[720px] mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <h1 style={{ ...sfDisplay, color: '#fff', fontSize: 34, fontWeight: 600, letterSpacing: '-0.4px' }}>FAQs</h1>
          <p style={{ ...sfText, color: '#5a6070', fontSize: 14, marginTop: 6 }}>Common questions about bespoke furniture, ordering, and delivery.</p>
        </div>

        {/* Category filter */}
        {!loading && categories.length > 2 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...sfText,
                  padding: '6px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.15s',
                  borderColor: activeCategory === cat ? '#c9a46a' : 'rgba(255,255,255,0.1)',
                  background:  activeCategory === cat ? 'rgba(201,164,106,0.1)' : 'transparent',
                  color:       activeCategory === cat ? '#c9a46a' : '#6a7080',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 24 }} />

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} style={{ height: 56, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ ...sfText, color: '#3a4050', fontSize: 14, fontStyle: 'italic', padding: '40px 0' }}>No questions in this category yet.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(faq => (
              <div
                key={faq.id}
                style={{
                  background: expanded === faq.id ? 'rgba(201,164,106,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${expanded === faq.id ? 'rgba(201,164,106,0.18)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={() => setExpanded(prev => prev === faq.id ? null : faq.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ flex: 1, ...sfText, fontSize: 14, fontWeight: 500, color: expanded === faq.id ? '#fff' : '#c8d0e0', lineHeight: 1.4 }}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    color="#c9a46a"
                    style={{ flexShrink: 0, transform: expanded === faq.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  />
                </button>
                {expanded === faq.id && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ ...sfText, fontSize: 14, color: '#8a9ab0', lineHeight: 1.7, paddingTop: 14, whiteSpace: 'pre-wrap' }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Still have questions */}
        {!loading && (
          <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ ...sfDisplay, color: '#fff', fontSize: 17, fontWeight: 600 }}>Still have questions?</p>
              <p style={{ ...sfText, color: '#5a6070', fontSize: 13, marginTop: 4 }}>Mon–Fri, 09:00–17:00</p>
            </div>
            <a href="/contact">
              <button style={{ ...sfText, background: 'rgba(201,164,106,0.1)', border: '1px solid rgba(201,164,106,0.25)', borderRadius: 999, padding: '10px 22px', color: '#c9a46a', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Contact us
              </button>
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
