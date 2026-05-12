import { Button } from "@kosh/ui/components/button";
import { Card } from "@kosh/ui/components/card";
import {
	ArrowUpRight,
	BarChart3,
	CreditCard,
	DollarSign,
	Receipt,
	ShoppingCart,
	TrendingUp,
} from "lucide-react";

export default function FeaturesSection() {
	return (
		<section id="features">
			<div className="py-24">
				<div className="mx-auto w-full max-w-5xl px-6">
					<div>
						<h2 className="text-foreground max-w-2xl text-balance text-4xl font-semibold">
							Everything you need to run <span className="text-primary">modern business</span> operations
						</h2>
						<p className="text-muted-foreground mt-4 max-w-2xl text-lg">
							KOSH helps businesses manage billing, inventory, analytics, and
							financial operations from one clean platform.
						</p>
					</div>

					<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<Card className="overflow-hidden p-6 bg-gray-50/80 border-none shadow-lg">
							<ShoppingCart className="text-primary size-5" />

							<h3 className="text-foreground text-lg font-semibold">
								Smart POS Billing
							</h3>

							<p className="text-muted-foreground  text-balance">
								Fast and reliable billing experience with barcode support.
							</p>

							<POSIllustration />
						</Card>

						<Card className="group overflow-hidden px-6 pt-6 bg-gray-50/80 border-none shadow-lg">
							<BarChart3 className="text-primary size-5" />

							<h3 className="text-foreground text-lg font-semibold">
								Business Analytics
							</h3>

							<p className="text-muted-foreground text-balance">
								Monitor operational performance through real-time dashboards.
							</p>

							<AnalyticsIllustration />
						</Card>

						<Card className="group overflow-hidden px-6 pt-6 bg-gray-50/80 border-none shadow-lg">
							<DollarSign className="text-primary size-5" />

							<h3 className="text-foreground text-lg font-semibold">
								Expense & Financial Tracking
							</h3>

							<p className="text-muted-foreground text-balance">
								Track expenses, profits, transactions, and financial activity.
							</p>

							<div className="mask-b-from-30 -mx-2 -mt-2 px-2 pt-2">
								<FinanceIllustration />
							</div>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}

const POSIllustration = () => {
	return (
		<Card
			aria-hidden
			className="aspect-video p-4 border-none"
		>
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">POS Checkout</div>
					<div className="text-muted-foreground mt-1 text-xs">
						Active Transaction
					</div>
				</div>

				<div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
					Live
				</div>
			</div>

			<div className="space-y-3">
				{[
					{ name: "Coffee", price: "Rs. 120" },
					{ name: "Cold Drinks", price: "Rs.150" },
					{ name: "Snacks", price: "Rs. 100" },
				].map((item) => (
					<div
						key={item.name + item.price}
						className="flex items-center justify-between rounded-lg shadow-sm p-2"
					>
						<div className="flex items-center gap-2">
							<div className="bg-primary/10 flex size-8 rounded-md">
								<Receipt className="text-primary m-auto size-4" />
							</div>

							<span className="text-sm font-medium">{item.name}</span>
						</div>

						<span className="text-sm text-muted-foreground">{item.price}</span>
					</div>
				))}
			</div>

			<div className="flex items-center justify-between border-t border-gray-300 pt-4">
				<span className="text-sm font-medium">Total</span>

				<span className="text-lg text-primary font-semibold">Rs. 370</span>
			</div>
		</Card>
	);
};

const AnalyticsIllustration = () => {
	return (
		<div
			aria-hidden
			className="relative"
		>
			<Card className="aspect-video w-4/5 translate-y-4 p-4 border-none transition-transform duration-200 ease-in-out group-hover:-rotate-2">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-sm font-semibold">Monthly Revenue</div>

						<div className="mt-1 text-xl font-semibold">Rs. 24,320</div>
					</div>

					<div className="bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-medium">
						+18%
					</div>
				</div>

				<div className="mt-6 flex h-24 items-end gap-2">
					{[30, 60, 45, 80, 55, 95, 70].map((height) => (
						<div
							key={height}
							style={{ height }}
							className="bg-primary/80 w-full rounded-md"
						/>
					))}
				</div>
			</Card>

			<Card className="absolute -top-4 right-0 aspect-square w-28 border-none translate-y-4 p-4 transition-transform duration-200 ease-in-out group-hover:rotate-3">
				<div className="flex h-full flex-col justify-between">
					<TrendingUp className="text-primary size-5" />

					<div>
						<div className="text-lg font-bold">12.4%</div>

						<div className="text-muted-foreground text-xs">Growth</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

const FinanceIllustration = () => {
	return (
		<Card
			aria-hidden
			className="border-none aspect-video translate-y-4 p-4 pb-6 transition-transform duration-200 group-hover:translate-y-0"
		>
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">Financial Overview</div>

					<div className="text-muted-foreground mt-1 text-xs">This Month</div>
				</div>

				<CreditCard className="text-primary size-5" />
			</div>

			<div className="space-y-3">
				{[
					{
						label: "Revenue",
						value: "Rs. 18,420",
					},
					{
						label: "Expenses",
						value: "Rs. 7,240",
					},
					{
						label: "Net Profit",
						value: "Rs. 11,180",
					},
				].map((item) => (
					<div
						key={item.label + item.value}
						className="flex items-center justify-between rounded-lg shadow-sm p-3"
					>
						<span className="text-sm font-medium">{item.label}</span>

						<span className="text-sm text-muted-foreground">{item.value}</span>
					</div>
				))}
			</div>

			<Button
				size="sm"
				className="mt-4 w-full rounded-lg"
			>
				View Reports
				<ArrowUpRight className="ml-2 size-4" />
			</Button>
		</Card>
	);
};
