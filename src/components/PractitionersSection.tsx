import React from 'react';
import { UserProfile } from '../types/salon';
import { Sparkles, Award, Heart, User, CheckCircle2 } from 'lucide-react';

interface PractitionersSectionProps {
  onSelectPractitioner: (practitionerName: string) => void;
  practitioners?: UserProfile[];
  isLoading?: boolean;
}

export const PractitionersSection: React.FC<PractitionersSectionProps> = ({
  onSelectPractitioner,
  practitioners = [],
  isLoading = false
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'PS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

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

        {/* Loading state */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#8C7A70]">
            Chargement de l'équipe de l'institut...
          </div>
        ) : practitioners.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl p-10 border border-[#E8DFC8] text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF3EC] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-4 text-[#9F674F]">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C2420]">Notre Équipe de Praticiennes</h3>
            <p className="text-xs text-[#6E5B50] mt-1.5 leading-relaxed">
              Nos praticiennes préparent leurs rituels. Vous pouvez réserver vos créneaux en ligne dès maintenant.
            </p>
          </div>
        ) : (
          /* Practitioners cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {practitioners.map((practitioner) => {
              const displayName = practitioner.displayName || practitioner.email.split('@')[0] || 'Praticienne';
              const initials = getInitials(displayName);
              const specialties = practitioner.specialties && practitioner.specialties.length > 0 
                ? practitioner.specialties 
                : ['Soins Visage & Anti-Âge', 'Massages & Relaxation', 'Rituels Bien-Être'];

              return (
                <div 
                  key={practitioner.userId}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div className="p-7">
                    {/* Stylized Monogram Avatar */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E2B7A0] to-[#9F674F] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md ring-4 ring-[#FAF7F2] shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-serif text-lg font-bold text-[#2C2420]">
                            {displayName}
                          </h3>
                          <span title="Praticienne Certifiée" className="inline-flex">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full bg-[#FAF3EC] border border-[#E8DFC8] text-[10px] font-bold text-[#8C5D47] uppercase tracking-wider">
                          Praticienne de l'Institut
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5A4D45] leading-relaxed">
                      {practitioner.bio || "Praticienne qualifiée et passionnée, dédiée à votre confort et à votre mise en beauté personnalisée."}
                    </p>

                    {/* Specialties tags */}
                    <div className="mt-5 pt-4 border-t border-[#F0EAE1]">
                      <span className="block text-[11px] font-semibold text-[#8C7A70] uppercase tracking-wider mb-2">
                        Spécialités de prédilection
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {specialties.map((spec, i) => (
                          <span 
                            key={i}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-[#FAF7F2] text-[#5A4D45] border border-[#E8DFC8] font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => onSelectPractitioner(displayName)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#2C2420] bg-[#FAF7F2] border border-[#DDD3C1] hover:bg-[#9F674F] hover:text-white hover:border-[#9F674F] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#C8957C] group-hover:text-white" />
                      <span>Prendre rendez-vous avec {displayName.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
