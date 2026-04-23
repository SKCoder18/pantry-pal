const API_URL = 'https://pantry-pal-utm8.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pantrypal_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// --- AUTH ---
export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Registration failed');
  }
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
};

export const googleLoginSync = async (userInfo) => {
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
  if (!res.ok) throw new Error('Google sync failed');
  return res.json();
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
