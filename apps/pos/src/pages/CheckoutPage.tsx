import React, { useCallback, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";

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

	const { processCreditCheckout, isProcessing } = useCheckout({
		onSuccess: () => {
			setIsCreditModalOpen(false);
			resetForm();
		},
	});

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
			className="h-full flex flex-col md:flex-row bg-slate-50"
			aria-label="Point of Sale Checkout"
		>
			<div className="flex-1 p-6 flex flex-col min-h-0">
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
