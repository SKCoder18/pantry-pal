const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.json');

// Initialize db.json if not present
const initializeDb = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ users: [], inventory: [], custom_recipes: [] }, null, 2),
      'utf8'
    );
  }
};
initializeDb();

// Safe thread-safe file reading and writing helper
const readData = () => {
  try {
    initializeDb();
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('JSON DB Read Error:', err);
    return { users: [], inventory: [], custom_recipes: [] };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('JSON DB Write Error:', err);
  }
};

// Expose clean helper methods matching the application needs
const db = {
  users: {
    findByEmail: (email) => {
      const data = readData();
      return data.users.find(u => u.email?.toLowerCase() === email?.toLowerCase()) || null;
    },
    findById: (id) => {
      const data = readData();
      return data.users.find(u => u.id === Number(id)) || null;
    },
    insert: (user) => {
      const data = readData();
      const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id || 0)) + 1 : 1;
      const newUser = {
        id: newId,
        name: user.name,
        email: user.email,
        password: user.password || null,
        google_id: user.google_id || null,
        picture: user.picture || null
      };
      data.users.push(newUser);
      writeData(data);
      return newUser;
    },
    update: (id, updates) => {
      const data = readData();
      const index = data.users.findIndex(u => u.id === Number(id));
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...updates };
        writeData(data);
        return data.users[index];
      }
      return null;
    }
  },
  inventory: {
    findByUserId: (userId) => {
      const data = readData();
      return data.inventory.filter(item => item.user_id === Number(userId))
        .sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
    },
    insert: (userId, item) => {
      const data = readData();
      const newItem = {
        id: item.id || Date.now().toString(),
        user_id: Number(userId),
        name: item.name,
        quantity: item.quantity || '',
        category: item.category || '',
        expiry: item.expiry || '',
        image: item.image || '',
        addedAt: item.addedAt || new Date().toISOString(),
        event_id: item.event_id || null
      };
      data.inventory.push(newItem);
      writeData(data);
      return newItem;
    },
    delete: (id, userId) => {
      const data = readData();
      const initialLength = data.inventory.length;
      data.inventory = data.inventory.filter(item => !(item.id === id && item.user_id === Number(userId)));
      writeData(data);
      return data.inventory.length < initialLength;
    },
    update: (id, userId, updates) => {
      const data = readData();
      const index = data.inventory.findIndex(item => item.id === id && item.user_id === Number(userId));
      if (index !== -1) {
        data.inventory[index] = { ...data.inventory[index], ...updates };
        writeData(data);
        return data.inventory[index];
      }
      return null;
    }
  },
  recipes: {
    findByUserId: (userId) => {
      const data = readData();
      return data.custom_recipes.filter(recipe => recipe.user_id === Number(userId))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },
    insert: (userId, recipe) => {
      const data = readData();
      const newRecipe = {
        id: recipe.id || Date.now().toString(),
        user_id: Number(userId),
        title: recipe.title,
        prepTime: recipe.prepTime || '',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        createdAt: recipe.createdAt || new Date().toISOString()
      };
      data.custom_recipes.push(newRecipe);
      writeData(data);
      return newRecipe;
    }
  }
};

module.exports = db;
