"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { createCategorySchema, type CreateCategoryInput } from "@kosh/validation";
import { Button } from "@kosh/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@kosh/ui/components/dialog";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import { useCreateCategory } from "../hooks/useProducts";
import { toast } from "sonner";

interface AddCategoryModalProps {
	trigger?: React.ReactNode;
}

export function AddCategoryModal({ trigger }: AddCategoryModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const createCategory = useCreateCategory();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateCategoryInput>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: "",
		},
	});

	const onSubmit = async (data: CreateCategoryInput) => {
		try {
			await createCategory.mutateAsync(data.name);
			toast.success("Category created successfully");
			setIsOpen(false);
			reset();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to create category");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm" className="flex items-center gap-2">
						<Plus className="w-4 h-4" />
						Add Category
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Category</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Category Name</Label>
						<Input
							id="name"
							placeholder="Enter category name"
							{...register("name")}
							className={errors.name ? "border-red-500" : ""}
						/>
						{errors.name && (
							<p className="text-xs text-red-500">{errors.name.message}</p>
						)}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createCategory.isPending}>
							{createCategory.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Saving...
								</>
							) : (
								"Save Category"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
