// Mock AI Service - Works 100% offline without any API keys!
import { RECIPE_DB } from '../utils/recipeDB';
import { getCustomRecipes } from './storage';
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const suggestRecipesFromIngredients = async (itemsList) => {
  await wait(1800); // Simulate network latency to feel like AI
  
  const hasItems = itemsList && itemsList.length > 0;
  
  if (!hasItems) {
      return [
        { title: "Classic Vegetable Toss", description: "A simple mix of whatever veggies you have left.", time: "10 MINS", match: "50" }
      ];
  }

  // Grab up to 2 ingredients to dynamically name the recipe!
  const ing1 = itemsList[0]?.name || "Vegetable";
  const ing2 = itemsList[1]?.name || "Spice";

  return [
    { 
      id: "mock-1",
      title: `Roasted ${ing1} Delight`, 
      description: `A beautiful roasted dish featuring your fresh ${ing1}, perfectly seasoned.`, 
      time: "25 MINS", 
      match: "95" 
    },
    { 
      id: "mock-2",
      title: `${ing1} & ${ing2} Stir Fry`, 
      description: `Quick and easy wok-tossed ${ing1} paired with ${ing2} for maximum flavor.`, 
      time: "15 MINS", 
      match: "85" 
    },
    { 
      id: "mock-3",
      title: `Creamy ${ing2} Bowl`, 
      description: `A comforting, creamy base topped with hearty ingredients.`, 
      time: "40 MINS", 
      match: "78" 
    }
  ];
};

export const getRecipeDetails = async (recipeName, itemsList) => {
  await wait(1000); // Simulate processing

  const userItems = itemsList.map(i => i.name.toLowerCase());
  
  // 1. Search for exact match in Built-in or Custom Recipes
  const customRecipes = getCustomRecipes();
  const matchedRecipe = customRecipes.find(r => r.title === recipeName) || RECIPE_DB.find(r => r.title === recipeName);

  if (matchedRecipe) {
      const have = [];
      const missing = [];
      
      matchedRecipe.ingredients.forEach(needed => {
          // Simplify ingredient string to match against inventory (e.g., "Chicken - 500g" -> "chicken")
          const simplifiedNeeded = needed.split("-")[0].trim().toLowerCase();
          const found = userItems.some(i => i.includes(simplifiedNeeded) || simplifiedNeeded.includes(i));
          if (found) {
              have.push(needed);
          } else {
              missing.push(needed);
          }
      });

      return {
          title: matchedRecipe.title,
          time: matchedRecipe.time,
          difficulty: matchedRecipe.difficulty || "Medium",
          ingredients_have: have,
          ingredients_missing: missing,
          steps: matchedRecipe.steps
      };
  }
  
  // 2. Fallback to generic Mock AI if it's a completely runtime generated recipe

  const allNeededIngredients = [
    recipeName.split(" ")[0] || "Vegetables", // mostly use title
    "Onion",
    "Tomato",
    "Garlic",
    "Cooking Oil",
    "Salt",
    "Spices"
  ];
  
  const have = [];
  const missing = [];
  
  allNeededIngredients.forEach(needed => {
      // Very simple mock intelligence check
      const found = userItems.some(i => i.includes(needed.toLowerCase()) || needed.toLowerCase().includes(i));
      if (found) {
          have.push(needed);
      } else {
          missing.push(needed);
      }
  });
  
  // If user actually has an item not listed, add it randomly to 'have' to make it feel smart
  if (itemsList.length > 0 && have.length === 0) {
      have.push(itemsList[0].name);
  }

  return {
    title: recipeName,
    time: "30 MINS",
    difficulty: "Medium",
    ingredients_have: have,
    ingredients_missing: missing,
    steps: [
      `Wash and prep your ingredients, ensuring your ${have[0] || 'vegetables'} are ready.`,
      "Heat cooking oil in a large pan over medium heat.",
      `Add the ${missing.includes("Onion") ? "onion (once you buy it!)" : "onion"} and sauté until translucent.`,
      `Incorporate the ${have.join(" and ")} into the pan.`,
      "Cook for 10-15 minutes, stirring occasionally.",
      "Season generously with salt and spices.",
      `Serve your warm "${recipeName}" immediately and enjoy!`
    ]
  };
};

export const chatWithPantryAI = async (messages, userMsg, itemsList) => {
  await wait(1000); // Simulate AI typing latency

  const lowerMsg = userMsg.toLowerCase();
  
  // 1. Inventory Counting Logic
  if (lowerMsg.includes("how many") || lowerMsg.includes("count") || lowerMsg.includes("total")) {
      if (itemsList.length === 0) return { text: "Your pantry is currently empty! You don't have any items." };
      
      const count = itemsList.length;
      let categories = {};
      itemsList.forEach(i => {
         const cat = i.category || 'Other';
         categories[cat] = (categories[cat] || 0) + 1;
      });
      
      let breakdown = Object.entries(categories).map(([c, num]) => `${num} in ${c}`).join(", ");
      return { 
         text: `You have a total of ${count} items in your inventory right now. \n\nBreakdown: ${breakdown}.` 
      };
  }

  // 2. Inventory Listing Logic
  if (lowerMsg.includes("what do i have") || lowerMsg.includes("ingredients") || lowerMsg.includes("pantry") || lowerMsg.includes("list")) {
      if (itemsList.length === 0) return { text: "It looks like your pantry is completely empty right now! Try scanning some items in." };
      const items = itemsList.map(i => i.name).join(", ");
      return { text: `You currently have: ${items}. Would you like me to suggest a recipe with these?` };
  }
  
  // 3. Exact Recipe Search Logic
  if (lowerMsg.includes("how to make") || lowerMsg.includes("recipe") || lowerMsg.includes("cook")) {
     // Extract potential recipe name by removing conversational words
     let searchTerms = lowerMsg.replace("how to make", "").replace("recipe for", "").replace("can you cook", "").trim();
     
     if (searchTerms.length > 2) {
         // Search RECIPE_DB and Custom Recipes
         const customRecipes = getCustomRecipes();
         const allRecipes = [...customRecipes, ...RECIPE_DB];
         
         const match = allRecipes.find(r => r.title.toLowerCase().includes(searchTerms) || searchTerms.includes(r.title.toLowerCase()));
         
         if (match) {
             return {
                 text: `I found the perfect recipe for ${match.title}! It takes about ${match.time} to make. Want to see the full steps and check if you have the ingredients?`,
                 actionLink: `/recipes/${encodeURIComponent(match.title)}`,
                 actionText: `View ${match.title}`
             };
         }
     }

     if (itemsList.length === 0) return { text: "You need some ingredients first before we can cook!" };
     const ing = itemsList[0]?.name || "ingredients";
     return { 
         text: `I couldn't find a specific recipe for that in your custom or built-in databases. But why don't you try making a warm ${ing} stew? Check out the Recipes tab to generate AI suggestions!`,
         actionLink: '/recipes',
         actionText: 'Go to Recipes'
     };
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      return { text: "Hello there! I'm your local AI Assistant. Tell me what you'd like to cook, or ask me to check your inventory!" };
  }

  return { text: "That sounds interesting! I am operating in Local Mode right now. You can ask me to count your inventory, list your ingredients, or ask 'how to make [recipe name]'." };
};
