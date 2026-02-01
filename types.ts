export interface Ingredient {
  id: string;
  name: string;
  expiryDate?: string; // YYYY-MM-DD
  quantity?: string;
  category: 'produce' | 'dairy' | 'protein' | 'pantry' | 'other';
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  usedIngredients: string[];
  missingIngredients: string[];
  instructions: string[];
  calories?: number;
}

export interface Store {
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
  placeId?: string;
  uri?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: any[]
    }
  };
}

export enum AppView {
  INVENTORY = 'INVENTORY',
  RECIPES = 'RECIPES',
  STORES = 'STORES',
  STYLIST = 'STYLIST' // The image editing feature
}
