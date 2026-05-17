import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { translations } from '../utils/translations';

export default function ShareModal({ isOpen, onClose, shareData }) {
  const { language } = useAuthStore();
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  if (!shareData) return null;

  const { title = '', text = '', url = '' } = shareData;

  const handleCopyLink = async () => {
    try {
      const copyText = url || text;
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success(language === 'bn' ? 'লিংক ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        toast.success(language === 'bn' ? 'সফলভাবে শেয়ার করা হয়েছে!' : 'Shared successfully!');
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const shareToWhatsApp = () => {
    const formattedText = `${title}\n${text}\n${url}`.trim();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = () => {
    const shareUrl = url || window.location.href;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareToMessenger = () => {
    const shareUrl = url || window.location.href;
    const fbMessengerUrl = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
    
    // Check if on mobile, otherwise open normal web copy flow
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = fbMessengerUrl;
    } else {
      // Direct send fallback dialog or copy link
      handleCopyLink();
      toast.success(language === 'bn' ? 'মেসেঞ্জারে পেস্ট করতে লিংক কপি করা হয়েছে!' : 'Link copied! Paste it in your Messenger chat.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-white">
                  {language === 'bn' ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share to Social'}
                </h2>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">
                  {language === 'bn' ? 'টুর্নামেন্টের তথ্য শেয়ার করুন' : 'Spread the word instantly'}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors group"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Quick Preview Area */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              <p className="text-slate-800 dark:text-slate-200 font-bold mb-1 line-clamp-1">{title}</p>
              <p className="line-clamp-2 italic">{text}</p>
              {url && <p className="text-primary mt-2 truncate font-bold text-[10px]">{url}</p>}
            </div>

            {/* Grid of sharing buttons */}
            <div className="grid grid-cols-2 gap-4">
              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="flex flex-col items-center justify-center p-4 rounded-3xl border border-emerald-500/10 hover:border-emerald-500/20 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.08] transition-all group duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.069.99 11.45.989 6.01.989 1.583 5.36 1.579 10.792c-.001 1.766.476 3.49 1.38 5.02l-.996 3.639 3.684-.967zM16.94 13.91c-.327-.162-1.924-.937-2.224-1.045-.3-.109-.517-.162-.734.162-.218.324-.844 1.045-1.034 1.262-.19.217-.381.244-.709.082-.327-.162-1.382-.503-2.633-1.602-.974-.858-1.633-1.92-1.824-2.244-.19-.324-.02-.501.143-.661.147-.144.328-.379.49-.569.163-.189.218-.324.327-.541.109-.217.054-.407-.027-.57-.082-.162-.734-1.737-1.007-2.387-.266-.635-.537-.549-.734-.559-.19-.01-.408-.01-.626-.01-.218 0-.571.082-.871.407-.3.324-1.143 1.099-1.143 2.682 0 1.583 1.171 3.116 1.334 3.333.164.217 2.304 3.475 5.583 4.869.78.331 1.389.529 1.865.68.784.246 1.498.211 2.062.127.629-.094 1.925-.776 2.197-1.488.272-.712.272-1.326.19-1.488-.082-.162-.3-.257-.626-.42z"/>
                  </svg>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center justify-center p-4 rounded-3xl border border-blue-500/10 hover:border-blue-500/20 bg-blue-500/[0.02] hover:bg-blue-500/[0.08] transition-all group duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Facebook</span>
              </button>

              {/* Messenger */}
              <button
                onClick={shareToMessenger}
                className="flex flex-col items-center justify-center p-4 rounded-3xl border border-purple-500/10 hover:border-purple-500/20 bg-purple-500/[0.02] hover:bg-purple-500/[0.08] transition-all group duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 4.97 0 11.11c0 3.5 1.74 6.62 4.47 8.58.23.17.37.45.37.74v2.87c0 .81.87 1.3 1.56.9l3.19-1.83c.27-.15.58-.2.88-.13 1.83.43 3.76.67 5.76.67 6.63 0 12-4.97 12-11.11C24 4.97 18.63 0 12 0zm1.2 14.59l-2.28-2.44-4.46 2.44 4.9-5.2 2.3 2.45 4.43-2.45-4.89 5.2z"/>
                  </svg>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Messenger</span>
              </button>

              {/* Native / System Share */}
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-500/10 hover:border-slate-500/20 bg-slate-500/[0.02] hover:bg-slate-500/[0.08] transition-all group duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-700 dark:bg-white/10 text-white dark:text-white flex items-center justify-center shadow-lg shadow-slate-500/20 mb-3 group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'মোর শেয়ার' : 'More Options'}
                </span>
              </button>
            </div>

            {/* Bottom Copy Area */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 premium-button bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:opacity-90 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied 
                  ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') 
                  : (language === 'bn' ? 'লিংক কপি করুন' : 'Copy Link')
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
