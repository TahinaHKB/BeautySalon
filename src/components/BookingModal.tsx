import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  ChevronRight,
  Info,
  CalendarCheck
} from 'lucide-react';
import { SalonService, Practitioner } from '../types/salon';
import { SALON_SERVICES, PRACTITIONERS, SALON_INFO } from '../data/salonData';
import { useAuth } from '../context/AuthContext';
import { BookingService } from '../services/bookingService';
import { processSimulatedPayment, PaymentDetails } from '../services/stripeService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: SalonService | null;
  initialPractitioner?: string | null;
  onBookingSuccess: () => void;
  onOpenDashboard: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialService,
  initialPractitioner,
  onBookingSuccess,
  onOpenDashboard
}) => {
  const { currentUser, userProfile, loginWithGoogle, loginWithDemoAccount } = useAuth();
  const isLoggedIn = Boolean(currentUser || userProfile);

  // Steps: 1: Service & Practitioner, 2: Date & Time, 3: Contact & Notes, 4: Payment, 5: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedService, setSelectedService] = useState<SalonService>(
    initialService || SALON_SERVICES[0]
  );
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>(
    initialPractitioner || 'Premier disponible'
  );
  
  // Date selection (default tomorrow or next open day)
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    // If sunday (0) or monday (1), skip to tuesday
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

  // Payment Details (Simulated Stripe)
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [postalCode, setPostalCode] = useState('91220');

  // Loading & confirmation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  // Sync initial service & user info
  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    if (initialPractitioner) {
      setSelectedPractitioner(initialPractitioner);
    }
  }, [initialPractitioner]);

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
      if (!cardHolder) {
        setCardHolder(userProfile?.displayName || currentUser?.displayName || '');
      }
    }
  }, [userProfile, currentUser]);

  if (!isOpen) return null;

  // Generate available time slots based on selected date
  const selectedDateObj = new Date(selectedDate);
  const isThursday = selectedDateObj.getDay() === 4;
  const isClosedDay = selectedDateObj.getDay() === 0 || selectedDateObj.getDay() === 1;

  const availableSlots = isThursday
    ? ['09:30', '10:45', '11:30', '14:00', '15:15', '16:30', '17:45', '18:45', '19:30']
    : ['09:30', '10:45', '11:30', '14:00', '15:15', '16:30', '17:45', '18:30'];

  // Fill test card (Stripe test credentials)
  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiryDate('12/28');
    setCvc('424');
    setPostalCode('91220');
    if (!cardHolder) setCardHolder('Camille Client');
  };

  const handleNextStep = () => {
    setBookingError(null);
    if (currentStep === 2) {
      if (isClosedDay) {
        setBookingError("L'institut est fermé les dimanches et lundis. Veuillez choisir du mardi au samedi.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!customerName.trim() || !customerPhone.trim()) {
        setBookingError("Veuillez renseigner votre nom et votre numéro de téléphone pour le rappel du rendez-vous.");
        return;
      }
      if (!customerEmail.trim()) {
        setBookingError("Veuillez renseigner un email valide pour recevoir la confirmation de réservation.");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setBookingError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Process Booking and Payment
  const handleConfirmAndPay = async () => {
    setBookingError(null);
    setIsProcessing(true);
    setProcessingStatusText("Autorisation du paiement sécurisé...");

    try {
      // 1. Process simulated card payment with Stripe validation
      const paymentDetails: PaymentDetails = {
        cardHolder,
        cardNumber,
        expiryDate,
        cvc,
        postalCode,
      };

      const paymentResult = await processSimulatedPayment(
        paymentDetails,
        selectedService.price,
        selectedService.title
      );

      setProcessingStatusText("Paiement validé. Enregistrement de votre créneau...");

      // 2. Prepare booking payload
      const effectiveUserId = currentUser?.uid || userProfile?.userId || 'guest-' + Date.now();
      
      const newBooking = await BookingService.createBooking({
        userId: effectiveUserId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        serviceCategory: selectedService.categoryName,
        durationMinutes: selectedService.durationMinutes,
        price: selectedService.price,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        practitioner: selectedPractitioner,
        notes: notes.trim(),
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: paymentResult.paymentMethod,
        paymentTransactionId: paymentResult.transactionId,
      });

      setConfirmedBookingRef(newBooking.id);
      setIsProcessing(false);
      setCurrentStep(5); // Show confirmation step
      onBookingSuccess();
    } catch (err: any) {
      console.error('Booking failed:', err);
      setIsProcessing(false);
      setBookingError(err?.message || "Une erreur est survenue lors de la validation du paiement.");
    }
  };

  // Google Calendar shortcut
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Soin ${selectedService.title} - Un Moment pour Soi`);
    const details = encodeURIComponent(
      `Rendez-vous à l'institut Un Moment pour Soi avec ${selectedPractitioner}.\nAdresse: ${SALON_INFO.address}, ${SALON_INFO.city}\nTél: ${SALON_INFO.phone}\nDurée: ${selectedService.durationMinutes} min`
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
                Réservation en ligne
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2420] mt-0.5">
              {currentStep === 5 ? "Réservation Confirmée !" : "Réserver votre parenthèse bien-être"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center border border-[#DDD3C1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar (hidden on confirmation) */}
        {currentStep < 5 && (
          <div className="bg-white px-6 pt-4 pb-2 border-b border-[#F0EAE1]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8C7A70]">
              <span className={currentStep >= 1 ? 'text-[#9F674F] font-bold' : ''}>1. Soin & Praticienne</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DDD3C1]" />
              <span className={currentStep >= 2 ? 'text-[#9F674F] font-bold' : ''}>2. Date & Heure</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DDD3C1]" />
              <span className={currentStep >= 3 ? 'text-[#9F674F] font-bold' : ''}>3. Coordonnées</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DDD3C1]" />
              <span className={currentStep >= 4 ? 'text-[#9F674F] font-bold' : ''}>4. Paiement</span>
            </div>
            <div className="w-full bg-[#F3ECE2] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#C8957C] to-[#9F674F] h-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Error Banner if any */}
          {bookingError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* ================= STEP 1: SERVICE & PRACTITIONER ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                  1. Sélectionner le soin souhaité
                </label>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {SALON_SERVICES.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedService.id === svc.id
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
                  ))}
                </div>
              </div>

              {/* Practitioner Selection */}
              <div>
                <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                  2. Choisir votre praticienne
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setSelectedPractitioner('Premier disponible')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPractitioner === 'Premier disponible'
                        ? 'border-[#9F674F] bg-[#FAF7F2] ring-1 ring-[#9F674F]'
                        : 'border-[#E8DFC8] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAE0D3] flex items-center justify-center text-[#8C5D47] font-bold text-xs">
                      ✨
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2C2420]">Premier disponible</p>
                      <p className="text-[11px] text-[#8C7A70]">Plus grand choix de créneaux</p>
                    </div>
                  </div>

                  {PRACTITIONERS.map((prat) => (
                    <div
                      key={prat.id}
                      onClick={() => setSelectedPractitioner(prat.name)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        selectedPractitioner === prat.name
                          ? 'border-[#9F674F] bg-[#FAF7F2] ring-1 ring-[#9F674F]'
                          : 'border-[#E8DFC8] bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <img 
                        src={prat.avatar} 
                        alt={prat.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#2C2420]">{prat.name}</p>
                        <p className="text-[10px] text-[#C8957C] font-medium">{prat.role.split('&')[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 2: DATE & TIME ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                  Choisir la date du rendez-vous
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
                  Ouvert du mardi au samedi dès 9h30. Fermé dimanche & lundi.
                  {isThursday && <span className="font-semibold text-[#8C5D47]">• Nocturne jusqu'à 20h30 le jeudi !</span>}
                </p>
              </div>

              {isClosedDay ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  L'institut est fermé ce jour-là. Veuillez sélectionner une date entre mardi et samedi.
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#8C7A70] uppercase tracking-wider mb-2">
                    Créneaux horaires disponibles
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedTimeSlot === slot
                            ? 'bg-[#2C2420] text-white shadow-sm'
                            : 'bg-white border border-[#E0D5C3] text-[#5A4D45] hover:bg-[#FAF7F2] hover:border-[#C8957C]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking preview summary */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs text-[#5A4D45] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#2C2420] block">{selectedService.title}</span>
                  <span>Avec : {selectedPractitioner}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-[#9F674F] block">{selectedDate} à {selectedTimeSlot}</span>
                  <span>{selectedService.durationMinutes} minutes</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 3: CONTACT & AUTH CHECK ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              
              {/* Authentication check notice */}
              {!isLoggedIn ? (
                <div className="p-4 rounded-2xl bg-[#F5EFE6] border border-[#E0D5C3] space-y-3">
                  <div className="flex items-start gap-2.5">
                    <User className="w-5 h-5 text-[#9F674F] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2C2420]">
                        Connexion requise pour réserver et gérer votre rendez-vous
                      </h4>
                      <p className="text-[11px] text-[#6E5B50] mt-0.5">
                        Conformément à la politique du salon, la connexion vous permet d'accéder à l'historique et d'annuler ou modifier vos réservations en 1 clic.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={loginWithGoogle}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#DDD3C1] hover:border-[#C8957C] text-xs font-semibold text-[#2C2420] flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Se connecter avec Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => loginWithDemoAccount(false)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#2C2420] text-white text-xs font-semibold hover:bg-[#3D322D] transition-colors cursor-pointer text-center"
                    >
                      Connexion Rapide Démo (1 clic)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#EAE0D3]/60 border border-[#E0D5C3] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#8C5D47]" />
                    <span className="text-xs font-semibold text-[#2C2420]">
                      Connecté en tant que {userProfile?.displayName || currentUser?.displayName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C7A70]">Compte vérifié</span>
                </div>
              )}

              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Camille Roussel"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Téléphone (Rappel SMS) *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Adresse Email pour confirmation *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="camille@exemple.fr"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Remarques ou préférences (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Allergies éventuelles, peaux sensibles, préférences de pression pour le massage..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                />
              </div>

            </div>
          )}

          {/* ================= STEP 4: PAYMENT (SIMULATED + STRIPE READY) ================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              
              {/* Payment Mode Notice */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">
                      Paiement Sécurisé (Mode Démo / Simulation)
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Le système effectue une simulation d'autorisation bancaire conforme aux standards Stripe 3D-Secure. 
                      Aucun montant réel ne sera prélevé sur votre compte.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-[11px] font-bold text-amber-900 transition-colors cursor-pointer"
                >
                  Carte Test Auto
                </button>
              </div>

              {/* Card Inputs Form */}
              <div className="space-y-3.5 bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DFC8]">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DFC8]">
                  <span className="text-xs font-bold text-[#2C2420] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#C8957C]" />
                    Carte Bancaire (Visa, Mastercard, CB)
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-[#8C7A70]">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Cryptage SSL 256 bits</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Titulaire de la carte
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Nom tel qu'indiqué sur la carte"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      // format spaces every 4 digits
                      const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                      setCardNumber(val);
                    }}
                    placeholder="4242 4242 4242 4242"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm font-mono text-[#2C2420]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                      Expiration (MM/AA)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={expiryDate}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        setExpiryDate(val);
                      }}
                      placeholder="12/28"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-center font-mono text-[#2C2420]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                      Cryptogramme (CVC)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="424"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-center font-mono text-[#2C2420]"
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                      Code Postal
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="91220"
                      className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-center text-[#2C2420]"
                    />
                  </div>
                </div>
              </div>

              {/* Order summary breakdown */}
              <div className="p-4 rounded-xl bg-white border border-[#E8DFC8] space-y-2 text-xs">
                <div className="flex justify-between text-[#5A4D45]">
                  <span>Prestation : {selectedService.title}</span>
                  <span className="font-semibold text-[#2C2420]">{selectedService.price.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-[#8C7A70]">
                  <span>TVA incluse (20%)</span>
                  <span>{(selectedService.price * 0.2).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-[#8C7A70]">
                  <span>Frais de réservation</span>
                  <span className="text-emerald-700 font-semibold">Offerts (0,00 €)</span>
                </div>
                <div className="border-t border-[#F0EAE1] pt-2 flex justify-between text-sm font-bold text-[#2C2420]">
                  <span>Total à régler</span>
                  <span className="font-serif text-lg text-[#9F674F]">{selectedService.price.toFixed(2)} €</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 5: CONFIRMATION SUCCESS ================= */}
          {currentStep === 5 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in-50">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="max-w-md mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Réservation validée & payée avec succès
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2420] mt-1">
                  Nous avons hâte de vous chouchouter !
                </h3>
                <p className="text-xs text-[#6E5B50] mt-2">
                  Un email de confirmation récapitulatif a été transmis à <span className="font-semibold">{customerEmail}</span>. 
                  Vous pouvez modifier ou annuler sans frais votre rendez-vous jusqu'à 24h avant depuis votre espace client.
                </p>
              </div>

              {/* Receipt Ticket Card */}
              <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8DFC8] text-left max-w-md mx-auto space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8DFC8]">
                  <span className="text-[11px] font-bold text-[#8C7A70] uppercase">Référence réservation</span>
                  <span className="font-mono text-xs font-bold text-[#2C2420] bg-white px-2 py-0.5 rounded border border-[#DDD3C1]">
                    {confirmedBookingRef}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#463B34]">
                  <p><span className="text-[#8C7A70]">Soin :</span> <strong className="text-[#2C2420]">{selectedService.title}</strong></p>
                  <p><span className="text-[#8C7A70]">Praticienne :</span> <strong>{selectedPractitioner}</strong></p>
                  <p><span className="text-[#8C7A70]">Date & Heure :</span> <strong>{selectedDate} à {selectedTimeSlot}</strong> ({selectedService.durationMinutes} min)</p>
                  <p><span className="text-[#8C7A70]">Adresse :</span> <strong>{SALON_INFO.address}, {SALON_INFO.city}</strong></p>
                  <p><span className="text-[#8C7A70]">Paiement :</span> <strong className="text-emerald-700">{selectedService.price} € TTC (Réglement validé)</strong></p>
                </div>
              </div>

              {/* Actions */}
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
                  Gérer mes réservations
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls (Steps 1 to 4) */}
        {currentStep < 5 && (
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

            {currentStep < 4 ? (
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
                onClick={handleConfirmAndPay}
                disabled={isProcessing}
                className="py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{processingStatusText || 'Paiement en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Payer & Confirmer ({selectedService.price} €)</span>
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
