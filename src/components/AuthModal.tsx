import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginWithGoogle, loginWithDemoAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Échec de connexion Google. Vous pouvez utiliser le mode Démo ci-dessous.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (asAdmin: boolean = false) => {
    setError(null);
    setLoading(true);
    try {
      await loginWithDemoAccount(asAdmin);
      if (onSuccess) onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Échec de la connexion démo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF7F2] text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center border border-[#DDD3C1] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#C8957C] flex items-center justify-center mx-auto border border-[#E8DFC8]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
            Espace Client
          </h3>
          <p className="text-xs text-[#6E5B50] max-w-xs mx-auto">
            Connectez-vous pour réserver vos soins en ligne, accéder à vos rendez-vous et gérer vos annulations.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Google Sign-in */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#DDD3C1] hover:border-[#C8957C] hover:bg-[#FAF7F2] text-xs sm:text-sm font-semibold text-[#2C2420] flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8DFC8]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#8C7A70] bg-white px-2">
              Ou connexion rapide d'essai
            </div>
          </div>

          {/* Quick Demo Client */}
          <button
            onClick={() => handleDemoLogin(false)}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4 text-[#E2B7A0]" />
            <span>Tester en tant que Cliente Démo (Camille)</span>
          </button>

          {/* Quick Demo Admin */}
          <button
            onClick={() => handleDemoLogin(true)}
            disabled={loading}
            className="w-full py-2 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[11px] font-medium text-[#6E5B50] border border-[#DDD3C1] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>Accès Gérante / Admin (Tahina)</span>
          </button>
        </div>

        <div className="pt-2 text-center text-[11px] text-[#8C7A70] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Données sécurisées via Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
};
