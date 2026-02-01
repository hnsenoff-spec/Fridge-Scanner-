import React, { useState, useEffect } from 'react';
import { findGroceryStores } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { MapPin, Navigation, Star, Loader2 } from 'lucide-react';

export const StoreLocator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);

  const handleFindStores = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await findGroceryStores(latitude, longitude);
          setText(result.text);
          setGroundingChunks(result.groundingChunks);
        } catch (e) {
          setError("Failed to find stores. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
        <h2 className="text-xl font-bold text-blue-900 mb-2">Find Ingredients Nearby</h2>
        <p className="text-sm text-blue-700 mb-6">
          Missing something? Use Gemini Maps Grounding to find the best local grocery stores open now.
        </p>
        
        {!text && (
            <button
            onClick={handleFindStores}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
            Find Stores Near Me
            </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {text && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Navigation size={18} className="text-blue-500" />
            Local Recommendations
           </h3>
           <div className="prose prose-sm text-gray-600 mb-6">
             {text}
           </div>

           {groundingChunks.length > 0 && (
             <div className="space-y-3">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sources & Maps</h4>
               {groundingChunks.map((chunk, i) => {
                 const mapData = chunk.maps;
                 if (!mapData) return null;
                 
                 return (
                   <a 
                     key={i} 
                     href={mapData.uri} 
                     target="_blank" 
                     rel="noreferrer"
                     className="block bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-lg border border-gray-200"
                   >
                     <div className="flex justify-between items-center">
                       <span className="font-semibold text-blue-700 truncate">{mapData.title}</span>
                       <span className="text-xs text-gray-400">Open Map &rarr;</span>
                     </div>
                   </a>
                 );
               })}
             </div>
           )}
        </div>
      )}
    </div>
  );
};
