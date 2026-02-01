import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, ChefHat, Map, Sparkles, PlusCircle, Crown } from 'lucide-react';
import { Ingredient, Recipe, AppView, GroundingChunk } from './types';
import { identifyIngredientsFromImage, generateRecipes } from './services/geminiService';
import { InventoryList } from './components/InventoryList';
import { RecipeCard } from './components/RecipeCard';
import { StoreLocator } from './components/StoreLocator';
import { ImageEditor } from './components/ImageEditor';
import { PremiumModal } from './components/PremiumModal';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Initial Mock Data
const INITIAL_INGREDIENTS: Ingredient[] = [];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.INVENTORY);
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [recipePreferences, setRecipePreferences] = useState("");
  
  // Premium State
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats for the pie chart
  const statsData = [
    { name: 'Used', value: ingredients.length > 0 ? 3 : 1 },
    { name: 'Saved', value: ingredients.length > 0 ? 5 : 1 },
    { name: 'Expired', value: 1 },
  ];
  const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

  const checkPremiumFeature = (targetView: AppView) => {
      // Logic gate: Lock Stylist and Stores behind paywall
      if ((targetView === AppView.STYLIST || targetView === AppView.STORES) && !isPremium) {
          setShowPaywall(true);
      } else {
          setView(targetView);
      }
  };

  const handleUpgrade = () => {
      // Simulate API call to payment provider
      setTimeout(() => {
          setIsPremium(true);
          setShowPaywall(false);
      }, 1000);
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const newIngredients = await identifyIngredientsFromImage(base64String);
        setIngredients(prev => [...prev, ...newIngredients]);
      } catch (error) {
        alert("Failed to identify ingredients. Try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      alert("Add ingredients first!");
      return;
    }
    setIsGeneratingRecipes(true);
    try {
      const result = await generateRecipes(ingredients, recipePreferences);
      setRecipes(result.recipes);
      setGroundingChunks(result.groundingChunks);
      setView(AppView.RECIPES);
    } catch (error) {
      alert("Failed to generate recipes.");
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleAddManual = (name: string, expiryDate: string) => {
      if(name) {
          setIngredients(prev => [...prev, {
              id: Date.now().toString(),
              name,
              category: 'other',
              expiryDate: expiryDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
          }]);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 pb-20 md:pb-0">
      
      <PremiumModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        onUpgrade={handleUpgrade} 
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 text-white p-1.5 rounded-lg">
              <ChefHat size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">Recipe Rescue</h1>
          </div>
          
          <div className="flex items-center gap-2">
             {!isPremium ? (
                 <button 
                    onClick={() => setShowPaywall(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow"
                 >
                     <Crown size={14} className="fill-white" />
                     <span>PRO</span>
                 </button>
             ) : (
                 <span className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-[10px] font-bold border border-yellow-100">
                     <Crown size={12} className="fill-yellow-600" /> PRO
                 </span>
             )}
            <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                {ingredients.length} items
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 overflow-y-auto">
        
        {view === AppView.INVENTORY && (
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Impact</p>
                <p className="text-2xl font-bold text-gray-800">8 Meals</p>
                <p className="text-xs text-green-600">Saved this month</p>
              </div>
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statsData} innerRadius={15} outerRadius={30} paddingAngle={5} dataKey="value">
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin mb-2" /> : <Camera className="mb-2" />}
                <span className="text-sm font-bold">Scan Fridge</span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCapture} />
              </button>
              
              <button 
                onClick={() => checkPremiumFeature(AppView.STYLIST)}
                className="relative flex flex-col items-center justify-center p-4 bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-transform overflow-hidden group"
              >
                <Sparkles className="mb-2" />
                <span className="text-sm font-bold">Food Stylist</span>
                
                {!isPremium && (
                    <div className="absolute top-2 right-2 bg-black/20 p-1 rounded-full">
                        <Crown size={12} className="text-yellow-300 fill-yellow-300" />
                    </div>
                )}
              </button>
            </div>

            <InventoryList 
              ingredients={ingredients} 
              onRemove={handleRemoveIngredient}
              onAdd={handleAddManual}
            />

            {ingredients.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Dietary Preferences (Optional)</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Vegetarian, Gluten-free..."
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4"
                        value={recipePreferences}
                        onChange={(e) => setRecipePreferences(e.target.value)}
                    />
                    <button 
                        onClick={handleGenerateRecipes}
                        disabled={isGeneratingRecipes}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        {isGeneratingRecipes ? <RefreshCw className="animate-spin" /> : <ChefHat />}
                        Generate Rescue Recipes
                    </button>
                </div>
            )}
          </div>
        )}

        {view === AppView.RECIPES && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold">Suggestions</h2>
                 <button onClick={() => setView(AppView.INVENTORY)} className="text-sm text-gray-500">Back</button>
             </div>
             
             {groundingChunks.length > 0 && (
                 <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100 mb-4">
                     <p className="font-bold mb-1">Sources & Inspiration:</p>
                     <div className="flex flex-wrap gap-2">
                         {groundingChunks.map((chunk, idx) => (
                             chunk.web?.uri && (
                                <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="underline hover:text-blue-600">
                                    {chunk.web.title}
                                </a>
                             )
                         ))}
                     </div>
                 </div>
             )}

             <div className="space-y-4">
                {recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
             </div>
             
             <div className="text-center pt-8">
                <button 
                  onClick={() => checkPremiumFeature(AppView.STORES)}
                  className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline group"
                >
                    <Map size={18} />
                    Missing ingredients? Find a store.
                    {!isPremium && <Crown size={12} className="text-yellow-500 fill-yellow-500" />}
                </button>
             </div>
          </div>
        )}

        {view === AppView.STORES && (
            <div className="space-y-4">
                 <button onClick={() => setView(AppView.RECIPES)} className="text-sm text-gray-500 mb-2">← Back to Recipes</button>
                <StoreLocator />
            </div>
        )}

        {view === AppView.STYLIST && (
            <div className="space-y-4">
                 <button onClick={() => setView(AppView.INVENTORY)} className="text-sm text-gray-500 mb-2">← Back to Inventory</button>
                <ImageEditor />
            </div>
        )}

      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 md:hidden z-20 pb-safe">
        <button 
            onClick={() => setView(AppView.INVENTORY)}
            className={`flex flex-col items-center gap-1 ${view === AppView.INVENTORY ? 'text-green-600' : 'text-gray-400'}`}
        >
          <ChefHat size={20} />
          <span className="text-[10px] font-medium">Kitchen</span>
        </button>
        <button 
            onClick={() => setView(AppView.RECIPES)}
            className={`flex flex-col items-center gap-1 ${view === AppView.RECIPES ? 'text-green-600' : 'text-gray-400'}`}
        >
          <Sparkles size={20} />
          <span className="text-[10px] font-medium">Recipes</span>
        </button>
        <button 
            onClick={() => checkPremiumFeature(AppView.STORES)}
            className={`flex flex-col items-center gap-1 ${view === AppView.STORES ? 'text-green-600' : 'text-gray-400'} relative`}
        >
          <div className="relative">
             <Map size={20} />
             {!isPremium && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>}
          </div>
          <span className="text-[10px] font-medium">Stores</span>
        </button>
      </nav>

    </div>
  );
};

export default App;