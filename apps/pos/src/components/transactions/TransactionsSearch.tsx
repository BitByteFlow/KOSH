import React from "react";
import { Search } from "lucide-react";
import { Input } from "@kosh/ui/components/input";

interface TransactionsSearchProps {
	searchTerm: string;
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
}

export const TransactionsSearch: React.FC<TransactionsSearchProps> =
	React.memo(({ searchTerm, onSearchChange, placeholder }) => {
		return (
			<div className="relative w-full sm:w-80">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
					size={16}
					aria-hidden="true"
				/>
				<Input
					placeholder={placeholder || "Search transactions..."}
					className="pl-10 bg-white border-slate-200 h-10 text-sm"
					value={searchTerm}
					onChange={onSearchChange}
					aria-label="Search transactions by ID, payment type, or customer name"
				/>
			</div>
		);
	});

TransactionsSearch.displayName = "TransactionsSearch";

export default TransactionsSearch;
