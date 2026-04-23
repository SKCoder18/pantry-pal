import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInventory } from '../services/storage';
import { getRecipeDetails } from '../services/ai';

export default function RecipeDetail() {
  const { id } = useParams(); 
  const recipeName = decodeURIComponent(id || '');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecipe() {
      const items = getInventory();
      const output = await getRecipeDetails(recipeName, items);
      setDetails(output);
      setLoading(false);
    }
    if (recipeName) fetchRecipe();
  }, [recipeName]);

  return (
    <div className="pt-8 pb-32 px-6 max-w-4xl mx-auto">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#fafaf5]/90 backdrop-blur-md flex items-center justify-between px-6 py-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-black/5 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[#2D6A4F]">arrow_back</span>
        </button>
        <span className="font-bold tracking-widest text-[10px] uppercase text-on-surface-variant">Step-by-Step AI Chef</span>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-outline">more_vert</span>
        </button>
      </header>

      <main className="mt-20">
        {loading ? (
           <div className="flex flex-col justify-center items-center h-64 space-y-4">
               <span className="material-symbols-outlined animate-spin text-5xl text-primary">sync</span>
               <p className="font-bold text-lg animate-pulse text-primary text-center">Your AI Chef is gathering ingredients and preparing the instructions...</p>
           </div>
        ) : !details ? (
           <div className="p-8 bg-error-container text-on-error-container rounded-3xl text-center">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p className="font-bold">Failed to load recipe details. Please try again.</p>
           </div>
        ) : (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                  <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{details.title}</h1>
                  <div className="flex items-center gap-4 text-sm font-bold text-primary mb-8">
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">timer</span> {details.time || "20 Mins"}</span>
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">restaurant</span> {details.difficulty || "Medium"}</span>
                  </div>
               </div>

               <div className="bg-surface-container-low p-6 rounded-[2rem] space-y-6">
                  {details.ingredients_have && details.ingredients_have.length > 0 && (
                  <div>
                    <h3 className="font-headline text-xl font-bold mb-3 text-on-surface">Items You Have ✅</h3>
                    <ul className="space-y-2">
                       {details.ingredients_have.map((ing, i) => (
                          <li key={'h'+i} className="flex items-center gap-3 bg-primary-container text-on-primary-container p-3 rounded-xl">
                              <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                              <span className="font-bold capitalize">{ing}</span>
                          </li>
                       ))}
                    </ul>
                  </div>
                  )}
                  {details.ingredients_missing && details.ingredients_missing.length > 0 && (
                  <div>
                    <h3 className="font-headline text-xl font-bold mb-3 text-error">Missing Items to Buy 🛒</h3>
                    <ul className="space-y-2">
                       {details.ingredients_missing.map((ing, i) => (
                          <li key={'m'+i} className="flex items-center gap-3 bg-error-container text-on-error-container p-3 rounded-xl ring-1 ring-error/20">
                              <span className="material-symbols-outlined text-error">shopping_cart</span>
                              <span className="font-bold capitalize">{ing}</span>
                          </li>
                       ))}
                    </ul>
                  </div>
                  )}
               </div>

               <div>
                  <h3 className="font-headline text-2xl font-bold mb-6">Preparation Steps</h3>
                  <div className="space-y-6">
                     {details.steps && details.steps.map((step, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-white shadow-sm border border-outline-variant/20 rounded-[1.5rem]">
                            <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold flex-shrink-0 mt-1 shadow-sm">
                                {i + 1}
                            </div>
                            <p className="text-on-surface leading-relaxed text-lg py-1">{step}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <button onClick={() => navigate('/recipes')} className="w-full mt-10 bg-primary text-white py-5 rounded-full font-bold text-lg shadow-xl active:scale-95 transition-all">
                   Finished Cooking
               </button>
           </div>
        )}
      </main>
    </div>
  );
}
