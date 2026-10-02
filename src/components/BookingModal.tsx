import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  CalendarCheck, 
  RefreshCw, 
  Send,
  Lock
} from 'lucide-react';
import { SalonService, Booking, UserProfile } from '../types/salon';
import { SALON_INFO } from '../data/salonData';
import { useAuth } from '../context/AuthContext';
import { BookingService } from '../services/bookingService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services?: SalonService[];
  practitioners?: UserProfile[];
  initialService?: SalonService | null;
  initialPractitioner?: string | null;
  onBookingSuccess: () => void;
  onOpenDashboard: () => void;
  onOpenAuthModal: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services = [],
  practitioners = [],
  initialService,
  initialPractitioner,
  onBookingSuccess,
  onOpenDashboard,
  onOpenAuthModal
}) => {
  const { 
    currentUser, 
    userProfile, 
    isEmailVerified, 
    resendVerificationEmail, 
    reloadUserStatus 
  } = useAuth();
  
  const isLoggedIn = Boolean(currentUser || userProfile);

  // Steps: 1: Service & Practitioner, 2: Date & Time, 3: Client Identity & Email Verification, 4: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedService, setSelectedService] = useState<SalonService | null>(
    initialService || (services.length > 0 ? services[0] : null)
  );
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>(
    initialPractitioner || 'Premier disponible'
  );
  
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 2);
    if (d.getDay() === 1) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowString());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00');
  
  // Client details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Loading & confirmation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  // Verification resend status
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Existing bookings to check availability
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = BookingService.subscribeAllBookings((list) => {
      setExistingBookings(list.filter(b => b.status === 'confirmed'));
    });
    return () => {
      if (unsub) unsub();
    };
  }, [isOpen]);

  // Helper to check if a practitioner has a confirmed booking at date and timeSlot
  const isPractitionerBookedAt = (practitionerName: string, date: string, timeSlot: string): boolean => {
    if (!practitionerName) return false;
    const target = practitionerName.toLowerCase().trim();
    return existingBookings.some((b) => {
      if (b.status !== 'confirmed') return false;
      if (b.date !== date || b.timeSlot !== timeSlot) return false;
      const bPrat = (b.practitioner || '').toLowerCase().trim();
      return bPrat === target || bPrat.includes(target) || target.includes(bPrat);
    });
  };

  const isAutoPractitioner = !selectedPractitioner || selectedPractitioner === 'Premier disponible';

  // Check if a time slot is available
  const isSlotAvailable = (slot: string, date: string = selectedDate): boolean => {
    if (isAutoPractitioner) {
      if (practitioners.length === 0) return true;
      return practitioners.some((p) => {
        const name = p.displayName || p.email.split('@')[0];
        return !isPractitionerBookedAt(name, date, slot);
      });
    } else {
      return !isPractitionerBookedAt(selectedPractitioner, date, slot);
    }
  };

  // Compute available practitioner for current date and slot
  const getAvailablePractitionerForSlot = (date: string, timeSlot: string): string => {
    if (practitioners.length === 0) return 'Praticienne de l\'institut';
    const free = practitioners.find((p) => {
      const name = p.displayName || p.email.split('@')[0];
      return !isPractitionerBookedAt(name, date, timeSlot);
    });
    if (free) {
      return free.displayName || free.email.split('@')[0];
    }
    return practitioners[0].displayName || practitioners[0].email.split('@')[0];
  };

  const effectivePractitioner = !isAutoPractitioner 
    ? selectedPractitioner 
    : getAvailablePractitionerForSlot(selectedDate, selectedTimeSlot);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    } else if ((!selectedService || !services.some(s => s.id === selectedService.id)) && services.length > 0) {
      setSelectedService(services[0]);
    }
  }, [initialService, services]);

  useEffect(() => {
    if (initialPractitioner) {
      setSelectedPractitioner(initialPractitioner);
    }
  }, [initialPractitioner, isOpen]);

  useEffect(() => {
    if (userProfile || currentUser) {
      if (!customerName) {
        setCustomerName(userProfile?.displayName || currentUser?.displayName || '');
      }
      if (!customerEmail) {
        setCustomerEmail(userProfile?.email || currentUser?.email || '');
      }
      if (!customerPhone && userProfile?.phone) {
        setCustomerPhone(userProfile.phone);
      }
    }
  }, [userProfile, currentUser]);

  const selectedDateObj = new Date(selectedDate);
  const isThursday = selectedDateObj.getDay() === 4;
  const isClosedDay = selectedDateObj.getDay() === 0 || selectedDateObj.getDay() === 1;

  const availableSlots = isThursday
    ? ['09:30', '10:45', '11:30', '14:00', '15:15', '16:30', '17:45', '18:45', '19:30']
    : ['09:30', '10:45', '11:30', '14:00', '15:15', '16:30', '17:45', '18:30'];

  // Automatically adjust selectedTimeSlot if current slot is taken
  useEffect(() => {
    if (!isClosedDay && !isSlotAvailable(selectedTimeSlot, selectedDate)) {
      const nextFree = availableSlots.find((s) => isSlotAvailable(s, selectedDate));
      if (nextFree) {
        setSelectedTimeSlot(nextFree);
      }
    }
  }, [selectedDate, selectedPractitioner, existingBookings, practitioners]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setBookingError(null);
    if (currentStep === 1) {
      if (!selectedService) {
        setBookingError("Veuillez sélectionner un soin avant de continuer.");
        return;
      }
    }
    if (currentStep === 2) {
      if (isClosedDay) {
        setBookingError("L'institut est fermé les dimanches et lundis. Veuillez choisir une date entre mardi et samedi.");
        return;
      }
      if (!isSlotAvailable(selectedTimeSlot, selectedDate)) {
        setBookingError("Ce créneau horaire n'est pas disponible pour cette praticienne. Veuillez en sélectionner un autre.");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setBookingError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Re-check verification
  const handleCheckEmailStatus = async () => {
    setIsVerifying(true);
    setResendStatus(null);
    try {
      const verified = await reloadUserStatus();
      if (verified) {
        setResendStatus("Adresse e-mail vérifiée ! Vous pouvez maintenant finaliser votre réservation.");
      } else {
        setBookingError("Votre e-mail n'a pas encore été vérifié. Cliquez sur le lien reçu dans votre messagerie puis réessayez.");
      }
    } catch (e: any) {
      setBookingError(e.message || "Erreur de vérification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setResendStatus("Un nouvel e-mail de validation vous a été adressé !");
    } catch (e: any) {
      setBookingError(e?.message || "Impossible de renvoyer l'e-mail pour le moment.");
    }
  };

  // Confirm booking (directly, without payment simulation!)
  const handleConfirmBooking = async () => {
    setBookingError(null);
    if (!selectedService) {
      setBookingError("Veuillez sélectionner un soin à réserver.");
      return;
    }
    if (!isLoggedIn) {
      setBookingError("Vous devez être connecté pour réserver un soin.");
      return;
    }
    if (!isEmailVerified) {
      setBookingError("Votre e-mail doit être vérifié pour valider définitivement la réservation.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setBookingError("Veuillez renseigner votre nom et votre numéro de téléphone.");
      return;
    }

    if (isPractitionerBookedAt(effectivePractitioner, selectedDate, selectedTimeSlot)) {
      setBookingError(`La praticienne ${effectivePractitioner} a déjà un rendez-vous le ${selectedDate} à ${selectedTimeSlot}. Veuillez choisir un autre créneau horaire.`);
      return;
    }

    setIsProcessing(true);

    try {
      const effectiveUserId = currentUser?.uid || userProfile?.userId || 'guest-' + Date.now();
      
      const newBooking = await BookingService.createBooking({
        userId: effectiveUserId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || currentUser?.email || '',
        customerPhone: customerPhone.trim(),
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        serviceCategory: selectedService.categoryName,
        durationMinutes: selectedService.durationMinutes,
        price: selectedService.price,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        practitioner: effectivePractitioner,
        notes: notes.trim(),
        status: 'confirmed',
      });

      setConfirmedBookingRef(newBooking.id);
      setIsProcessing(false);
      setCurrentStep(4); // Confirmation step
      onBookingSuccess();
    } catch (err: any) {
      console.warn('Booking notice:', err?.message || err);
      setIsProcessing(false);
      setBookingError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre rendez-vous.");
    }
  };

  const getGoogleCalendarUrl = () => {
    const sTitle = selectedService?.title || 'Soin';
    const sDuration = selectedService?.durationMinutes || 60;
    const title = encodeURIComponent(`Soin ${sTitle} - Un Moment pour Soi`);
    const details = encodeURIComponent(
      `Rendez-vous à l'institut Un Moment pour Soi avec ${effectivePractitioner}.\nAdresse: ${SALON_INFO.address}, ${SALON_INFO.city}\nTél: ${SALON_INFO.phone}\nDurée: ${sDuration} min`
    );
    const location = encodeURIComponent(`${SALON_INFO.name}, ${SALON_INFO.address}, ${SALON_INFO.city}`);
    const startIso = selectedDate.replace(/-/g, '') + 'T' + selectedTimeSlot.replace(':', '') + '00';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${startIso}&details=${details}&location=${location}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E8DFC8] relative my-4 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 sm:p-6 border-b border-[#E8DFC8] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8957C]"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5D47]">
                Réservation de Soin
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2420] mt-0.5">
              {currentStep === 4 ? "Rendez-vous Confirmé !" : "Votre parenthèse à l'institut"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center border border-[#DDD3C1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {currentStep < 4 && (
          <div className="bg-white px-6 pt-4 pb-2 border-b border-[#F0EAE1]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8C7A70]">
              <span className={currentStep >= 1 ? 'text-[#9F674F] font-bold' : ''}>1. Soin & Praticienne</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DDD3C1]" />
              <span className={currentStep >= 2 ? 'text-[#9F674F] font-bold' : ''}>2. Date & Heure</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DDD3C1]" />
              <span className={currentStep >= 3 ? 'text-[#9F674F] font-bold' : ''}>3. Compte & Validation</span>
            </div>
            <div className="w-full bg-[#F3ECE2] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#C8957C] to-[#9F674F] h-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Error Banner */}
          {bookingError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Success Banner */}
          {resendStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resendStatus}</span>
            </div>
          )}

          {/* ================= STEP 1: SERVICE & PRACTITIONER ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                  1. Sélectionner votre prestation
                </label>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {services.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8C7A70] bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]">
                      Aucune prestation n'est actuellement disponible à la réservation en ligne.
                    </div>
                  ) : (
                    services.map((svc) => (
                      <div
                        key={svc.id}
                        onClick={() => setSelectedService(svc)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedService?.id === svc.id
                            ? 'border-[#9F674F] bg-[#FAF7F2] ring-1 ring-[#9F674F]'
                            : 'border-[#E8DFC8] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={svc.image} 
                            alt={svc.title} 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#2C2420]">{svc.title}</h4>
                            <span className="text-[11px] text-[#8C7A70] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#C8957C]" />
                              {svc.durationMinutes} min • {svc.categoryName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-serif text-base font-bold text-[#9F674F]">{svc.price} €</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                  2. Choisir votre praticienne
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setSelectedPractitioner('Premier disponible')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isAutoPractitioner
                        ? 'border-[#9F674F] bg-[#FAF7F2] ring-1 ring-[#9F674F]'
                        : 'border-[#E8DFC8] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAE0D3] flex items-center justify-center text-[#8C5D47] font-bold text-xs shrink-0 shadow-2xs">
                      ✨
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2C2420]">Premier disponible</p>
                      <p className="text-[11px] text-[#9F674F] font-semibold">
                        Assignation automatique : {effectivePractitioner}
                      </p>
                    </div>
                  </div>

                  {practitioners.map((prat) => {
                    const name = prat.displayName || prat.email.split('@')[0];
                    const initials = name.slice(0, 2).toUpperCase();
                    const isSelected = selectedPractitioner === name;
                    return (
                      <div
                        key={prat.userId}
                        onClick={() => setSelectedPractitioner(name)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#9F674F] bg-[#FAF7F2] ring-1 ring-[#9F674F]'
                            : 'border-[#E8DFC8] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E2B7A0] to-[#9F674F] text-white flex items-center justify-center font-serif text-xs font-bold shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2C2420] truncate">{name}</p>
                          <p className="text-[10px] text-[#C8957C] font-semibold uppercase tracking-wider">Praticienne</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 2: DATE & TIME ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                  Sélectionner la date du soin
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#DDD3C1] text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#C8957C]"
                />
                <p className="text-[11px] text-[#8C7A70] mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#C8957C]" />
                  Institut ouvert du mardi au samedi dès 09h30. Fermé dimanche et lundi.
                  {isThursday && <span className="font-semibold text-[#8C5D47]">• Nocturne jusqu'à 20h30 le jeudi !</span>}
                </p>
              </div>

              {isClosedDay ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  L'institut est fermé les dimanches et lundis. Veuillez sélectionner un jour entre mardi et samedi.
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                    Créneaux disponibles pour {effectivePractitioner}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isAvailable = isSlotAvailable(slot, selectedDate);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => isAvailable && setSelectedTimeSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all relative ${
                            !isAvailable
                              ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-60'
                              : selectedTimeSlot === slot
                              ? 'bg-[#2C2420] text-white shadow-sm ring-2 ring-[#9F674F]'
                              : 'bg-white border border-[#E0D5C3] text-[#5A4D45] hover:bg-[#FAF7F2] hover:border-[#C8957C] cursor-pointer'
                          }`}
                        >
                          <span>{slot}</span>
                          {!isAvailable && (
                            <span className="block text-[9px] font-normal text-red-500 no-underline tracking-tighter">
                              Occupé
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary box */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs text-[#5A4D45] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#2C2420] block">{selectedService?.title || 'Prestation'}</span>
                  <span className="font-semibold text-[#9F674F]">
                    Praticienne : {effectivePractitioner} {isAutoPractitioner && '(Disponible pour cette date)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-[#9F674F] block">{selectedDate} à {selectedTimeSlot}</span>
                  <span>{selectedService?.durationMinutes || 60} min • {selectedService?.price || 0} €</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 3: IDENTITY & EMAIL VERIFICATION ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              
              {/* Check 1: User Logged In? */}
              {!isLoggedIn ? (
                <div className="p-5 rounded-2xl bg-[#F5EFE6] border border-[#E0D5C3] space-y-3">
                  <div className="flex items-start gap-2.5">
                    <User className="w-5 h-5 text-[#9F674F] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2C2420]">
                        Connexion ou Création de compte requise
                      </h4>
                      <p className="text-[11px] text-[#6E5B50] mt-0.5 leading-relaxed">
                        Pour réserver une offre, vous devez vous connecter avec votre adresse e-mail et mot de passe, 
                        puis vérifier votre compte via le lien de confirmation envoyé par e-mail.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="w-full py-3 px-4 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs text-center"
                  >
                    Se connecter / Créer mon compte
                  </button>
                </div>
              ) : !isEmailVerified ? (
                /* Check 2: Email Verified? */
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Vérification de l'adresse e-mail obligatoire
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Votre compte est associé à : <strong>{currentUser?.email || userProfile?.email}</strong>.<br />
                        La réservation est validée uniquement après avoir cliqué sur le lien de confirmation envoyé par Firebase.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCheckEmailStatus}
                      disabled={isVerifying}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                      <span>J'ai cliqué sur le lien (Actualiser)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="py-2.5 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Renvoyer l'e-mail</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Verified Badge */
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-900">
                      Compte vérifié : {userProfile?.displayName || currentUser?.displayName} ({currentUser?.email || userProfile?.email})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Validé
                  </span>
                </div>
              )}

              {/* Client form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Camille Roussel"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Numéro de Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Précisions / Remarques (Optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informations utiles pour votre praticienne, allergies éventuelles..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                />
              </div>

              {/* Booking terms reminder */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs text-[#6E5B50] space-y-1">
                <p className="font-semibold text-[#2C2420] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C8957C]" />
                  <span>Règlement sur place le jour du rendez-vous</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Votre créneau est immédiatement bloqué pour vous. Vous pourrez régler en carte bancaire, chèque ou espèces à l'institut. 
                  Annulation ou report sans frais depuis votre espace client.
                </p>
              </div>

            </div>
          )}

          {/* ================= STEP 4: CONFIRMATION SUCCESS ================= */}
          {currentStep === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in-50">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="max-w-md mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Réservation validée avec succès
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2420] mt-1">
                  Nous avons hâte de vous recevoir !
                </h3>
                <p className="text-xs text-[#6E5B50] mt-2">
                  Votre rendez-vous a bien été confirmé dans le planning de l'institut. 
                  Un récapitulatif a été transmis à votre adresse e-mail vérifiée.
                </p>
              </div>

              {/* Booking Ticket */}
              <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8DFC8] text-left max-w-md mx-auto space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8DFC8]">
                  <span className="text-[11px] font-bold text-[#8C7A70] uppercase">Référence réservation</span>
                  <span className="font-mono text-xs font-bold text-[#2C2420] bg-white px-2 py-0.5 rounded border border-[#DDD3C1]">
                    {confirmedBookingRef}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#463B34]">
                  <p><span className="text-[#8C7A70]">Soin :</span> <strong className="text-[#2C2420]">{selectedService?.title || 'Prestation'}</strong></p>
                  <p><span className="text-[#8C7A70]">Praticienne :</span> <strong>{effectivePractitioner}</strong></p>
                  <p><span className="text-[#8C7A70]">Date & Heure :</span> <strong>{selectedDate} à {selectedTimeSlot}</strong> ({selectedService?.durationMinutes || 60} min)</p>
                  <p><span className="text-[#8C7A70]">Montant :</span> <strong>{selectedService?.price || 0} € TTC</strong> (Règlement le jour de la séance)</p>
                  <p><span className="text-[#8C7A70]">Adresse :</span> <strong>{SALON_INFO.address}, {SALON_INFO.city}</strong></p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-white border border-[#DDD3C1] hover:border-[#C8957C] text-xs font-semibold text-[#2C2420] flex items-center justify-center gap-2 shadow-2xs transition-colors"
                >
                  <CalendarCheck className="w-4 h-4 text-[#C8957C]" />
                  <span>Ajouter à Google Agenda</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDashboard();
                  }}
                  className="py-3 px-4 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Voir mes rendez-vous
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {currentStep < 4 && (
          <div className="bg-[#FAF7F2] p-4 sm:p-5 border-t border-[#E8DFC8] flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#5A4D45] hover:bg-white border border-[#DDD3C1] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8C7A70] hover:text-[#2C2420] transition-colors"
              >
                Annuler
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continuer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isProcessing || !isLoggedIn || !isEmailVerified}
                className="py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validation en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmer ma réservation ({selectedService?.price || 0} €)</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
