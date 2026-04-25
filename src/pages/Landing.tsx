import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, ArrowRight, Heart, MessageCircle, ExternalLink, X, Send, Map, Moon, Sun, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Landing() {
  const navigate = useNavigate();
  const [modalMode, setModalMode] = useState<'feedback' | 'add_clinic' | null>(null);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        setModalMode(null);
        setIsSubmitted(false);
        setFeedbackEmail('');
        setFeedbackMessage('');
      }, 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#fff9f0] dark:bg-slate-900 flex flex-col items-center justify-center font-sans text-slate-800 dark:text-slate-100 px-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleDark}
        className="absolute top-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform z-20"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Decorative background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-100 dark:bg-orange-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-100 dark:bg-yellow-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-100 dark:bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full flex flex-col items-center text-center space-y-6 z-10"
      >
        
        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-400 rounded-[2rem] shadow-xl flex items-center justify-center mb-2 text-white transform -rotate-6 hover:rotate-0 transition-transform duration-300">
          <PawPrint size={48} />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-800 dark:text-white text-balance">
          Pati<span className="text-orange-500">Maps</span>
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-4xl text-balance font-medium leading-relaxed">
          İstanbul genelindeki belediyelere ait hayvan bakım merkezlerini ve özel veteriner kliniklerini şeffaf, akıcı ve kullanıcı dostu harita üzerinden keşfedin. Güncel görseller, yol tarifi seçeneği, konumlara ait açıklayıcı bilgiler ve anlık yerel verilerle, dostlarımızın sağlığa giden yolculuğuna tek bir arayüzden rehberlik edin.
        </p>

        <div className="flex flex-col items-center gap-6 mt-8 w-full">
          <button 
            onClick={() => navigate('/map')}
            className="w-full max-w-xs sm:max-w-md px-8 py-5 bg-orange-500 text-white rounded-3xl shadow-[0_8px_30px_rgb(249,115,22,0.3)] hover:bg-orange-600 hover:shadow-[0_8px_30px_rgb(249,115,22,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 font-extrabold text-xl sm:text-2xl border-2 border-orange-400"
          >
            <MapPin size={28} />
            <span>Haritayı Keşfet</span>
          </button>

          <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl justify-center items-stretch mt-4">
            <div className="flex flex-col items-stretch w-full lg:w-1/3">
              <button 
                onClick={() => setModalMode('feedback')}
                className="h-full w-full px-6 py-4 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border-2 border-orange-200 dark:border-slate-700 rounded-2xl shadow-sm hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all flex items-center justify-start gap-4 text-left"
              >
                <Heart size={28} className="fill-orange-500 text-orange-500 shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold text-sm lg:text-base">Geri Bildirim / Teşekkür</span>
                  <span className="text-xs font-medium opacity-80 mt-0.5">Düşüncelerinizi paylaşın</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col items-stretch w-full lg:w-1/3">
              <button 
                onClick={() => setModalMode('add_clinic')}
                className="h-full w-full px-6 py-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-slate-700 rounded-2xl shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all flex items-center justify-start gap-4 text-left"
              >
                <Map size={28} className="text-indigo-500 shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold text-sm lg:text-base">Klinik / Merkez Ekle</span>
                  <span className="text-xs font-medium opacity-80 mt-0.5">Eksik olan noktayı bildirin</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col items-stretch w-full lg:w-1/3">
              <a 
                href="https://tarim.ibb.istanbul/veteriner-hizmetleri-mudurlugu/"
                target="_blank" rel="noreferrer"
                className="h-full w-full px-6 py-4 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border-2 border-teal-200 dark:border-slate-700 rounded-2xl shadow-sm hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all flex items-center justify-start gap-4 text-left"
              >
                <PawPrint size={28} className="text-teal-500 shrink-0" />
                <div className="flex flex-col items-start leading-tight overflow-hidden">
                  <span className="font-bold text-xs lg:text-[13px] title-font tracking-tight">Veteriner Hizmetleri Müdürlüğü</span>
                  <span className="text-[10px] lg:text-[11px] font-medium opacity-80 mt-1 line-clamp-2">
                     Güncel duyurular için siteyi ziyaret edin.
                  </span>
                </div>
              </a>
            </div>
          </div>

        </div>

      </motion.div>
      
      <div className="fixed bottom-6 text-xs font-mono text-slate-400/80 z-0">
        Açık Veri & OpenStreetMap Destekli
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalMode !== null && (
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
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setModalMode(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${modalMode === 'feedback' ? 'bg-rose-100 text-rose-500' : 'bg-indigo-100 text-indigo-500'}`}>
                  {modalMode === 'feedback' ? <MessageCircle size={24} /> : <Map size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {modalMode === 'feedback' ? 'Bize Ulaşın' : 'Klinik / Merkez Ekle'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {modalMode === 'feedback' ? 'Değerli düşüncelerinizi paylaşırsanız mutlu oluruz 🐾' : 'Haritada olmayan bir merkezi eklemek için bilgileri bizimle paylaşın.'}
                  </p>
                </div>
              </div>

              {isSubmitted ? (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                   <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                     <Heart size={32} className="fill-green-500" />
                   </div>
                   <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Teşekkürler!</h4>
                   <p className="text-slate-600 dark:text-slate-400">Mesajınız başarıyla iletildi.</p>
                 </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">E-posta Adresiniz</label>
                    <input 
                      type="email" 
                      required
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="adiniz@example.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-700 transition-all dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                       {modalMode === 'add_clinic' ? 'Merkez Adı ve Diğer Bilgiler' : 'Mesajınız / İsteğiniz'}
                    </label>
                    <textarea 
                      required
                      rows={4}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder={modalMode === 'add_clinic' ? "Klinik adı, adresi veya iletişim bilgilerini yazabilirsiniz." : "Bize ne söylemek istersiniz?"}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-700 transition-all resize-none dark:text-slate-100"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-slate-800 dark:bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-orange-600 transition-colors"
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
