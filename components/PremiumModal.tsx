import React from 'react';
import { CheckCircle, X, Crown, Sparkles } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Decorative Header Background */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
             <Sparkles className="absolute top-2 left-4 w-12 h-12 text-white" />
             <Sparkles className="absolute bottom-4 right-10 w-8 h-8 text-white" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mb-3">
                <Crown size={40} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Recipe Rescue <span className="italic">PRO</span></h2>
            <p className="text-yellow-50 font-medium text-sm mt-1">Unlock the full power of your kitchen</p>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <FeatureRow text="Unlimited Fridge Scans" />
            <FeatureRow text="AI Food Stylist (Image Editor)" />
            <FeatureRow text="Smart Store Locator" />
            <FeatureRow text="Ad-free Experience" />
          </div>

          <div className="pt-2">
            <button 
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-base">Start 7-Day Free Trial</span>
              <span className="text-[10px] text-gray-400 font-normal uppercase tracking-widest mt-0.5">Then $4.99/mo</span>
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Restore purchase • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="bg-green-100 text-green-600 rounded-full p-1">
      <CheckCircle size={16} />
    </div>
    <span className="text-gray-700 font-medium text-sm">{text}</span>
  </div>
);
