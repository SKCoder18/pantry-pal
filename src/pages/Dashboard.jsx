import React, { useState, useEffect } from 'react';
import { getInventory, deleteItem } from '../services/api';
import { deleteEventFromGoogleCalendar } from '../services/calendar';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user, logout, accessToken } = useAuth();

  useEffect(() => {
    const fetchInventory = async () => {
      let data = await getInventory();
      
      // Auto-deletion logic (Run background deletions so Dashboard loads instantly)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of today
      
      const validItems = data.filter(item => {
        if (item.expiry) {
          const expiryDate = new Date(item.expiry);
          if (expiryDate < today) {
            // Background deletion
            (async () => {
              if (item.event_id && item.event_id !== "false" && accessToken) {
                await deleteEventFromGoogleCalendar(item.event_id, accessToken);
              }
              await deleteItem(item.id);
            })().catch(e => console.error("Auto-delete failed for", item.name, e));
            
            return false; // Filter out from UI immediately
          }
        }
        return true;
      });
      
      setItems(validItems);
    };
    fetchInventory();
  }, [accessToken]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) return;
    
    try {
      if (item.event_id && item.event_id !== "false" && accessToken) {
         await deleteEventFromGoogleCalendar(item.event_id, accessToken);
      }
      await deleteItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete item');
    }
  };

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#fafaf5] dark:bg-stone-950 flex items-center justify-between px-6 py-4 tonal-shift-surface-container-low">
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#2D6A4F] hover:bg-black/5 p-2 rounded-full transition-colors active:scale-95">menu</button>
          <h1 className="font-['Plus_Jakarta_Sans'] tracking-tight text-xl font-bold text-[#1a1c19] dark:text-stone-100">PantryPal</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-on-surface-variant leading-tight">{user?.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm bg-primary-container flex items-center justify-center font-bold text-primary">
            {user?.picture ? (
              <img src={user.picture} alt="User" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <button onClick={logout} className="material-symbols-outlined text-outline hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/50">logout</button>
        </div>
      </header>

      <section className="mb-10 mt-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full bg-surface-container border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all font-medium text-on-surface" placeholder="Search your pantry..." type="text" />
          </div>
          <button onClick={() => navigate('/add')} className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
            Add Items
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-12">
          <div className="flex items-end justify-between mb-8 px-2">
            <div>
              <span className="font-label text-xs uppercase tracking-widest font-bold text-primary mb-1 block">Inventory</span>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight">Your Items ({items.length})</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.length === 0 ? (
              <div className="col-span-full p-10 text-center bg-surface-container rounded-3xl">
                <p className="text-on-surface-variant">Your pantry is empty. Click "Add Items" to start!</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-surface-container-lowest p-5 rounded-[1.5rem] transition-all hover:translate-y-[-4px]">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-surface-container relative">
                    {item.image ? (
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                            <span className="material-symbols-outlined text-4xl text-outline">image</span>
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                      <span className="font-label text-[10px] font-bold text-on-surface">{item.category || 'ITEM'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-headline font-bold text-lg">{item.name}</h4>
                    <button onClick={() => handleDelete(item)} className="material-symbols-outlined text-error hover:bg-error-container/50 p-1 rounded-full transition-colors" title="Delete Item">delete</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                       <span className="material-symbols-outlined text-sm">scale</span>
                       Qty: {item.quantity}
                    </div>
                    {item.expiry && (
                      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        Expires: {item.expiry}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
