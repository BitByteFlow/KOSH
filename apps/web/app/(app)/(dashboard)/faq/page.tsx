import { FAQHero } from "@/modules/faq/components/Hero";
import { FAQCategory } from "@/modules/faq/components/Category";
import { FAQFooter } from "@/modules/faq/components/Footer";

const faqData = [
	{
		title: "General & Onboarding",
		items: [
			{
				question: "Is there a free trial available?",
				answer:
					"Yes, we offer a 14-day trial for all new accounts. You get full access to all features, including advanced analytics and multi-user support, with no credit card required upfront.",
				isOpen: true,
			},
			{
				question: "Can I invite my team members?",
				answer:
					"Absolutely! You can invite unlimited team members to your Invento account. Each team member can have customized roles and permissions based on your preferences.",
			},
			{
				question: "Is my data secure?",
				answer:
					"Yes, we use enterprise-grade encryption for all data transmission and storage. Your data is protected with industry-standard security measures and regular security audits.",
			},
		],
	},
	{
		title: "Inventory & Catalog",
		items: [
			{
				question: "How do I bulk import products?",
				answer:
					'You can import products using our CSV template. Navigate to the Catalog section, click "Actions", and select "Import CSV". We support up to 10,000 SKUs per import file.',
				isOpen: true,
			},
			{
				question: "Does Invento support low stock alerts?",
				answer:
					"Yes. You can set individual reorder points for each SKU. When stock falls below your threshold, we will send a notification via email or Slack, and highlight the item on your dashboard.",
			},
			{
				question: "Can I track inventory across multiple locations?",
				answer:
					"Yes, Invento supports multi-location inventory tracking. You can manage stock levels, transfers, and reporting across all your store locations from one dashboard.",
			},
		],
	},
	{
		title: "Billing & Plans",
		items: [
			{
				question: "How does billing work?",
				answer:
					"We bill monthly or annually. Annual plans come with a 20% discount. You can pay via any major credit card (Visa, Mastercard, Amex). Invoices are sent to your account email automatically.",
			},
			{
				question: "Can I change my plan later?",
				answer:
					"Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any charges or credits accordingly.",
			},
		],
	},
];

export default function FAQPage() {
	return (
		<main className="flex-1 overflow-auto">
			<div className="p-8 max-w-4xl mx-auto">
				<FAQHero />
				{faqData.map((category) => (
					<FAQCategory
						key={category.title}
						title={category.title}
						items={category.items}
					/>
				))}
				<FAQFooter />
			</div>
		</main>
	);
}
