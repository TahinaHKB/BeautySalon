import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  Code, 
  ExternalLink,
  Info
} from 'lucide-react';

interface StripeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StripeSettingsModal: React.FC<StripeSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [customKey, setCustomKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (customKey.trim()) {
      localStorage.setItem('salon_custom_stripe_pk', customKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF7F2] text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center border border-[#DDD3C1] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] text-[11px] font-bold text-[#8C5D47]">
            <CreditCard className="w-3.5 h-3.5 text-[#C8957C]" />
            <span>Passerelle de Paiement & API Stripe</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
            Architecture des Paiements
          </h3>
          <p className="text-xs text-[#6E5B50]">
            Conformément à votre demande, les paiements sont actuellement <strong>simulés</strong> avec validation complète des cartes, et les API Stripe sont intégrées pour la transition en production.
          </p>
        </div>

        {/* Current status pill */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900">
            <strong className="block font-bold">Mode Actif : Simulation Stripe 3D-Secure</strong>
            <p className="mt-0.5 text-emerald-800 leading-relaxed">
              Toutes les réservations valident le format des cartes, simulent l'autorisation bancaire 3D-Secure et génèrent un numéro de transaction unique (<code>pi_sim_...</code>) stocké dans Firestore.
            </p>
          </div>
        </div>

        {/* Stripe SDK Technical details */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFC8] space-y-2 text-xs text-[#5A4D45]">
          <h4 className="font-bold text-[#2C2420] flex items-center gap-1.5">
            <Code className="w-4 h-4 text-[#C8957C]" />
            SDK & Dépendances installées
          </h4>
          <ul className="space-y-1 list-disc list-inside text-[11px] text-[#6E5B50]">
            <li><code>@stripe/stripe-js</code> prêt avec le chargeur <code>loadStripe()</code></li>
            <li>Gestion des PaymentIntents côté client & serveur</li>
            <li>Gestion du remboursement automatique en cas d'annulation cliente</li>
          </ul>
        </div>

        {/* Live Stripe Key Configuration */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#2C2420] flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#C8957C]" />
            Clé publique Stripe Live ou Test (optionnelle)
          </label>
          <input
            type="text"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="pk_test_... ou pk_live_..."
            className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs font-mono text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
          />
          <p className="text-[11px] text-[#8C7A70]">
            Vous pouvez également définir <code>VITE_STRIPE_PUBLISHABLE_KEY</code> dans votre fichier <code>.env</code>.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Enregistrer la clé
            </button>
            {saved && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Enregistré !
              </span>
            )}
          </div>
        </div>

        {/* Cards for testing */}
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <Info className="w-4 h-4 text-blue-600" /> Numéros de carte de test Stripe :
          </p>
          <p className="font-mono text-[11px] text-blue-800">
            4242 4242 4242 4242 • Expiration: 12/28 • CVC: 424
          </p>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] hover:bg-[#EFE9DF]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
