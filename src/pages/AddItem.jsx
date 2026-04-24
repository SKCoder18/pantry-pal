import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addItem } from '../services/api';
import { INGREDIENTS_DB } from '../utils/database';
import { useAuth } from '../context/AuthContext';
import { addEventToGoogleCalendar } from '../services/calendar';

export default function AddItem() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { accessToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: 'Produce',
    expiry: '',
    image: null
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDB, setFilteredDB] = useState([]);

  // Handle Autocomplete filtering
  useEffect(() => {
    if (formData.name && showSuggestions) {
      const query = formData.name.toLowerCase();
      const results = INGREDIENTS_DB.filter(item => item.name.toLowerCase().includes(query));
      setFilteredDB(results);
    } else {
      setFilteredDB([]);
    }
  }, [formData.name, showSuggestions]);

  const handleSelectPredefined = (item) => {
    setFormData({
      ...formData,
      name: item.name,
      image: item.image, // high quality stock URL
      category: item.category || formData.category // Auto-select category
    });
    setShowSuggestions(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // FIX For Massive Android/iOS Camera files: Use createObjectURL to bypass FileReader memory caps
      const objectUrl = URL.createObjectURL(file);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400; // Force tiny thumbnail compress
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to low quality jpeg (0.6)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
        setFormData({ ...formData, image: compressedDataUrl });
        
        // Cleanup memory
        URL.revokeObjectURL(objectUrl);
      };
      
      // Safety failover if image breaks
      img.onerror = () => {
         console.warn("Canvas failed, applying raw file limit");
         setFormData({...formData, image: objectUrl});
      }
      
      img.src = objectUrl;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert("Please enter an item name.");
    
    setIsSaving(true);
    try {
      let event_id = null;
      if (formData.expiry && accessToken) {
        event_id = await addEventToGoogleCalendar(formData.name, formData.expiry, accessToken);
      }
      
      // If event creation failed, it returns false. Don't save "false" as a string in DB.
      const finalEventId = event_id === false ? null : event_id;
      
      await addItem({ ...formData, event_id: finalEventId });
      
    } catch (e) {
      console.error(e);
      alert('Failed to save item');
    }
    
    setIsSaving(false);
    navigate('/');
  };

  return (
    <div className="pt-24 pb-32 px-4 md:px-6 max-w-2xl mx-auto">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#fafaf5]/90 backdrop-blur-md dark:bg-stone-950/90 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="material-symbols-outlined text-[#2D6A4F] hover:bg-black/5 p-2 rounded-full transition-colors active:scale-95">arrow_back</button>
          <h1 className="text-xl font-bold text-[#1a1c19] dark:text-stone-100 font-['Plus_Jakarta_Sans'] tracking-tight">Add Ingredient</h1>
        </div>
      </header>
      
      <section className="mb-8 mt-4">
        <div className="bg-primary-container rounded-[2rem] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="z-10 text-center md:text-left flex-1 w-full">
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-on-primary-container leading-tight mb-2">Item Image</h2>
            <p className="text-on-primary-container/80 text-sm mb-6 max-w-xs mx-auto md:mx-0">Type an item name below to auto-fetch an image, or upload a custom photo.</p>
            <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
            />
            <button onClick={() => fileInputRef.current?.click()} className="w-full md:w-auto bg-primary-fixed text-on-primary-fixed px-6 py-4 rounded-full font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg hover:shadow-primary/20">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add_a_photo</span>
                Upload Custom Photo
            </button>
          </div>
          <div className="z-10 w-48 h-48 md:w-1/3 aspect-square max-w-full bg-surface-container-lowest/40 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center overflow-hidden shadow-sm">
            {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <div className="relative">
                  <span className="material-symbols-outlined text-6xl text-on-primary-container opacity-40">image</span>
                </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">Details Entry</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2 relative">
            <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Product Name</label>
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3 focus-within:bg-surface-container-high transition-colors focus-within:ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-primary">search</span>
              <input 
                 value={formData.name} 
                 onChange={e=> {
                     setFormData({...formData, name: e.target.value});
                     setShowSuggestions(true);
                 }} 
                 onFocus={() => setShowSuggestions(true)}
                 className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface placeholder:text-outline/50 outline-none font-bold text-lg" 
                 placeholder="e.g. Sugar, Tomato..." 
                 type="text" 
                 required
              />
            </div>
            
            {/* Database Autocomplete Dropdown */}
            {showSuggestions && filteredDB.length > 0 && (
                <div className="absolute z-50 w-full bg-white dark:bg-surface-container-highest shadow-2xl rounded-2xl top-[110%] overflow-hidden border border-outline-variant/30 flex flex-col max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {filteredDB.map((item, idx) => (
                        <div 
                           key={idx} 
                           onClick={() => handleSelectPredefined(item)}
                           className="flex items-center gap-4 p-3 hover:bg-primary-container/50 cursor-pointer transition-colors border-b border-outline-variant/10 last:border-b-0"
                        >
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                                <h4 className="font-bold text-on-surface">{item.name}</h4>
                                <p className="text-xs text-on-surface-variant">Tap to autofill image</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-primary opacity-50">arrow_forward_ios</span>
                        </div>
                    ))}
                </div>
            )}
          </div>
          
          <div className="space-y-2 mt-2">
            <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Quantity</label>
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3 focus-within:ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-outline">scale</span>
              <input value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value})} className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface outline-none" placeholder="e.g. 1 kg, 2 packs" type="text"/>
            </div>
          </div>
          
          <div className="space-y-2 mt-2">
            <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Category</label>
            <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between group cursor-pointer relative focus-within:ring-2 ring-primary/20">
              <div className="flex items-center gap-3 w-full">
                <span className="material-symbols-outlined text-outline">category</span>
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface outline-none appearance-none cursor-pointer">
                  <option>Produce</option>
                  <option>Dairy</option>
                  <option>Meat</option>
                  <option>Pantry</option>
                  <option>Bakery</option>
                </select>
              </div>
              <span className="material-symbols-outlined text-outline absolute right-4 pointer-events-none">expand_more</span>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-2 mt-2">
            <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Expiry Date (Optional)</label>
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3 focus-within:ring-2 ring-primary/20">
              <span className="material-symbols-outlined text-outline">calendar_today</span>
              <input value={formData.expiry} onChange={e=>setFormData({...formData, expiry: e.target.value})} className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface outline-none" type="date"/>
            </div>
          </div>
          
          <button type="submit" disabled={isSaving} className="md:col-span-2 mt-8 w-full bg-gradient-to-r from-primary to-[#204e39] text-white py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-70">
            <span className="material-symbols-outlined">add_circle</span>
            {isSaving ? 'Saving...' : 'Save to Pantry'}
          </button>
        </form>
      </section>
    </div>
  );
}
