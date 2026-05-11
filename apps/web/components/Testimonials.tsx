import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@kosh/ui/components/avatar";
import { Card } from "@kosh/ui/components/card";
import { Quote } from "lucide-react";

export default function TestimonialSection() {
	return (
		<section className="py-24 bg-gray-50">
			<div className="mx-auto max-w-6xl px-6">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-4xl font-semibold text-foreground">
						Trusted by growing businesses
					</h2>

					<p className="text-muted-foreground mt-4">
						Businesses use KOSH to simplify operations, manage inventory, and
						improve daily workflows.
					</p>
				</div>

				<div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Testimonial
						name="Aarav Sharma"
						username="@aaravretail"
						image="https://avatars.githubusercontent.com/u/68236786?v=4"
						content="KOSH made our billing and inventory workflow significantly faster and easier to manage."
					/>

					<Testimonial
						name="Roshan Shrestha"
						username="@roshanmart"
						image="https://avatars.githubusercontent.com/u/31113941?v=4"
						content="The analytics dashboard gives us a much clearer understanding of our business performance."
					/>

					<Testimonial
						name="Kiran Nepali"
						username="@kiranstore"
						image="https://avatars.githubusercontent.com/u/47919550?v=4"
						content="Managing multiple stores became much simpler after switching to KOSH."
					/>

					<Testimonial
						name="Suraj"
						username="@newstore"
						image="https://avatars.githubusercontent.com/u/99137927?v=4"
						content="Managing multiple stores became much simpler after switching to KOSH."
					/>
				</div>
			</div>
		</section>
	);
}

function Testimonial({
	name,
	username,
	image,
	content,
}: {
	name: string;
	username: string;
	image: string;
	content: string;
}) {
	return (
		<Card className="p-6 border-border">
			<Quote className="text-primary size-5" />

			<p className="text-muted-foreground text-sm leading-6">{content}</p>

			<div className="mt-6 flex items-center gap-3">
				<Avatar className="size-11 border">
					<AvatarImage
						src={image}
						alt={name}
					/>
					<AvatarFallback>{name.charAt(0)}</AvatarFallback>
				</Avatar>

				<div>
					<div className="text-sm font-medium text-foreground">{name}</div>

					<div className="text-muted-foreground text-sm">{username}</div>
				</div>
			</div>
		</Card>
	);
}
