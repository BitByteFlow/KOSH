import React from "react";
import { Scan } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@kosh/ui/components/card";
import { Button } from "@kosh/ui/components/button";

interface EmptyStateProps {
	onScanClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
	({ onScanClick }) => {
		return (
			<motion.div
				key="empty"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="h-full"
			>
				<Card className="h-full flex flex-col items-center justify-center text-center py-20 bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl shadow-none">
					<Button
						className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-6 group hover:scale-110 transition-transform cursor-pointer"
						onClick={onScanClick}
						aria-label="Start scanning products"
					>
						<Scan
							size={40}
							className="text-slate-200 group-hover:text-primary transition-colors"
							aria-hidden="true"
						/>
					</Button>
					<h3 className="text-xl font-bold text-slate-800 tracking-tight">
						Ready for Transaction
					</h3>
					<p className="text-sm text-slate-500 mt-2 max-w-70 leading-relaxed">
						Scan a barcode or search for products to begin a new sale session.
					</p>
				</Card>
			</motion.div>
		);
	},
);

EmptyState.displayName = "EmptyState";

export default EmptyState;
