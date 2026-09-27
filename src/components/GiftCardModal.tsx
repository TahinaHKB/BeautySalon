import React, { useState } from 'react';
import { X, Gift, Sparkles, CheckCircle2, Heart, CreditCard, Printer } from 'lucide-react';
import { SALON_INFO } from '../data/salonData';

interface GiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GiftCardModal: React.FC<GiftCardModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState<number>(85);
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [giftMessage, setGiftMessage] = useState('Pour t’offrir un délicieux moment de détente rien qu’à toi.');
  const [step, setStep] = useState<'configure' | 'success'>('configure');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleOrderGift = async () => {
    if (!recipientName.trim() || !senderName.trim()) {
      alert("Veuillez renseigner le nom du destinataire et le vôtre.");
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsProcessing(false);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8DFC8] relative space-y-6 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF7F2] text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center border border-[#DDD3C1] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'configure' ? (
          <>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#C8957C] flex items-center justify-center mx-auto border border-[#E8DFC8]">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
                Offrir une Carte Cadeau
              </h3>
              <p className="text-xs text-[#6E5B50]">
                Valable 1 an sur toutes les prestations et cosmétiques de l'institut Un Moment pour Soi.
              </p>
            </div>

            {/* Amount picker */}
            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-2">
                Montant de la carte cadeau
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 65, 85, 120].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      amount === val
                        ? 'bg-[#2C2420] text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-[#5A4D45] border border-[#DDD3C1] hover:bg-[#EFE9DF]'
                    }`}
                  >
                    {val} €
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient & sender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Pour (Destinataire)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ex: Sophie"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  De la part de
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ex: Marc & Julie"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                Message personnalisé
              </label>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
              />
            </div>

            <button
              onClick={handleOrderGift}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B98166] to-[#9F674F] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? "Validation en cours..." : `Régler et générer la carte (${amount} €)`}
            </button>
          </>
        ) : (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
                Carte Cadeau Générée avec succès !
              </h3>
              <p className="text-xs text-[#6E5B50] mt-1">
                Un magnifique bon cadeau a été créé pour <strong>{recipientName}</strong>.
              </p>
            </div>

            {/* Voucher preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-[#EAE0D3] border-2 border-dashed border-[#C8957C] text-left space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#2C2420]">{SALON_INFO.name}</h4>
                  <p className="text-[11px] text-[#8C7A70]">Bon Cadeau Prestation & Soins</p>
                </div>
                <span className="font-serif text-2xl font-bold text-[#9F674F]">{amount} €</span>
              </div>
              <div className="text-xs text-[#463B34] space-y-1 pt-2 border-t border-[#DDD3C1]">
                <p><strong>Destinataire :</strong> {recipientName}</p>
                <p><strong>Offert par :</strong> {senderName}</p>
                <p className="italic text-[#6E5B50]">"{giftMessage}"</p>
                <p className="text-[10px] text-[#8C7A70] pt-1">Valable 1 an au 22 Rue du Bois de Châtres, Brétigny-sur-Orge</p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl bg-white border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] flex items-center gap-2 hover:bg-[#FAF7F2]"
              >
                <Printer className="w-4 h-4 text-[#C8957C]" />
                <span>Imprimer la carte</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-[#2C2420] text-xs font-semibold text-white hover:bg-[#3D322D]"
              >
                Terminer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
