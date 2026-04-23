import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from "./pages/Dashboard.jsx";
import AddItem from "./pages/AddItem.jsx";
import Recipes from "./pages/Recipes.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import AIChat from "./pages/AIChat.jsx";
import CreateRecipe from "./pages/CreateRecipe.jsx";
import Login from "./pages/Login.jsx";

const BottomNavBar = () => {
  const getNavClass = ({ isActive }) =>
    `flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-300 ${
      isActive
        ? "bg-[#006e2c] dark:bg-emerald-800 text-white rounded-full"
        : "text-[#404943] dark:text-stone-400 hover:text-[#2D6A4F]"
    }`;

  const location = useLocation();
  if (location.pathname === '/login') return null;

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

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
        <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
      </Routes>
      <BottomNavBar />
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '439866933419-q1dt701taifadom9p5ejts0r1cjnfp9j.apps.googleusercontent.com'}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
