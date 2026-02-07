import { FileText } from "lucide-react";

interface ArticleItemProps {
	title: string;
	category: string;
	readTime: string;
}

export function ArticleItem({ title, category, readTime }: ArticleItemProps) {
	return (
		<div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
			<FileText className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
			<div className="flex-1 min-w-0">
				<h4 className="font-medium text-foreground mb-1 line-clamp-2">
					{title}
				</h4>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span>{category}</span>
					<span>•</span>
					<span>{readTime}</span>
				</div>
			</div>
		</div>
	);
}
