import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, ArrowRight, Heart, MessageCircle, ExternalLink, X, Send, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Landing() {
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setIsSubmitted(false);
        setFeedbackEmail('');
        setFeedbackMessage('');
      }, 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#fff9f0] flex flex-col items-center justify-center font-sans text-slate-800 px-6 relative overflow-hidden">
      
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full flex flex-col items-center text-center space-y-6 z-10"
      >
        
        {/* IBb Veteriner Hizmetleri Link Section */}
        <div className="flex flex-col items-center mb-4 bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-orange-100 shadow-sm transition-all hover:bg-white/80">
          <h2 className="text-sm md:text-base font-bold text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-2">
             <PawPrint size={18} />
             VETERİNER HİZMETLERİ ŞUBE MÜDÜRLÜĞÜ
             <PawPrint size={18} />
          </h2>
          <a href="https://tarim.ibb.istanbul/veteriner-hizmetleri-mudurlugu/"
             target="_blank" rel="noreferrer"
             className="text-xs md:text-sm font-medium text-slate-500 hover:text-orange-500 flex items-center gap-1 transition-colors"
          >
            Detaylı Bilgi İçin Tıklayın <ExternalLink size={14} />
          </a>
        </div>

        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-400 rounded-[2rem] shadow-xl flex items-center justify-center mb-2 text-white transform -rotate-6 hover:rotate-0 transition-transform duration-300">
          <PawPrint size={48} />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-800 text-balance">
          Pati<span className="text-orange-500">Maps</span>
        </h1>

        <p className="text-slate-600 text-lg md:text-xl max-w-lg text-balance font-medium">
          Sokaktaki can dostlarımız için İstanbul'daki ücretsiz hayvan sağlığı merkezlerini ve veteriner kliniklerini keşfedin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button 
            onClick={() => navigate('/map')}
            className="px-8 py-4 bg-orange-500 text-white rounded-2xl shadow-lg hover:bg-orange-600 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 font-bold text-lg"
          >
            <span>Haritayı Aç</span>
            <ArrowRight size={20} className="group-hover:translate-x-1" />
          </button>

          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-200 rounded-2xl shadow-sm hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 font-bold text-lg"
          >
            <Heart size={20} className="fill-orange-500 text-orange-500" />
            <span>Geri Bildirim / Teşekkür</span>
          </button>
        </div>

      </motion.div>
      
      <div className="fixed bottom-6 text-xs font-mono text-slate-400/80 z-0">
        Açık Veri & OpenStreetMap Destekli
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Bize Ulaşın</h3>
                  <p className="text-sm text-slate-500">Değerli düşüncelerinizi paylaşırsanız mutlu oluruz 🐾</p>
                </div>
              </div>

              {isSubmitted ? (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                   <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                     <Heart size={32} className="fill-green-500" />
                   </div>
                   <h4 className="text-lg font-bold text-slate-800">Teşekkürler!</h4>
                   <p className="text-slate-600">Mesajınız başarıyla iletildi.</p>
                 </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">E-posta Adresiniz</label>
                    <input 
                      type="email" 
                      required
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="adiniz@example.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Mesajınız / İsteğiniz</label>
                    <textarea 
                      required
                      rows={4}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Bize ne söylemek istersiniz?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                  >
                    Gönder <Send size={18} />
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
