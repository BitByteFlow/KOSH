import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
	ShoppingCart,
	History,
	BookOpen,
	LogOut,
	ChevronDown,
	Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@kosh/ui/components/avatar";
import { useAuth } from "../context/AuthContext";
import { Button } from "@kosh/ui/components/button";

const Layout: React.FC = () => {
	const { user, store, logout } = useAuth();
	const navigate = useNavigate();
	const [showUserMenu, setShowUserMenu] = useState(false);

	const handleLogout = () => {
		setShowUserMenu(false);
		logout();
		navigate("/login", { replace: true });
	};

	const userInitials = user?.username
		? user.username
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "CA";

	return (
		<div className="flex flex-col h-screen bg-slate-50 text-slate-900">
			<header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-50">
				<div className="flex items-center gap-2">
					<img
						src="/logo.svg"
						alt="Kosh's logo"
					/>
					<h1 className="font-bold italic text-lg tracking-tight uppercase text-slate-900">
						KOSH
					</h1>
				</div>

				<div className="relative">
					<Button
						variant={"ghost"}
						onClick={() => setShowUserMenu((v) => !v)}
						className="flex items-center gap-3 p-4  rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
					>
						<div className="text-right hidden sm:block">
							<p className="text-sm font-bold leading-none text-slate-800">
								{user?.username ?? "Cashier"}
							</p>
							<div className="flex items-center justify-end gap-1 mt-0.5">
								<Store
									size={9}
									className="text-slate-400"
								/>
								<p className="text-[10px] text-slate-500 font-medium truncate max-w-30">
									{store?.storeName ?? "No Store"}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-1">
							<Avatar className="h-8 w-8 border border-slate-200">
								<AvatarFallback className="bg-primary text-white font-bold text-xs">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<ChevronDown
								size={14}
								className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
							/>
						</div>
					</Button>

					<AnimatePresence>
						{showUserMenu && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: -8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -8 }}
								transition={{ duration: 0.15 }}
								className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
							>
								<div className="p-4 border-b border-slate-50 bg-slate-50/50">
									<p className="font-black text-slate-900 leading-tight">
										{user?.username}
									</p>
									<p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
									<div className="flex items-center gap-1.5 mt-2">
										<Store
											size={11}
											className="text-primary"
										/>
										<p className="text-xs font-bold text-primary truncate">
											{store?.storeName}
										</p>
									</div>
								</div>
								<div className="p-2">
									<Button
										variant={"ghost"}
										onClick={handleLogout}
										className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
									>
										<LogOut size={16} />
										Sign Out
									</Button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</header>

			<main className="flex-1 overflow-auto bg-slate-50">
				<Outlet />
			</main>

			<nav className="h-16 bg-white border-t border-slate-200 px-4 flex items-center justify-around">
				<NavItem
					to="/"
					icon={<ShoppingCart size={20} />}
					label="Checkout"
				/>
				<NavItem
					to="/sales-history"
					icon={<History size={20} />}
					label="Sales"
				/>
				<NavItem
					to="/daily-transactions"
					icon={<BookOpen size={20} />}
					label="Ledger"
				/>
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
		end={to === "/"}
		className={({ isActive }) =>
			`relative flex flex-col items-center justify-center gap-1 h-full px-5 transition-all ${
				isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
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
				<div
					className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
				>
					{icon}
				</div>
				<span className="text-xs font-semibold tracking-wider">
					{label}
				</span>
			</>
		)}
	</NavLink>
);

export default Layout;
