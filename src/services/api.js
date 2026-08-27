const API_URL = import.meta.env.VITE_API_URL || 'https://pantry-pal-utm8.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pantrypal_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper for safe fetch JSON response handling
const handleJsonResponse = async (res, defaultErrorMessage) => {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const errorMsg = data?.message || data?.error || defaultErrorMessage;
    throw new Error(errorMsg);
  }
  return data;
};

// --- AUTH ---
export const registerUser = async (name, email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return await handleJsonResponse(res, 'Registration failed');
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR');
    }
    throw err;
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await handleJsonResponse(res, 'Login failed');
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR');
    }
    throw err;
  }
};

export const googleLoginSync = async (userInfo) => {
  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        google_id: userInfo.sub
      })
    });
    return await handleJsonResponse(res, 'Google sync failed');
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR');
    }
    throw err;
  }
};

// --- INVENTORY ---
export const getInventory = async () => {
  try {
    const res = await fetch(`${API_URL}/inventory`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch inventory', error);
    return [];
  }
};

export const saveInventory = async (items) => {
  // We don't save the whole array to the backend at once usually, 
  // but if needed we can implement a bulk sync. For now, addItem handles individual saves.
};

export const addItem = async (item) => {
  const newItem = {
    ...item,
    id: Date.now().toString(),
    addedAt: new Date().toISOString()
  };
  
  const res = await fetch(`${API_URL}/inventory`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newItem)
  });
  
  if (!res.ok) throw new Error('Failed to add item');
  return newItem;
};

export const deleteItem = async (id) => {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete item');
  return res.json();
};

// --- RECIPES ---
export const getCustomRecipes = async () => {
  try {
    const res = await fetch(`${API_URL}/recipes`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch recipes', error);
    return [];
  }
};

export const saveCustomRecipe = async (recipe) => {
  const newRecipe = {
    ...recipe,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  const res = await fetch(`${API_URL}/recipes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newRecipe)
  });
  
  if (!res.ok) throw new Error('Failed to add recipe');
  return newRecipe;
};

// --- CHAT ---
export const sendChatMessage = async (messages, userMsg) => {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ messages, userMsg })
  });
  return await handleJsonResponse(res, 'Failed to send chat message.');
};
