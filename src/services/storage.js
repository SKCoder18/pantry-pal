export const getInventory = () => {
  const data = localStorage.getItem('pantrypal-inventory');
  return data ? JSON.parse(data) : [];
};

export const saveInventory = (items) => {
  localStorage.setItem('pantrypal-inventory', JSON.stringify(items));
};

export const addItem = (item) => {
  const items = getInventory();
  items.unshift({
    ...item,
    id: Date.now().toString(),
    addedAt: new Date().toISOString()
  });
  saveInventory(items);
};

export const getCustomRecipes = () => {
  const data = localStorage.getItem('pantrypal-custom-recipes');
  return data ? JSON.parse(data) : [];
};

export const saveCustomRecipe = (recipe) => {
  const recipes = getCustomRecipes();
  recipes.unshift({
    ...recipe,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('pantrypal-custom-recipes', JSON.stringify(recipes));
};
