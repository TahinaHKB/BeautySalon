import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  KeyRound 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register' | 'verify';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login'
}) => {
  const { 
    currentUser, 
    userProfile, 
    isEmailVerified, 
    loginWithEmailPassword, 
    registerWithEmailPassword, 
    resendVerificationEmail, 
    reloadUserStatus, 
    sendPasswordReset, 
    loginWithGoogle 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>(
    currentUser && !isEmailVerified ? 'verify' : initialMode
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmailPassword(email, password);
      // Check if email verified
      const verified = await reloadUserStatus();
      if (!verified) {
        setMode('verify');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      const errCode = err?.code || '';
      const errMsg = err?.message || '';
      if (
        errCode === 'auth/invalid-credential' || 
        errCode === 'auth/wrong-password' || 
        errCode === 'auth/user-not-found' ||
        errMsg.includes('invalid-credential')
      ) {
        setError("Identifiants incorrects ou compte inexistant. Si vous n'avez pas encore créé de compte, veuillez cliquer sur l'onglet 'Créer un compte'.");
      } else if (errCode === 'auth/too-many-requests') {
        setError("Trop de tentatives infructueuses. Veuillez patienter quelques minutes avant de réessayer.");
      } else if (errCode === 'auth/invalid-email') {
        setError("L'adresse e-mail saisie n'est pas valide.");
      } else {
        setError(errMsg || "Erreur de connexion. Veuillez vérifier vos identifiants et réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmailPassword(email, password, displayName, phone);
      setSuccessMsg("Votre compte a été créé avec succès !");
      setMode('verify');
    } catch (err: any) {
      const errCode = err?.code || '';
      const errMsg = err?.message || '';
      if (errCode === 'auth/email-already-in-use') {
        setError("Cette adresse e-mail est déjà associée à un compte existant. Veuillez vous connecter avec votre mot de passe.");
      } else if (errCode === 'auth/invalid-email') {
        setError("L'adresse e-mail saisie n'est pas valide.");
      } else if (errCode === 'auth/weak-password') {
        setError("Le mot de passe choisi est trop faible. Veuillez choisir au moins 6 caractères.");
      } else {
        setError(errMsg || "Erreur lors de la création du compte.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await resendVerificationEmail();
      setSuccessMsg("Un nouvel e-mail de confirmation vous a été envoyé !");
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Impossible d'envoyer l'e-mail. Veuillez patienter.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setError(null);
    setLoading(true);
    try {
      const verified = await reloadUserStatus();
      if (verified) {
        setSuccessMsg("E-mail vérifié avec succès ! Votre compte est validé.");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setError("L'e-mail n'a pas encore été vérifié. Veuillez cliquer sur le lien reçu dans votre messagerie puis réessayer.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de vérification.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSuccessMsg("Un e-mail de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'envoi de l'e-mail de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] relative my-4 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF7F2] text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center border border-[#DDD3C1] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#C8957C] flex items-center justify-center mx-auto border border-[#E8DFC8]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
            {mode === 'verify' ? "Vérification de votre compte" : "Espace Client & Réservations"}
          </h3>
          <p className="text-xs text-[#6E5B50]">
            {mode === 'verify' 
              ? "Validez votre adresse e-mail pour confirmer vos rendez-vous" 
              : "Connectez-vous avec votre e-mail et mot de passe pour réserver"}
          </p>
        </div>

        {/* Navigation Tabs (Login / Register) */}
        {mode !== 'verify' && mode !== 'forgot' && (
          <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E8DFC8]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-white text-[#2C2420] shadow-xs' 
                  : 'text-[#8C7A70] hover:text-[#2C2420]'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-white text-[#2C2420] shadow-xs' 
                  : 'text-[#8C7A70] hover:text-[#2C2420]'
              }`}
            >
              Créer un compte
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="leading-relaxed">{error}</span>
            </div>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="self-start text-[11px] font-semibold text-[#9F674F] hover:text-[#7A4B37] underline cursor-pointer pl-6 transition-colors"
              >
                Nouveau client ? Cliquez ici pour créer un compte avec {email ? `l'adresse ${email}` : 'votre e-mail'}
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= TAB 1: LOGIN FORM ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre-email@exemple.fr"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#5A4D45]">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#9F674F] hover:underline cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        )}

        {/* ================= TAB 2: REGISTER FORM ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                Nom & Prénom *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Camille Roussel"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                Adresse e-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="camille@exemple.fr"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  required
                />
              </div>
              <p className="text-[10px] text-[#8C7A70] mt-0.5">
                Un e-mail de validation vous sera immédiatement adressé.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                Téléphone portable (Rappels de RDV)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 car. min"
                  className="w-full p-2 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Confirmation *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répéter"
                  className="w-full p-2 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? "Création du compte..." : "Créer mon compte & Recevoir le lien"}
            </button>
          </form>
        )}

        {/* ================= TAB 3: EMAIL VERIFICATION GATE ================= */}
        {mode === 'verify' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-lg font-bold text-[#2C2420]">
                Vérifiez votre boîte de réception
              </h4>
              <p className="text-xs text-[#6E5B50] leading-relaxed">
                Un e-mail de confirmation Firebase a été expédié à :<br />
                <strong className="text-[#2C2420]">{currentUser?.email || email}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs text-[#5A4D45] text-left space-y-1.5">
              <p className="font-semibold text-[#2C2420]">Comment valider votre réservation ?</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#6E5B50]">
                <li>Ouvrez l'e-mail provenant de l'institut (vérifiez aussi vos courriers indésirables / spams).</li>
                <li>Cliquez sur le lien de confirmation sécurisé.</li>
                <li>Revenez ici et cliquez sur le bouton ci-dessous pour continuer.</li>
              </ol>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>J'ai cliqué sur le lien (Vérifier mon compte)</span>
              </button>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#DDD3C1] hover:bg-[#FAF7F2] text-xs font-semibold text-[#5A4D45] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#C8957C]" />
                <span>
                  {resendCooldown > 0 
                    ? `Renvoyer l'e-mail (${resendCooldown}s)` 
                    : "Renvoyer l'e-mail de confirmation"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: FORGOT PASSWORD ================= */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div className="text-left space-y-1">
              <h4 className="font-serif text-lg font-bold text-[#2C2420]">
                Réinitialisation de mot de passe
              </h4>
              <p className="text-xs text-[#6E5B50]">
                Indiquez votre adresse e-mail pour recevoir les instructions de réinitialisation.
              </p>
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre-email@exemple.fr"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420]"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#5A4D45]"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#2C2420] text-white text-xs font-semibold hover:bg-[#3D322D] disabled:opacity-50"
              >
                Envoyer le lien
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
