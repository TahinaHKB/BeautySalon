import React from 'react';
import { PRACTITIONERS } from '../data/salonData';
import { Sparkles, Award, Heart } from 'lucide-react';

interface PractitionersSectionProps {
  onSelectPractitioner: (practitionerName: string) => void;
}

export const PractitionersSection: React.FC<PractitionersSectionProps> = ({
  onSelectPractitioner
}) => {
  return (
    <section id="team" className="py-16 sm:py-20 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE9DF] text-xs font-semibold text-[#8C5D47] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C8957C]" />
            <span>Des mains expertes & bienveillantes</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2C2420] tracking-tight">
            Rencontrez nos praticiennes d'exception
          </h2>
          <p className="mt-3 text-base text-[#6E5B50]">
            Chaque membre de notre équipe est diplômé d'État et suit des formations continues 
            aux dernières techniques esthétiques et rituels de relaxation.
          </p>
        </div>

        {/* Practitioners cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRACTITIONERS.map((practitioner) => (
            <div 
              key={practitioner.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] overflow-hidden bg-[#FAF7F2] relative">
                  <img
                    src={practitioner.avatar}
                    alt={practitioner.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-[#8C5D47] flex items-center gap-1 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-[#C8957C]" />
                    <span>{practitioner.experience}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-[#2C2420]">
                    {practitioner.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#C8957C] mt-0.5">
                    {practitioner.role}
                  </p>

                  <p className="text-xs text-[#5A4D45] mt-3 leading-relaxed">
                    {practitioner.bio}
                  </p>

                  {/* Specialties tags */}
                  <div className="mt-4 pt-4 border-t border-[#F0EAE1]">
                    <span className="block text-[11px] font-semibold text-[#8C7A70] uppercase tracking-wider mb-2">
                      Spécialités de prédilection
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {practitioner.specialties.map((spec, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 text-[11px] rounded-md bg-[#FAF7F2] text-[#5A4D45] border border-[#E8DFC8]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => onSelectPractitioner(practitioner.name)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#2C2420] bg-[#FAF7F2] border border-[#DDD3C1] hover:bg-[#C8957C] hover:text-white hover:border-[#C8957C] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Prendre rendez-vous avec {practitioner.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
