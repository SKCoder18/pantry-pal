import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import AddItem from "./pages/AddItem.jsx";
import Recipes from "./pages/Recipes.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import AIChat from "./pages/AIChat.jsx";
import CreateRecipe from "./pages/CreateRecipe.jsx";

const BottomNavBar = () => {
  const getNavClass = ({ isActive }) =>
    `flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-300 ${
      isActive
        ? "bg-[#006e2c] dark:bg-emerald-800 text-white rounded-full"
        : "text-[#404943] dark:text-stone-400 hover:text-[#2D6A4F]"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg flex justify-around items-center px-8 pb-2 z-50 rounded-t-[32px] shadow-[0_-12px_24px_rgba(0,0,0,0.06)]">
      <NavLink to="/" className={getNavClass}>
        <span className="material-symbols-outlined mb-1">inventory_2</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] uppercase tracking-wider font-semibold">Inventory</span>
      </NavLink>
      <NavLink to="/add" className={getNavClass}>
        <span className="material-symbols-outlined mb-1">qr_code_scanner</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] uppercase tracking-wider font-semibold">Scan</span>
      </NavLink>
      <NavLink to="/recipes" className={getNavClass}>
        <span className="material-symbols-outlined mb-1">restaurant_menu</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] uppercase tracking-wider font-semibold">Recipes</span>
      </NavLink>
      <NavLink to="/chat" className={getNavClass}>
        <span className="material-symbols-outlined mb-1">smart_toy</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] uppercase tracking-wider font-semibold">AI Chat</span>
      </NavLink>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="bg-surface text-on-surface font-body min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/chat" element={<AIChat />} />
        </Routes>
        <BottomNavBar />
      </div>
    </BrowserRouter>
  );
}

export default App;
