import React, { useCallback, lazy, Suspense, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

const Scanner = lazy(() => import("../components/Scanner"));
const ProductSearch = lazy(() => import("../components/ProductSearch"));
const VariantSelectionModal = lazy(
	() => import("../components/VariantSelectionModal"),
);

import { CartLayout } from "../components/CartLayout";
import {
	CheckoutActions,
	EmptyState,
	CreditSaleModal,
	ProductCatalogHeader,
} from "../components/checkout";
import Loading from "../components/Loading";

import { useCheckoutState } from "../hooks/useCheckoutState";
import { useCheckout } from "../hooks/useCheckout";
import { useCustomerForm } from "../hooks/useCustomerForm";

import type { Product } from "../types";

const CheckoutPage: React.FC = () => {
	const {
		isSearching,
		setIsSearching,
		isScanning,
		setIsScanning,
		scannedBarcode,
		selectedProduct,
		setSelectedProduct,
		isVariantModalOpen,
		setIsVariantModalOpen,
		isCreditModalOpen,
		setIsCreditModalOpen,
		handleVariantSelect,
		handleProductSelect,
		handleScanComplete,
	} = useCheckoutState();

	const {
		formData: customerData,
		errors: formErrors,
		touched: formTouched,
		handleChange: handleFormChange,
		handleBlur: handleFormBlur,
		reset: resetForm,
		submit: submitForm,
	} = useCustomerForm();

	const { processCreditCheckout, isProcessing, cartItemCount } = useCheckout({
		onSuccess: () => {
			setIsCreditModalOpen(false);
			resetForm();
		},
	});

	const [isCartOpen, setIsCartOpen] = useState(false);

	const handleCreditSubmit = useCallback(() => {
		const formData = submitForm();
		if (formData) {
			processCreditCheckout(formData);
		}
	}, [submitForm, processCreditCheckout]);

	const handleCreditModalClose = useCallback(() => {
		setIsCreditModalOpen(false);
		resetForm();
	}, [setIsCreditModalOpen, resetForm]);

	const handleSearchToggle = useCallback(() => {
		setIsSearching((prev) => !prev);
	}, [setIsSearching]);

	const handleProductSelected = useCallback(
		(product: Product) => {
			handleProductSelect(product);
		},
		[handleProductSelect],
	);

	return (
		<section
			className="h-full flex flex-col bg-slate-50 overflow-hidden"
			aria-label="Point of Sale Checkout"
		>
			{/* Desktop Layout - Hidden on mobile */}
			<div className="hidden md:flex flex-1 flex-row h-full overflow-hidden">
				<div className="flex-1 p-6 flex flex-col min-h-0 overflow-hidden">
					<CheckoutActions
						isSearching={isSearching}
						onScanClick={() => setIsScanning(true)}
						onSearchClick={handleSearchToggle}
					/>

					<section
						className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
						aria-label="Product display area"
					>
						<AnimatePresence mode="wait">
							{isSearching ? (
								<div
									key="search"
									className="animate-fade-in"
								>
									<ProductCatalogHeader />
									<Suspense
										fallback={
											<div className="grid grid-cols-2 gap-3">
												{Array.from({ length: 4 }).map((val) => (
													<div
														key={`productcatalogHeader-${val}`}
														className="h-40 bg-slate-200 rounded-xl animate-pulse"
													/>
												))}
											</div>
										}
									>
										<ProductSearch
											onProductSelect={handleProductSelected}
											externalSearch={scannedBarcode || undefined}
										/>
									</Suspense>
								</div>
							) : (
								<EmptyState onScanClick={() => setIsScanning(true)} />
							)}
						</AnimatePresence>
					</section>
				</div>

				<CartLayout
					onCreditCheckoutRequest={() => setIsCreditModalOpen(true)}
					onCheckoutComplete={() => {
						if (scannedBarcode) {
							setIsSearching(false);
						}
					}}
				/>
			</div>

			{/* Mobile Layout - Stacked with toggleable cart */}
			<div className="md:hidden flex flex-col h-full overflow-hidden">
				{/* Mobile Header */}
				<header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
					<h1 className="text-lg font-bold text-slate-800">Checkout</h1>
					<Button
						onClick={() => setIsCartOpen(true)}
						variant="outline"
						className="relative px-4 py-2 h-10 rounded-xl border-slate-200"
						aria-label={`Open cart with ${cartItemCount} items`}
					>
						<span className="flex items-center gap-2">
							Cart
							{cartItemCount > 0 && (
								<span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
									{cartItemCount}
								</span>
							)}
						</span>
					</Button>
				</header>

				{/* Main Content Area */}
				<div className="flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
					<CheckoutActions
						isSearching={isSearching}
						onScanClick={() => setIsScanning(true)}
						onSearchClick={handleSearchToggle}
					/>

					<section
						className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4"
						aria-label="Product display area"
					>
						<AnimatePresence mode="wait">
							{isSearching ? (
								<div
									key="search"
									className="animate-fade-in"
								>
									<ProductCatalogHeader />
									<Suspense
										fallback={
											<div className="grid grid-cols-2 gap-3">
												{Array.from({ length: 4 }).map((val) => (
													<div
														key={`productcatalogHeader-${val}`}
														className="h-32 bg-slate-200 rounded-xl animate-pulse"
													/>
												))}
											</div>
										}
									>
										<ProductSearch
											onProductSelect={handleProductSelected}
											externalSearch={scannedBarcode || undefined}
										/>
									</Suspense>
								</div>
							) : (
								<EmptyState onScanClick={() => setIsScanning(true)} />
							)}
						</AnimatePresence>
					</section>
				</div>

				{/* Mobile Cart Drawer */}
				<AnimatePresence>
					{isCartOpen && (
						<>
							{/* Backdrop */}
							<div
								className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
								onClick={() => setIsCartOpen(false)}
								aria-hidden="true"
							/>

							{/* Cart Panel */}
							<div
								className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom"
								role="dialog"
								aria-label="Shopping cart"
							>
								{/* Handle Bar */}
								<div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
									<div className="flex items-center gap-2">
										<div className="w-10 h-1 bg-slate-300 rounded-full" />
										<h2 className="font-bold text-slate-800">Your Cart</h2>
									</div>
									<Button
										onClick={() => setIsCartOpen(false)}
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full"
										aria-label="Close cart"
									>
										<X size={20} />
									</Button>
								</div>

								{/* Cart Content */}
								<div className="flex-1 overflow-y-auto">
									<CartLayout
										onCreditCheckoutRequest={() => {
											setIsCreditModalOpen(true);
											setIsCartOpen(false);
										}}
										onCheckoutComplete={() => {
											setIsCartOpen(false);
											if (scannedBarcode) {
												setIsSearching(false);
											}
										}}
									/>
								</div>
							</div>
						</>
					)}
				</AnimatePresence>
			</div>

			{/* Modals - Shared for both layouts */}
			<AnimatePresence>
				{isScanning && (
					<Suspense fallback={<Loading variant="modal" />}>
						<Scanner
							onScan={handleScanComplete}
							onClose={() => setIsScanning(false)}
						/>
					</Suspense>
				)}
			</AnimatePresence>

			{isVariantModalOpen && (
				<Suspense fallback={<Loading variant="modal" />}>
					<VariantSelectionModal
						product={selectedProduct}
						isOpen={isVariantModalOpen}
						onClose={() => {
							setIsVariantModalOpen(false);
							setSelectedProduct(null);
						}}
						onSelectVariant={handleVariantSelect}
					/>
				</Suspense>
			)}

			<AnimatePresence>
				{isCreditModalOpen && (
					<Suspense fallback={<Loading variant="modal" />}>
						<CreditSaleModal
							isOpen={isCreditModalOpen}
							onClose={handleCreditModalClose}
							onSubmit={handleCreditSubmit}
							formData={customerData}
							errors={formErrors}
							touched={formTouched}
							handleChange={handleFormChange}
							handleBlur={handleFormBlur}
							isProcessing={isProcessing}
						/>
					</Suspense>
				)}
			</AnimatePresence>
		</section>
	);
};

export default CheckoutPage;
