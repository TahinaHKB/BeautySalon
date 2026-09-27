import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  User 
} from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/salonData';
import { SalonReview } from '../types/salon';
import { collection, doc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface ReviewsSectionProps {
  onOpenAuth: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onOpenAuth }) => {
  const { currentUser, userProfile } = useAuth();
  const isLoggedIn = Boolean(currentUser || userProfile);

  const [reviews, setReviews] = useState<SalonReview[]>(INITIAL_REVIEWS);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [serviceTitle, setServiceTitle] = useState<string>('Soin Anti-Âge Liftant & Rituel Kobido');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Subscribe to reviews in Firestore if available
  useEffect(() => {
    try {
      const q = collection(db, 'reviews');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: SalonReview[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              list.push({
                id: d.id,
                userId: data.userId,
                userName: data.userName,
                rating: data.rating,
                comment: data.comment,
                serviceTitle: data.serviceTitle,
                createdAt: data.createdAt,
              });
            });
            // Combine with initial reviews
            const combined = [...list, ...INITIAL_REVIEWS.filter(r => !list.some(l => l.id === r.id))];
            combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setReviews(combined);
          }
        },
        (error) => {
          // If unauthenticated read is restricted or offline, use initial reviews
          console.warn('Reviews snapshot:', error);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up reviews listener:', e);
    }
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    const revId = 'rev_' + Date.now().toString(36);
    const authorName = userProfile?.displayName || currentUser?.displayName || 'Cliente';
    const authorId = currentUser?.uid || userProfile?.userId || 'guest-' + Date.now();
    const now = new Date().toISOString();

    const newRev: SalonReview = {
      id: revId,
      userId: authorId,
      userName: authorName,
      rating,
      comment: comment.trim(),
      serviceTitle,
      createdAt: now,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'reviews', revId), {
          userId: authorId,
          userName: authorName,
          rating,
          comment: comment.trim(),
          serviceTitle,
          createdAt: now
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `reviews/${revId}`);
      }
    }

    setReviews([newRev, ...reviews]);
    setComment('');
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowReviewForm(false);
    }, 2500);
  };

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white/60 border-t border-[#E8DFC8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE9DF] text-xs font-semibold text-[#8C5D47] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C8957C]" />
              <span>Avis & Témoignages Vérifiés</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2C2420] tracking-tight">
              Ce que nos clientes disent de nous
            </h2>
            <div className="flex items-center gap-3 mt-3 text-sm text-[#5A4D45]">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <strong className="text-[#2C2420] font-bold">4.9 sur 5</strong>
              <span>• Noté par plus de 250 clientes fidèles à Brétigny</span>
            </div>
          </div>

          <div>
            {isLoggedIn ? (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#2C2420] bg-[#FAF7F2] border border-[#DDD3C1] hover:bg-[#EFE9DF] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#C8957C]" />
                <span>{showReviewForm ? 'Fermer le formulaire' : 'Partager votre expérience'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#5A4D45] bg-[#FAF7F2] border border-[#DDD3C1] hover:bg-[#EFE9DF] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#C8957C]" />
                <span>Connectez-vous pour laisser un avis</span>
              </button>
            )}
          </div>
        </div>

        {/* Review Submission Form (if toggled) */}
        {showReviewForm && (
          <form 
            onSubmit={handleSubmitReview}
            className="mb-12 p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-4 max-w-xl mx-auto shadow-sm"
          >
            <h3 className="font-serif text-lg font-bold text-[#2C2420]">
              Laisser un avis sur votre soin
            </h3>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Merci pour votre précieux retour ! Votre avis est maintenant en ligne.</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#5A4D45]">Votre note :</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-[#DDD3C1]'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Soin réalisé
                  </label>
                  <select
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  >
                    <option value="Soin Anti-Âge Liftant & Rituel Kobido">Soin Anti-Âge Liftant & Rituel Kobido</option>
                    <option value="Soin Éclat Sublime & Hydratation Profonde">Soin Éclat Sublime & Hydratation Profonde</option>
                    <option value="Massage Relaxant Corps aux Huiles Précieuses">Massage Relaxant Corps aux Huiles Précieuses</option>
                    <option value="Rituel Thérapeutique aux Pierres Chaudes de Volcan">Rituel Thérapeutique aux Pierres Chaudes de Volcan</option>
                    <option value="Manucure Russe & Pose de Vernis Semi-Permanent">Manucure Russe & Pose de Vernis Semi-Permanent</option>
                    <option value="Rehaussement de Cils Yumilash avec Soin Kératine">Rehaussement de Cils Yumilash avec Soin Kératine</option>
                    <option value="Le Grand Rituel Signature « Un Moment pour Soi »">Le Grand Rituel Signature « Un Moment pour Soi »</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Votre commentaire
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre ressenti, l'accueil, les bienfaits du soin..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="py-2 px-3 text-xs text-[#8C7A70] hover:text-[#2C2420]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2 px-5 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Envoi...' : 'Publier mon avis'}</span>
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div 
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#8C7A70]">
                    {new Date(rev.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#5A4D45] italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                <div>
                  <strong className="block text-xs font-bold text-[#2C2420]">{rev.userName}</strong>
                  {rev.serviceTitle && (
                    <span className="block text-[11px] text-[#C8957C] truncate max-w-[200px]">
                      {rev.serviceTitle}
                    </span>
                  )}
                </div>
                <div className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#8C5D47] flex items-center justify-center font-bold text-[11px]">
                  {rev.userName.charAt(0)}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
