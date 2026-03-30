import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { History, User, Mail, Phone } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import type { CustomerFormErrors } from "../../types/checkout";

interface CreditSaleModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: { name: string; email: string; contact: string }) => void;
	formData: {
		name: string;
		email: string;
		contact: string;
	};
	errors: CustomerFormErrors;
	touched: Record<string, boolean>;
	handleChange: (
		field: "name" | "email" | "contact",
	) => (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleBlur: (field: "name" | "email" | "contact") => () => void;
	isProcessing: boolean;
}

export const CreditSaleModal: React.FC<CreditSaleModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	formData,
	errors,
	touched,
	handleChange,
	handleBlur,
	isProcessing,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const firstInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen && firstInputRef.current) {
			const timer = setTimeout(() => {
				firstInputRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) return;

		const modal = modalRef.current;
		if (!modal) return;

		const focusableElements = modal.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement?.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement?.focus();
				}
			}
		};

		modal.addEventListener("keydown", handleTabKey);
		return () => modal.removeEventListener("keydown", handleTabKey);
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSubmit = () => {
		onSubmit(formData);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="credit-sale-title"
			aria-describedby="credit-sale-description"
		>
			<motion.div
				ref={modalRef}
				initial={{ scale: 0.95, opacity: 0, y: 20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				exit={{ scale: 0.95, opacity: 0, y: 20 }}
				transition={{ type: "spring", duration: 0.3 }}
				className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="bg-linear-to-r from-orange-500 to-amber-500 p-6"
					id="credit-sale-title"
				>
					<div className="flex items-center gap-3">
						<div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
							<History
								className="text-white"
								size={28}
								aria-hidden="true"
							/>
						</div>
						<div>
							<h2 className="text-xl font-bold text-white">Credit Sale</h2>
							<p
								className="text-sm text-white/80"
								id="credit-sale-description"
							>
								Enter customer details
							</p>
						</div>
					</div>
				</div>

				<form
					className="p-6 space-y-4"
					aria-label="Credit sales form"
				>
					<div className="space-y-2">
						<Label
							htmlFor="customerName"
							className="text-sm font-semibold text-slate-700 flex items-center gap-2"
						>
							<User
								size={16}
								className="text-orange-500"
								aria-hidden="true"
							/>
							Customer Name
							<span
								className="text-red-500"
								aria-hidden="true"
							>
								*
							</span>
						</Label>
						<Input
							id="customerName"
							ref={firstInputRef}
							placeholder="Enter customer name"
							value={formData.name}
							onChange={handleChange("name")}
							onBlur={handleBlur("name")}
							className={`h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 ${
								errors.name && touched.name ? "border-red-500" : ""
							}`}
							aria-invalid={!!(errors.name && touched.name)}
							aria-describedby={
								errors.name && touched.name ? "name-error" : undefined
							}
							autoComplete="name"
						/>
						{errors.name && touched.name && (
							<p
								id="name-error"
								className="text-sm text-red-600 font-medium flex items-center gap-1"
								role="alert"
							>
								<span aria-hidden="true">⚠️</span>
								{errors.name}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="customerEmail"
							className="text-sm font-semibold text-slate-700 flex items-center gap-2"
						>
							<Mail
								size={16}
								className="text-orange-500"
								aria-hidden="true"
							/>
							Customer Email
						</Label>
						<Input
							id="customerEmail"
							type="email"
							placeholder="Enter email address"
							value={formData.email}
							onChange={handleChange("email")}
							onBlur={handleBlur("email")}
							className={`h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 ${
								errors.email && touched.email ? "border-red-500" : ""
							}`}
							aria-invalid={!!(errors.email && touched.email)}
							aria-describedby={
								errors.email && touched.email ? "email-error" : undefined
							}
							autoComplete="email"
						/>
						{errors.email && touched.email && (
							<p
								id="email-error"
								className="text-sm text-red-600 font-medium flex items-center gap-1"
								role="alert"
							>
								<span aria-hidden="true">⚠️</span>
								{errors.email}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="customerContact"
							className="text-sm font-semibold text-slate-700 flex items-center gap-2"
						>
							<Phone
								size={16}
								className="text-orange-500"
								aria-hidden="true"
							/>
							Customer Contact
							<span
								className="text-red-500"
								aria-hidden="true"
							>
								*
							</span>
						</Label>
						<Input
							id="customerContact"
							placeholder="Enter contact number"
							value={formData.contact}
							onChange={handleChange("contact")}
							onBlur={handleBlur("contact")}
							className={`h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 ${
								errors.contact && touched.contact ? "border-red-500" : ""
							}`}
							aria-invalid={!!(errors.contact && touched.contact)}
							aria-describedby={
								errors.contact && touched.contact ? "contact-error" : undefined
							}
							autoComplete="tel"
							inputMode="tel"
						/>
						{errors.contact && touched.contact && (
							<p
								id="contact-error"
								className="text-sm text-red-600 font-medium flex items-center gap-1"
								role="alert"
							>
								<span aria-hidden="true">⚠️</span>
								{errors.contact}
							</p>
						)}
					</div>

					<div className="pt-4 flex gap-3">
						<Button
							variant="outline"
							onClick={onClose}
							disabled={isProcessing}
							className="flex-1 h-12 rounded-xl font-semibold border-slate-200 hover:bg-slate-50"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={isProcessing}
							className="flex-1 h-12 rounded-xl font-semibold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25"
						>
							{isProcessing ? "Processing..." : "Complete Sale"}
						</Button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	);
};

CreditSaleModal.displayName = "CreditSaleModal";

export default CreditSaleModal;
