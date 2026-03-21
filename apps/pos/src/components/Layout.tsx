import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ShoppingCart, History, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@kosh/ui/components/avatar";

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            K
          </div>
          <h1 className="font-bold text-lg tracking-tight uppercase">KOSH POS</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">Main Store</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Cashier Session</p>
          </div>
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarImage src="" />
            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs uppercase">AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50 custom-scrollbar">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile-first, but styled nicely) */}
      <nav className="h-16 bg-white border-t border-slate-200 px-4 flex items-center justify-around">
        <NavItem to="/" icon={<ShoppingCart size={20} />} label="Checkout" />
        <NavItem to="/transactions" icon={<History size={20} />} label="History" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `relative flex flex-col items-center justify-center gap-1 w-20 h-full transition-all ${
        isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div
            layoutId="nav-glow"
            className="absolute top-0 w-12 h-1 bg-primary rounded-b-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </>
    )}
  </NavLink>
);

export default Layout;
