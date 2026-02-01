import React, { useState, useRef } from 'react';
import { editFoodImage } from '../services/geminiService';
import { Wand2, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';

export const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix for Gemini API if needed, but for display we keep it.
        // For API call we need to strip it.
        setSelectedImage(result);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;
    setLoading(true);
    
    // Strip header for API
    const base64Data = selectedImage.split(',')[1];
    
    try {
      const resultBase64 = await editFoodImage(base64Data, prompt);
      setEditedImage(`data:image/jpeg;base64,${resultBase64}`);
    } catch (e) {
      alert("Failed to edit image. Please try a different prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Food Stylist
        </h2>
        <p className="text-sm text-gray-500">
            Powered by Gemini 2.5 Flash Image ("Nano Banana")
        </p>
      </div>

      {!selectedImage ? (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors"
        >
            <ImageIcon className="text-purple-400 mb-2" size={48} />
            <p className="text-purple-700 font-medium">Upload a food photo</p>
            <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
            />
        </div>
      ) : (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-black">
                 {/* Compare view if edited exists, else just original */}
                 <img 
                    src={editedImage || selectedImage} 
                    alt="Food" 
                    className="w-full h-auto object-cover max-h-96" 
                 />
                 {editedImage && (
                     <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                         Edited
                     </div>
                 )}
                 <button 
                    onClick={() => { setSelectedImage(null); setEditedImage(null); setPrompt(""); }}
                    className="absolute top-2 left-2 bg-white/80 p-1 rounded-full text-gray-700 hover:bg-white"
                 >
                     <RefreshCw size={16} />
                 </button>
            </div>

            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Make it look gourmet', 'Add steam', 'Cartoon style'"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                    onClick={handleEdit}
                    disabled={loading || !prompt}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg disabled:opacity-50 flex items-center justify-center min-w-[3rem]"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                </button>
            </div>
            
            {editedImage && (
                <a 
                    href={editedImage} 
                    download="remixed-food.jpg"
                    className="block w-full text-center py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
                >
                    <Download className="inline mr-2" size={18} />
                    Download Masterpiece
                </a>
            )}
        </div>
      )}
    </div>
  );
};
