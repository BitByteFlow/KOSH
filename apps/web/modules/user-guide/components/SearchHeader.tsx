import { Input } from "@kosh/ui/components/input";
import { Search } from "lucide-react";

export function SearchHeader() {
	return (
		<div className="text-center mb-12">
			<h1 className="text-3xl font-bold text-foreground mb-2">
				How can we help you?
			</h1>
			<p className="text-muted-foreground mb-6">
				Search for articles, guides, and tutorials.
			</p>
			<div className="relative max-w-2xl mx-auto">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
				<Input
					placeholder="Search documentation..."
					className="pl-10 py-3"
				/>
			</div>
		</div>
	);
}
