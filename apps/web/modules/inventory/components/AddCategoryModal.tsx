"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { useCreateCategory } from "../hooks/useProducts";
import {
	createCategorySchema,
	type CreateCategoryInput,
} from "@kosh/validation";
import { Button } from "@kosh/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
} from "@kosh/ui/components/dialog";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import { toast } from "sonner";

interface AddCategoryModalProps {
	trigger?: React.ReactNode;
}

export function AddCategoryModal({ trigger }: AddCategoryModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [createCategoryMutation, { loading: isCreating }] = useCreateCategory();

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
			const { data: result } = await createCategoryMutation({
				variables: {
					input: {
						name: data.name,
					},
				},
			});

			if (result?.createCategory?.success) {
				toast.success("Category created successfully");
				setIsOpen(false);
				reset();
			} else {
				toast.error(
					result?.createCategory?.message || "Failed to create category",
				);
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to create category");
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant="outline"
						size="sm"
						className="text-base flex items-center gap-2 hover:cursor-pointer"
					>
						<Plus className="w-4 h-4" />
						Add Category
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Add New Category</DialogTitle>
					<DialogDescription>
						Create a new category to organize your products.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4 py-4"
				>
					<div className="space-y-2">
						<Label htmlFor="name">Category Name</Label>
						<Input
							id="name"
							placeholder="Enter category name"
							{...register("name")}
							className={errors.name ? "border-red-500 mt-2" : "mt-2"}
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
						<Button
							type="submit"
							disabled={isCreating}
						>
							{isCreating ? (
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
