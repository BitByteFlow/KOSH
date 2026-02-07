"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

interface FAQAccordionItemProps {
	question: string;
	answer: string;
	isOpen?: boolean;
}

export function FAQAccordionItem({
	question,
	answer,
	isOpen = false,
}: FAQAccordionItemProps) {
	const [open, setOpen] = useState(isOpen);

	return (
		<div className="border-b border-border">
			<button
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/50 px-2 rounded transition-colors"
			>
				<span className="font-medium text-foreground">{question}</span>
				<ChevronDown
					className={`h-5 w-5 text-muted-foreground transition-transform ${
						open ? "transform rotate-180" : ""
					}`}
				/>
			</button>
			{open && (
				<div className="pb-4 px-2 text-sm text-muted-foreground">{answer}</div>
			)}
		</div>
	);
}
