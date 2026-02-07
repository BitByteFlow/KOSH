import { FAQAccordionItem } from "./AccordionItem";

interface FAQItem {
	question: string;
	answer: string;
	isOpen?: boolean;
}

interface FAQCategoryProps {
	title: string;
	items: FAQItem[];
}

export function FAQCategory({ title, items }: FAQCategoryProps) {
	return (
		<div className="mb-8">
			<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
				{title}
			</h2>
			<div className="bg-card rounded-lg border border-border overflow-hidden">
				{items.map((item, index) => (
					<FAQAccordionItem
						key={index}
						question={item.question}
						answer={item.answer}
						isOpen={item.isOpen}
					/>
				))}
			</div>
		</div>
	);
}
