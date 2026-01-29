import { type LucideIcon } from "lucide-react";
import { JSX } from "react";
export function DetailCard({
	title,
	value,
	icon,
	note,
}: {
	title: string;
	value: number;
	icon: LucideIcon;
	note: string;
}): JSX.Element {
	return (
		<div >
			<div >{title}</div>
			<div >{value}</div>
			{note && <div>{note}</div>}
		</div>
	);
}
