import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  FileText
} from 'lucide-react';
import { Booking } from '../types/salon';
import { SALON_INFO } from '../data/salonData';
import { BookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

interface CustomerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onBookNew: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  isOpen,
  onClose,
  bookings,
  onBookNew
}) => {
  const { currentUser, userProfile, updateCustomerPhone } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Imprévu dans mon emploi du temps');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Reschedule state
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('11:30');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  // Voucher print state
  const [viewingVoucher, setViewingVoucher] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const nowStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && b.date >= nowStr);
  const pastOrCancelledBookings = bookings.filter(b => b.status !== 'confirmed' || b.date < nowStr);

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastOrCancelledBookings;

  const handleConfirmCancellation = async () => {
    if (!cancellingBooking) return;
    setIsSubmittingCancel(true);
    try {
      const fullReason = cancelReason === 'Autre raison' ? customReason.trim() : cancelReason;
      await BookingService.cancelBooking(cancellingBooking.id, fullReason || 'Annulé par la cliente');
      setCancellingBooking(null);
      setCustomReason('');
    } catch (e: any) {
      alert("Erreur lors de l'annulation: " + (e?.message || 'Veuillez réessayer.'));
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingBooking || !rescheduleDate) return;
    setIsSubmittingReschedule(true);
    try {
      await BookingService.rescheduleBooking(reschedulingBooking.id, rescheduleDate, rescheduleSlot);
      setReschedulingBooking(null);
    } catch (e: any) {
      alert("Erreur lors du report: " + (e?.message || 'Veuillez réessayer.'));
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E8DFC8] relative my-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 sm:p-6 border-b border-[#E8DFC8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAE0D3] flex items-center justify-center text-[#9F674F] font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2420]">
                Mon Espace Client
              </h2>
              <p className="text-xs text-[#6E5B50]">
                Connecté(e) : <span className="font-semibold text-[#2C2420]">{userProfile?.displayName || currentUser?.displayName || 'Cliente'}</span> ({userProfile?.email || currentUser?.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center border border-[#DDD3C1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white px-6 pt-3 border-b border-[#F0EAE1] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'border-[#9F674F] text-[#9F674F]'
                  : 'border-transparent text-[#8C7A70] hover:text-[#2C2420]'
              }`}
            >
              <span>Rendez-vous à venir</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                upcomingBookings.length > 0 ? 'bg-[#9F674F] text-white' : 'bg-[#EAE0D3] text-[#5A4D45]'
              }`}>
                {upcomingBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-[#9F674F] text-[#9F674F]'
                  : 'border-transparent text-[#8C7A70] hover:text-[#2C2420]'
              }`}
            >
              <span>Historique & Annulations</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE0D3] text-[#5A4D45]">
                {pastOrCancelledBookings.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookNew();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F2] border border-[#DDD3C1] text-[#9F674F] hover:bg-[#EFE9DF] transition-colors mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nouveau rendez-vous</span>
          </button>
        </div>

        {/* Scrollable Bookings List */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {displayedBookings.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#8C7A70] flex items-center justify-center mx-auto border border-[#E8DFC8]">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#2C2420]">
                  {activeTab === 'upcoming' 
                    ? "Vous n'avez aucun rendez-vous à venir" 
                    : "Aucun historique pour le moment"}
                </h4>
                <p className="text-xs text-[#6E5B50] max-w-sm mx-auto mt-1">
                  Découvrez nos rituels de soin du visage, massages et manucures pour réserver votre prochain moment de bien-être.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onBookNew();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B98166] to-[#9F674F] text-white text-xs font-bold shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <span>Découvrir la carte et réserver</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            displayedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8DFC8] space-y-3 transition-shadow hover:shadow-xs"
              >
                {/* Top Row: Service Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8DFC8]/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D47]">
                      {b.serviceCategory || 'Soin'} • Réf: {b.id.substring(0, 12)}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2C2420]">
                      {b.serviceTitle}
                    </h3>
                  </div>

                  <div>
                    {b.status === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmé & Payé</span>
                      </span>
                    ) : b.status === 'cancelled' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <span>Annulé • Remboursé</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        <span>Terminé</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Mid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5A4D45]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C8957C] shrink-0" />
                    <div>
                      <span className="text-[#8C7A70] block text-[10px]">Date & Heure</span>
                      <strong className="text-[#2C2420]">{b.date} à {b.timeSlot}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C8957C] shrink-0" />
                    <div>
                      <span className="text-[#8C7A70] block text-[10px]">Praticienne</span>
                      <strong className="text-[#2C2420]">{b.practitioner}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C8957C] shrink-0" />
                    <div>
                      <span className="text-[#8C7A70] block text-[10px]">Durée & Règlement</span>
                      <strong className="text-[#2C2420]">{b.durationMinutes} min • {b.price} € TTC</strong>
                    </div>
                  </div>
                </div>

                {/* Cancellation Note if cancelled */}
                {b.status === 'cancelled' && b.cancellationReason && (
                  <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-rose-800">
                    <strong className="font-semibold">Motif d'annulation : </strong>
                    {b.cancellationReason}
                  </div>
                )}

                {/* Notes if provided */}
                {b.notes && (
                  <p className="text-[11px] text-[#6E5B50] italic bg-white/70 p-2 rounded-lg border border-[#E8DFC8]/60">
                    Remarques : {b.notes}
                  </p>
                )}

                {/* Action Buttons for confirmed bookings */}
                {b.status === 'confirmed' && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8DFC8]/60">
                    <div className="text-[11px] text-[#8C7A70] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Annulation sans frais garantie jusqu'à 24h avant</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingVoucher(b)}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold text-[#5A4D45] bg-white border border-[#DDD3C1] hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#8C7A70]" />
                        <span>Bon de RDV</span>
                      </button>

                      <button
                        onClick={() => {
                          setReschedulingBooking(b);
                          setRescheduleDate(b.date);
                          setRescheduleSlot(b.timeSlot);
                        }}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold text-[#5A4D45] bg-white border border-[#DDD3C1] hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#C8957C]" />
                        <span>Reporter</span>
                      </button>

                      <button
                        onClick={() => setCancellingBooking(b)}
                        className="py-1.5 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Annuler ce RDV
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] p-4 border-t border-[#E8DFC8] flex items-center justify-between text-xs text-[#6E5B50]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#C8957C]" />
            {SALON_INFO.address}, {SALON_INFO.city}
          </span>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#2C2420] text-white font-semibold hover:bg-[#3D322D] transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>

      {/* ================= CANCELLATION MODAL ================= */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DFC8] space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#2C2420]">
                Annuler votre réservation ?
              </h3>
              <p className="text-xs text-[#6E5B50] mt-1">
                Soin : <strong>{cancellingBooking.serviceTitle}</strong> le <strong>{cancellingBooking.date} à {cancellingBooking.timeSlot}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold">Politique de remboursement de l'institut :</p>
              <p>
                L'annulation est gratuite jusqu'à 24h avant le rendez-vous. Le montant de <strong>{cancellingBooking.price} €</strong> vous sera recrédité automatiquement sous 3 jours ouvrés.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1.5">
                Motif de votre annulation :
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
              >
                <option value="Imprévu dans mon emploi du temps">Imprévu dans mon emploi du temps</option>
                <option value="Raison médicale / fatigue / indisposition">Raison médicale / indisposition</option>
                <option value="Déplacement professionnel ou vacances">Déplacement professionnel ou vacances</option>
                <option value="Souhait de changer de prestation">Souhait de changer de prestation</option>
                <option value="Autre raison">Autre raison...</option>
              </select>

              {cancelReason === 'Autre raison' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Précisez votre motif..."
                  className="mt-2 w-full p-2 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#5A4D45] hover:bg-[#FAF7F2]"
              >
                Garder mon RDV
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isSubmittingCancel}
                className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmittingCancel ? "Annulation en cours..." : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESCHEDULE MODAL ================= */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DFC8] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#2C2420]">
                Reporter votre séance
              </h3>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="text-[#8C7A70] hover:text-[#2C2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6E5B50]">
              Choisissez votre nouvelle date et votre créneau pour : <strong>{reschedulingBooking.serviceTitle}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                Nouvelle date
              </label>
              <input
                type="date"
                min={nowStr}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                Nouvel horaire
              </label>
              <select
                value={rescheduleSlot}
                onChange={(e) => setRescheduleSlot(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
              >
                {['09:30', '10:45', '11:30', '14:00', '15:15', '16:30', '17:45', '18:30'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingBooking(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#5A4D45] hover:bg-[#FAF7F2]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={isSubmittingReschedule || !rescheduleDate}
                className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-[#9F674F] hover:bg-[#8A5741] transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmittingReschedule ? "Enregistrement..." : "Valider la nouvelle date"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINTABLE VOUCHER / RECEIPT MODAL ================= */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] space-y-6">
            <div className="text-center border-b border-[#E8DFC8] pb-4">
              <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
                {SALON_INFO.name}
              </h3>
              <p className="text-xs text-[#8C7A70]">Institut de Beauté • Brétigny-sur-Orge</p>
              <p className="text-[11px] text-[#5A4D45] mt-1">{SALON_INFO.address}, {SALON_INFO.city}</p>
            </div>

            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DFC8] space-y-2.5 text-xs text-[#463B34]">
              <div className="flex justify-between font-bold text-sm text-[#2C2420]">
                <span>Soin :</span>
                <span>{viewingVoucher.serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Heure :</span>
                <strong>{viewingVoucher.date} à {viewingVoucher.timeSlot}</strong>
              </div>
              <div className="flex justify-between">
                <span>Praticienne :</span>
                <span>{viewingVoucher.practitioner}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente :</span>
                <span>{viewingVoucher.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Téléphone :</span>
                <span>{viewingVoucher.customerPhone}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8DFC8]">
                <span>Statut :</span>
                <span className="text-emerald-700 font-bold">Réglement validé ({viewingVoucher.price} € TTC)</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#8C7A70]">
                <span>Transaction Ref :</span>
                <span className="font-mono">{viewingVoucher.paymentTransactionId || viewingVoucher.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl bg-white border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] flex items-center gap-2 hover:bg-[#FAF7F2]"
              >
                <Printer className="w-4 h-4 text-[#C8957C]" />
                <span>Imprimer le reçu</span>
              </button>

              <button
                onClick={() => setViewingVoucher(null)}
                className="py-2.5 px-6 rounded-xl bg-[#2C2420] text-xs font-semibold text-white hover:bg-[#3D322D]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
