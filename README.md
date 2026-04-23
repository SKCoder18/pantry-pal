# PantryPal 🥫✨

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646cf7?logo=vite)](https://vitejs.dev/)
[![Made with PantryPal](https://img.shields.io/badge/Made%20with-PantryPal-006e2c)](https://pantrypal-app.netlify.app/)

**PantryPal** is your intelligent kitchen companion that turns your pantry chaos into culinary magic! 🔮 Scan items, get AI-powered recipe suggestions based on what you *actually have*, chat with your offline AI Chef, and save custom recipes. Works 100% offline, mobile-first design, and feels like a native app.

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <your-repo> pantrypal-app
   cd pantrypal-app
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) – works great on mobile!

3. **Build for Production**
   ```bash
   npm run build
   ```

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🛒 **Smart Inventory** | Add items via scan/search, track quantity/expiry/images/categories. Live dashboard with search. |
| 🤖 **AI Recipe Magic** | Generates personalized recipes from *your* ingredients (offline mock – swap for real Gemini AI easily). |
| 📱 **AI Chef Chat** | Ask \"What do I have?\" or \"How to make pasta?\" – gets inventory, suggests recipes. |
| 🍳 **Recipe Viewer** | Full details + ingredient checker: what you have vs. missing. Step-by-step instructions. |
| 💾 **Custom Recipes** | Create & save your own recipes forever. |
| 📱 **Mobile-First** | Bottom nav, full-screen PWA feel, dark mode, gradients, Material Design icons. |
| ⚡ **Offline-First** | localStorage + IndexedDB. No server needed. |

![Dashboard Screenshot](https://via.placeholder.com/800x400/006e2c/fafaf5?text=PantryPal+Dashboard+%F0%9F%94%8E) <!-- Add your screenshot here! -->

## 📱 Pages & Navigation

- **🏠 Dashboard** (`/`): View all items, quick add, search.
- **➕ Add Item** (`/add`): Scan/add new pantry items.
- **🍽️ Recipes** (`/recipes`): AI suggestions + your customs.
- **🔗 Recipe Detail** (`/recipes/:id`): Ingredients check + steps.
- **💬 AI Chat** (`/chat`): Converse with AI Chef.
- **✏️ Create Recipe** (`/create-recipe`): Build & save custom.

## 🛠️ Tech Stack

```
Frontend: React 18 + React Router v6 + Tailwind CSS 3.4 + Vite 5
Data: localStorage + IndexedDB (utils/database.js, recipeDB.js)
AI: Mock Gemini (services/ai.js – 100% offline, simulates real responses)
Icons: Material Symbols + Lucide React
Styling: Custom Tailwind + CSS (dark mode ready)
```

## 🤖 AI Features (Offline Mock)

- **Recipe Generation**: Dynamically names recipes from your ingredients (e.g., \"Roasted Tomatoes Delight\").
- **Ingredient Matching**: In RecipeDetail, auto-checks your inventory vs. recipe needs.
- **Chat Intelligence**: Handles \"list inventory\", \"count items\", \"recipe for X\".
- **Ready for Real AI**: Swap mock functions in `src/services/ai.js` with `@google/generative-ai`.

## 🧪 Local Testing

1. Run `npm run dev`.
2. Add items via ➕ tab (e.g., \"Tomatoes\", \"Chicken\").
3. Go to Recipes → AI Suggest: See magic!
4. Chat: Ask \"what do I have?\" or \"how to make chicken curry\".

**Pro Tip**: Resize browser to mobile (~375px) for best experience. Add items first for AI to shine!

## 🔮 Roadmap

- [ ] Real Gemini AI integration (API key in env).
- [ ] PWA manifest + service worker.
- [ ] Barcode scanner (QuaggaJS/Zxing).
- [ ] Shopping list from missing ingredients.
- [ ] User auth + cloud sync.
- [ ] Nutrition/expiry alerts.

## 📸 Screenshots

Add your own to `/public/screenshots/` and update links!

## 🙌 Credits

Built with ❤️ using modern web tech. Icons by [Google Material Symbols](https://fonts.google.com/icons).

## 📄 License

MIT – Use freely! See [LICENSE](LICENSE) (create if needed).

---

⭐ **Star on GitHub if you love PantryPal!** Deploy to Netlify/Vercel in 1 click.

