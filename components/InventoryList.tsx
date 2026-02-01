import React, { useState } from 'react';
import { Ingredient } from '../types';
import { Trash2, AlertTriangle, Clock, CheckCircle, Calendar, Plus, X } from 'lucide-react';

interface InventoryListProps {
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
  onAdd: (name: string, date: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ ingredients, onRemove, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return { 
        className: 'bg-gray-50 text-gray-500 border-gray-100', 
        icon: <Calendar size={14} />, 
        label: 'No Date' 
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { 
            className: 'bg-red-100 text-red-800 border-red-200 font-medium', 
            icon: <AlertTriangle size={14} />, 
            label: 'Expired' 
        };
    }
    if (diffDays <= 3) {
        return { 
            className: 'bg-orange-100 text-orange-800 border-orange-200 font-bold', 
            icon: <Clock size={14} />, 
            label: diffDays === 0 ? 'Expiring Today' : `${diffDays} days left`
        };
    }
    return { 
        className: 'bg-green-50 text-green-700 border-green-200', 
        icon: <CheckCircle size={14} />, 
        label: 'Good' 
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName, newDate);
      setNewName('');
      setNewDate('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Your Fridge</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
        >
          {isAdding ? <><X size={16}/> Cancel</> : <><Plus size={16}/> Add Manually</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">Item Name</label>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Milk"
                        className="w-full rounded border-gray-300 text-sm p-2"
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">Expiry Date</label>
                    <input 
                        type="date" 
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full rounded border-gray-300 text-sm p-2 text-gray-700"
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 text-sm font-bold hover:bg-blue-700 shadow-sm">
                    Add Item
                </button>
            </div>
        </form>
      )}

      {ingredients.length === 0 && !isAdding ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Your inventory is empty.</p>
          <p className="text-sm text-gray-400 mt-2">Take a photo to get started!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {ingredients.map((item) => {
            const status = getExpiryStatus(item.expiryDate);
            
            return (
                <li key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${item.category === 'produce' ? 'bg-green-400' : item.category === 'protein' ? 'bg-red-400' : 'bg-blue-300'}`}></div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.category} • {item.quantity || '1'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg border flex flex-col items-end min-w-[100px] ${status.className}`}>
                        <div className="flex items-center gap-1.5 text-xs">
                             {status.icon}
                             <span>{item.expiryDate || '--'}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide">{status.label}</span>
                    </div>

                    <button 
                      onClick={() => onRemove(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};