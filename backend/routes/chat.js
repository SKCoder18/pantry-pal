const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-pantrypal';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const responseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    action: {
      type: "object",
      properties: {
        type: { 
          type: "string", 
          enum: ["ADD", "DELETE", "UPDATE", "DELETE_CONFIRM_REQUEST", "NONE"] 
        },
        item: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "string" },
            category: { type: "string" }
          },
          required: ["name"]
        }
      },
      required: ["type"]
    }
  },
  required: ["message", "action"]
};

router.post('/', authMiddleware, async (req, res) => {
  const { messages, userMsg } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  if (!userMsg) {
    return res.status(400).json({ error: 'User message is required.' });
  }

  try {
    const userId = req.user.id;
    // Get live pantry data for this authenticated user only
    const userInventory = db.inventory.findByUserId(userId);
    const inventoryText = userInventory.map(i => 
      `- ${i.name}: ${i.quantity || 'unknown quantity'} (category: ${i.category || 'Other'}, expires: ${i.expiry || 'no expiry date'})`
    ).join('\n');

    // Build the system prompt dynamically
    const systemInstruction = `You are PantryPal AI, a practical personal cooking assistant that helps users understand their pantry, decide what to cook, create recipes, answer cooking questions, provide substitutions, and help manage pantry items.

Your rules:
1. Answer the user's actual question.
2. Do not unnecessarily redirect users to the Recipes page.
3. Use the user's pantry data when relevant.
4. The user's current pantry inventory is:
${inventoryText || '(No items in pantry)'}
Never claim an ingredient exists in the user's pantry unless it is listed in the inventory above.
5. Never invent pantry quantities or expiry dates.
6. Clearly mention missing ingredients when relevant.
7. Give practical recipes with quantities and step-by-step instructions when asked.
8. Respect user constraints (e.g. time, budget, vegetarian, no oven, servings).
9. Keep responses concise, clear, and highly useful.
10. Ask a short clarification question only when necessary.
11. Do not return technical/debugging information.

For pantry management actions:
- If the user asks to add an item, you MUST output type: "ADD" with the item name, quantity (and category if mentioned, choosing from Pantry, Dairy, Produce, Meat, Bakery, Other).
- If the user asks to update an item's quantity (e.g., "change rice to 3 kg" or "update rice to 10 kg"), you MUST output type: "UPDATE" with the item name and new quantity.
- For DELETE/remove operations (e.g., "delete milk"), if the user has NOT explicitly confirmed it yet in the previous message, you MUST output type: "DELETE_CONFIRM_REQUEST" and ask them: "Do you want me to remove [Item Name] from your pantry?" in your message. DO NOT output type: "DELETE" yet.
- Only output type: "DELETE" if the user has explicitly confirmed the deletion (e.g., in response to your confirmation request, they said "yes", "confirm", "go ahead"). Otherwise, use type: "NONE".
- If no action is needed (e.g., general conversation, recipe question, substitution query), you MUST output type: "NONE".
`;

    // Map conversation history
    const contents = (messages || []).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Ensure contents is not empty
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: userMsg }] });
    }

    // Call Google Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const responseText = result.response.text();
    const aiResult = JSON.parse(responseText);

    let finalMessage = aiResult.message;
    const action = aiResult.action;

    // Process structured actions on the backend
    if (action && action.type !== 'NONE') {
      const name = action.item?.name;
      const qty = action.item?.quantity || '';
      const category = action.item?.category || 'Other';

      if (action.type === 'ADD') {
        if (name) {
          db.inventory.insert(userId, { name, quantity: qty, category });
          console.log(`[AI-Chat] Added ${name} (${qty}) for user ${userId}`);
        }
      } else if (action.type === 'UPDATE') {
        if (name) {
          const items = db.inventory.findByUserId(userId);
          const match = items.find(i => i.name.toLowerCase() === name.toLowerCase());
          if (match) {
            db.inventory.update(match.id, userId, { quantity: qty });
            console.log(`[AI-Chat] Updated ${name} to ${qty} for user ${userId}`);
          } else {
            // If item not found, we fallback to adding it
            db.inventory.insert(userId, { name, quantity: qty, category });
            finalMessage = `I couldn't find ${name} to update, so I've added it to your pantry with a quantity of ${qty}.`;
          }
        }
      } else if (action.type === 'DELETE') {
        if (name) {
          const items = db.inventory.findByUserId(userId);
          const match = items.find(i => i.name.toLowerCase() === name.toLowerCase());
          if (match) {
            db.inventory.delete(match.id, userId);
            console.log(`[AI-Chat] Deleted ${name} for user ${userId}`);
          } else {
            finalMessage = `I couldn't find ${name} in your pantry to delete.`;
          }
        }
      }
    }

    res.json({ text: finalMessage, action });
  } catch (error) {
    console.error('Gemini API/Chat Router Error:', error);
    res.status(500).json({ error: 'Server error', message: 'I ran into an issue communicating with my AI model. Please try again.' });
  }
});

module.exports = router;
