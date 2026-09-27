import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SALON_FAQS } from '../data/salonData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-20 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DF] text-[11px] font-bold text-[#8C5D47] mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#C8957C]" />
            <span>Questions Fréquentes</span>
          </div>
          <h2 className="font-serif text-3xl font-medium text-[#2C2420]">
            Tout savoir avant votre venue
          </h2>
        </div>

        <div className="space-y-3">
          {SALON_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-medium text-sm text-[#2C2420]">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-[#8C7A70] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#9F674F]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-[#6E5B50] leading-relaxed border-t border-[#F0EAE1]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
