import { Type as type, LucideIcon } from "lucide-react";

interface TopicCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function TopicCard({ icon: Icon, title, description }: TopicCardProps) {
	return (
		<div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
			<Icon className="h-8 w-8 text-primary mb-4" />
			<h3 className="font-semibold text-foreground mb-2">{title}</h3>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}
