import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INGREDIENTS_DB } from '../utils/database';
import { saveCustomRecipe } from '../services/storage';

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '',
    difficulty: 'Medium',
    ingredients: [],
    steps: []
  });

  // Ingredient Autocomplete logic
  const [ingQuery, setIngQuery] = useState('');
  const [showIngSuggestions, setShowIngSuggestions] = useState(false);
  
  // Step logic
  const [currentStep, setCurrentStep] = useState('');

  const filteredDB = INGREDIENTS_DB.filter(item => item.name.toLowerCase().includes(ingQuery.toLowerCase()));

  const handleAddIngredient = (name) => {
    if (!name.trim()) return;
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, name]
    }));
    setIngQuery('');
    setShowIngSuggestions(false);
  };

  const handleAddStep = () => {
    if (!currentStep.trim()) return;
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, currentStep]
    }));
    setCurrentStep('');
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Recipe needs a title!");
    if (formData.ingredients.length === 0) return alert("Add at least one ingredient!");
    if (formData.steps.length === 0) return alert("Add at least one step!");
    
    saveCustomRecipe(formData);
    navigate('/recipes');
  };

  return (
    <div className="pt-24 pb-32 px-4 md:px-6 max-w-3xl mx-auto">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#fafaf5]/90 backdrop-blur-md dark:bg-stone-950/90 flex items-center px-6 py-4">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-[#2D6A4F] hover:bg-black/5 p-2 rounded-full transition-colors active:scale-95 mr-4">arrow_back</button>
        <h1 className="text-xl font-bold text-[#1a1c19] dark:text-stone-100 font-['Plus_Jakarta_Sans'] tracking-tight">Create Recipe</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Core Details */}
        <section className="bg-surface-container rounded-[2rem] p-6 md:p-8 border border-outline-variant/10 shadow-sm">
          <h2 className="font-headline text-2xl font-bold mb-6">Basics</h2>
          <div className="space-y-4">
            <div>
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase ml-1">Recipe Title</label>
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-primary font-bold text-lg outline-none" placeholder="e.g. Grandma's Biryani" required />
            </div>
            <div>
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase ml-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="A short description..." rows="2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-xs font-bold text-on-surface-variant uppercase ml-1">Time (Mins)</label>
                <input value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="mt-1 w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 45" />
              </div>
              <div>
                <label className="font-label text-xs font-bold text-on-surface-variant uppercase ml-1">Difficulty</label>
                <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="mt-1 w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients Builder */}
        <section className="bg-primary-container/20 rounded-[2rem] p-6 md:p-8 border border-primary-container shadow-sm">
          <h2 className="font-headline text-2xl font-bold mb-2">Ingredients List</h2>
          <p className="text-on-surface-variant text-sm mb-6">Search from the database or type a custom ingredient.</p>
          
          <div className="relative mb-6">
            <div className="flex gap-2">
              <input 
                 value={ingQuery} 
                 onChange={e => { setIngQuery(e.target.value); setShowIngSuggestions(true); }}
                 onFocus={() => setShowIngSuggestions(true)}
                 className="flex-1 bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" 
                 placeholder="Type ingredient..." 
              />
              <button type="button" onClick={() => handleAddIngredient(ingQuery)} className="bg-primary text-white p-4 rounded-xl font-bold active:scale-95 shadow-md">Add</button>
            </div>
            
            {showIngSuggestions && ingQuery && filteredDB.length > 0 && (
                <div className="absolute z-40 w-[calc(100%-80px)] bg-white shadow-xl flex flex-col max-h-48 overflow-y-auto mt-2 rounded-xl border border-outline-variant/20">
                   {filteredDB.map((item, idx) => (
                      <div key={idx} onClick={() => handleAddIngredient(item.name)} className="p-3 border-b border-outline-variant/10 cursor-pointer flex items-center gap-3 hover:bg-neutral-50 font-bold">
                        <img src={item.image} className="w-8 h-8 rounded-full object-cover"/>
                        {item.name}
                      </div>
                   ))}
                </div>
            )}
          </div>
          
          <ul className="space-y-2">
             {formData.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-outline-variant/10">
                   <div className="flex gap-3 items-center">
                      <span className="material-symbols-outlined text-primary">lunch_dining</span>
                      <span className="font-bold">{ing}</span>
                   </div>
                   <button type="button" onClick={() => handleRemoveIngredient(i)} className="material-symbols-outlined text-error hover:bg-error-container p-1 rounded-full transition-colors">delete</button>
                </li>
             ))}
             {formData.ingredients.length === 0 && <p className="text-center text-on-surface-variant italic p-4">No ingredients added yet.</p>}
          </ul>
        </section>

        {/* Steps Builder */}
        <section className="bg-surface-container rounded-[2rem] p-6 md:p-8 border border-outline-variant/10 shadow-sm">
          <h2 className="font-headline text-2xl font-bold mb-6">Procedure</h2>
          
          <div className="flex gap-2 mb-6">
              <textarea 
                 value={currentStep} 
                 onChange={e => setCurrentStep(e.target.value)}
                 className="flex-1 bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none resize-none" 
                 placeholder="Describe exactly how to cook this step..." 
                 rows="2"
              />
              <button type="button" onClick={handleAddStep} className="bg-secondary text-white p-4 rounded-xl font-bold active:scale-95 shadow-md flex items-center justify-center">
                 <span className="material-symbols-outlined">add</span>
              </button>
          </div>

          <div className="space-y-4">
             {formData.steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant/10 relative pr-12">
                   <div className="w-8 h-8 flex-shrink-0 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center">{i+1}</div>
                   <p className="mt-1">{step}</p>
                   <button type="button" onClick={() => handleRemoveStep(i)} className="absolute right-4 top-4 material-symbols-outlined text-error hover:bg-error-container p-1 rounded-full">close</button>
                </div>
             ))}
             {formData.steps.length === 0 && <p className="text-center text-on-surface-variant italic p-4">No steps added yet.</p>}
          </div>
        </section>

        <button type="submit" className="w-full bg-[#1a1c19] dark:bg-stone-100 text-white dark:text-stone-900 py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
           <span className="material-symbols-outlined">save</span>
           Save Custom Recipe
        </button>

      </form>
    </div>
  );
}
