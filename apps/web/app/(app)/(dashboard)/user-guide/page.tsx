"use client";

import { Button } from "@kosh/ui/components/button";
import { TopicCard } from "@/modules/user-guide/components/TopicCard";
import { ArticleItem } from "@/modules/user-guide/components/ArticleItem";
import { SupportCard } from "@/modules/user-guide/components/SupportCard";
import { VideoTutorials } from "@/modules/user-guide/components/VideoTutorials";
import { SearchHeader } from "@/modules/user-guide/components/SearchHeader";
import {
	Zap,
	Package,
	ShoppingCart,
	BarChart3,
	CreditCard,
	Code2,
	Headphones,
} from "lucide-react";

const topics = [
	{
		icon: Zap,
		title: "Getting Started",
		description: "Setup your store, configure settings, and learn the basics.",
	},
	{
		icon: Package,
		title: "Inventory Management",
		description: "Manage products, variants, stock levels, and suppliers.",
	},
	{
		icon: ShoppingCart,
		title: "Sales & Orders",
		description: "Process orders, handle returns, and manage customers.",
	},
	{
		icon: BarChart3,
		title: "Analytics & Reporting",
		description: "Understand your data, export reports, and track growth.",
	},
	{
		icon: CreditCard,
		title: "Billing & Subscription",
		description: "Manage your plan, invoices, and payment methods.",
	},
	{
		icon: Code2,
		title: "Developer API",
		description: "API references, webhooks, and integration guides.",
	},
];

const articles = [
	{
		title: "How to bulk import products via CSV",
		category: "Inventory Management",
		readTime: "5 min read",
	},
	{
		title: "Setting up low stock alerts",
		category: "Configuration",
		readTime: "3 min read",
	},
	{
		title: "Understanding monthly sales reports",
		category: "Analytics",
		readTime: "6 min read",
	},
];

const UserGuidePage = () => {
	return (
		<main className="flex-1 p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-12">
					<h1 className="text-3xl font-bold text-foreground">User Guide</h1>
					<Button
						variant="ghost"
						className="gap-2"
					>
						<Headphones className="h-4 w-4" />
						Contact Support
					</Button>
				</div>

				<SearchHeader />

				<div className="mb-16">
					<h2 className="text-2xl font-bold text-foreground mb-6">
						Browse by Topic
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{topics.map((topic) => (
							<TopicCard
								key={topic.title}
								{...topic}
							/>
						))}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<h2 className="text-2xl font-bold text-foreground mb-6">
							Popular Articles
						</h2>
						<div className="space-y-4">
							{articles.map((article) => (
								<ArticleItem
									key={article.title}
									{...article}
								/>
							))}
						</div>
					</div>

					<div className="space-y-6">
						<SupportCard />
						<VideoTutorials />
					</div>
				</div>
			</div>
		</main>
	);
};

export default UserGuidePage;
