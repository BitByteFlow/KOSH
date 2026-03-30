import React from "react";
import { Scan, Search } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

interface CheckoutActionsProps {
	isSearching: boolean;
	onScanClick: () => void;
	onSearchClick: () => void;
}

export const CheckoutActions: React.FC<CheckoutActionsProps> = React.memo(
	({ isSearching, onScanClick, onSearchClick }) => {
		return (
			<section
				className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-8"
				aria-label="Product addition methods"
			>
				<Button
					onClick={onScanClick}
					size="lg"
					className="flex-1 h-16 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-4 text-white text-sm sm:text-lg font-bold shadow-lg shadow-primary/20"
					aria-label="Open barcode scanner"
				>
					<Scan
						size={24}
						className="sm:w-8 sm:h-8"
						aria-hidden="true"
					/>
					<div className="text-left hidden xs:block">
						<p>Barcode</p>
						<p className="text-[9px] sm:text-[10px] font-medium opacity-80 uppercase tracking-widest">
							Scanner
						</p>
					</div>
				</Button>

				<Button
					onClick={onSearchClick}
					variant={isSearching ? "secondary" : "outline"}
					size="lg"
					className={`flex-1 h-16 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-4 text-sm sm:text-lg font-bold border-2 ${
						isSearching
							? "border-primary"
							: "bg-white border-slate-200 shadow-sm"
					}`}
					aria-label={isSearching ? "Close search" : "Open product search"}
					aria-pressed={isSearching}
				>
					<Search
						size={24}
						className="sm:w-8 sm:h-8 text-slate-400"
						aria-hidden="true"
					/>
					<div className="text-left hidden xs:block">
						<p>Search</p>
						<p className="text-[9px] sm:text-[10px] font-medium opacity-60 uppercase tracking-widest">
							Products
						</p>
					</div>
				</Button>
			</section>
		);
	},
);

CheckoutActions.displayName = "CheckoutActions";

export default CheckoutActions;
