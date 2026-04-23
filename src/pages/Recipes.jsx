import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getInventory, getCustomRecipes } from '../services/storage';
import { suggestRecipesFromIngredients } from '../services/ai';
import { RECIPE_DB } from '../utils/recipeDB';

export default function Recipes() {
  const [recipes, setRecipes] = useState(RECIPE_DB);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setCustomRecipes(getCustomRecipes());
  }, []);

  const handleSuggest = async () => {
    setLoading(true);
    const items = getInventory();
    if (items.length === 0) {
        alert("Add some items to your inventory first!");
        setLoading(false);
        return;
    }
    const suggestions = await suggestRecipesFromIngredients(items);
    setRecipes(suggestions || []);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#fafaf5] dark:bg-stone-950 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[#2D6A4F]">menu</span>
          </button>
          <h1 className="text-xl font-bold text-[#1a1c19] dark:text-stone-100 font-['Plus_Jakarta_Sans'] tracking-tight">PantryPal</h1>
        </div>
      </header>

      <section className="mb-10 mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-[0.1em] text-on-surface-variant uppercase font-label">Curated For You</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline leading-tight tracking-tighter">Kitchen Inspiration</h2>
          </div>
          <button onClick={handleSuggest} disabled={loading} className="px-6 py-4 rounded-full bg-primary text-white font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all">
            {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">magic_button</span>}
            {loading ? "Scanning Pantry..." : "AI Suggest Recipes"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {recipes.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-outline-variant rounded-3xl">
                <span className="material-symbols-outlined text-6xl text-outline mb-4 opacity-50">restaurant_menu</span>
                <p className="text-xl font-bold text-on-surface mb-2">No Recipes Yet</p>
                <p className="text-on-surface-variant">Tap the AI Suggest button to magically create recipes mapped to your current ingredients!</p>
            </div>
        )}
        
        {recipes.map((recipe, index) => (
          <div key={index} className="md:col-span-6 bg-surface-container-lowest rounded-[2rem] overflow-hidden group border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
            <div className="p-8 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {recipe.time || '15 MINS'}
                  </div>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {recipe.match || '90'}% MATCH
                  </span>
                </div>
                <h3 className="text-3xl font-bold font-headline text-on-surface mb-4">{recipe.title}</h3>
                <p className="text-on-surface-variant line-clamp-3 leading-relaxed mb-6">{recipe.description}</p>
              </div>
              <Link to={`/recipes/${encodeURIComponent(recipe.title)}`} className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95">
                Start Cooking
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* CUSTOM RECIPES SECTION */}
      <section className="mt-16 mb-6">
        <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight">Your Secret Recipes</h2>
        <p className="text-on-surface-variant mb-6">Custom recipes you've created and saved.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           {customRecipes.length === 0 ? (
               <div className="col-span-full p-8 text-center border border-dashed border-outline-variant/60 rounded-[2rem] bg-surface-container-lowest">
                   <span className="material-symbols-outlined text-4xl text-outline mb-2 opacity-50">menu_book</span>
                   <p className="font-bold text-on-surface">No Custom Recipes</p>
                   <p className="text-sm text-on-surface-variant">Tap the + button to create your first personal recipe!</p>
               </div>
           ) : (
               customRecipes.map((cr, idx) => (
                  <div key={idx} className="md:col-span-6 bg-secondary-container text-on-secondary-container rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-8 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {cr.time || 'N/A'}
                          </div>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                            CUSTOM
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold font-headline mb-3">{cr.title}</h3>
                        <p className="opacity-80 line-clamp-2 leading-relaxed mb-6">{cr.description}</p>
                      </div>
                      <Link to={`/recipes/${encodeURIComponent(cr.title)}`} className="w-full py-4 rounded-full bg-on-secondary-container text-secondary-container font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95">
                        Start Cooking
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
               ))
           )}
        </div>
      </section>

      {/* Add Custom Recipe Floating Button as per requirements */}
      <button onClick={() => navigate('/create-recipe')} className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-secondary to-secondary-container text-white rounded-full flex items-center justify-center shadow-2xl shadow-secondary/50 hover:scale-105 active:scale-90 transition-all z-40">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
