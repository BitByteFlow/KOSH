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
				className="grid grid-cols-2 gap-4 mb-8"
				aria-label="Product addition methods"
			>
				<Button
					onClick={onScanClick}
					size="lg"
					className="flex-1 h-20 rounded-2xl flex items-center justify-center gap-4 text-white text-lg font-bold shadow-lg shadow-primary/20"
					aria-label="Open barcode scanner"
				>
					<Scan
						size={32}
						aria-hidden="true"
					/>
					<div className="text-left">
						<p>Barcode Scanner</p>
						<p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">
							Front or Rear Camera
						</p>
					</div>
				</Button>

				<Button
					onClick={onSearchClick}
					variant={isSearching ? "secondary" : "outline"}
					size="lg"
					className={`flex-1 h-20 rounded-2xl flex items-center justify-center gap-4 text-lg font-bold border-2 ${
						isSearching
							? "border-primary"
							: "bg-white border-slate-200 shadow-sm"
					}`}
					aria-label={isSearching ? "Close search" : "Open product search"}
					aria-pressed={isSearching}
				>
					<Search
						size={32}
						className={isSearching ? "text-primary" : "text-slate-400"}
						aria-hidden="true"
					/>
					<div className="text-left">
						<p>Manual Search</p>
						<p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">
							Search Inventory
						</p>
					</div>
				</Button>
			</section>
		);
	},
);

CheckoutActions.displayName = "CheckoutActions";

export default CheckoutActions;
