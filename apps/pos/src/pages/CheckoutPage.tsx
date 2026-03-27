import React, { useCallback } from "react";
import { AnimatePresence } from "framer-motion";

import Scanner from "../components/Scanner";
import ProductSearch from "../components/ProductSearch";
import VariantSelectionModal from "../components/VariantSelectionModal";
import { CartLayout } from "../components/CartLayout";
import {
	CheckoutActions,
	EmptyState,
	CreditSaleModal,
	ProductCatalogHeader,
} from "../components/checkout";

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
		<div
			className="h-full flex flex-col md:flex-row bg-slate-50"
			role="main"
			aria-label="Point of Sale Checkout"
		>
			<div className="flex-1 p-6 flex flex-col min-h-0">
				<CheckoutActions
					isSearching={isSearching}
					onScanClick={() => setIsScanning(true)}
					onSearchClick={handleSearchToggle}
				/>

				<div
					className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
					role="region"
					aria-label="Product display area"
				>
					<AnimatePresence mode="wait">
						{isSearching ? (
							<div
								key="search"
								className="animate-fade-in"
							>
								<ProductCatalogHeader />
								<ProductSearch
									onProductSelect={handleProductSelected}
									externalSearch={scannedBarcode || undefined}
								/>
							</div>
						) : (
							<EmptyState onScanClick={() => setIsScanning(true)} />
						)}
					</AnimatePresence>
				</div>
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
					<Scanner
						onScan={handleScanComplete}
						onClose={() => setIsScanning(false)}
					/>
				)}
			</AnimatePresence>

			<VariantSelectionModal
				product={selectedProduct}
				isOpen={isVariantModalOpen}
				onClose={() => {
					setIsVariantModalOpen(false);
					setSelectedProduct(null);
				}}
				onSelectVariant={handleVariantSelect}
			/>

			<AnimatePresence>
				{isCreditModalOpen && (
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
				)}
			</AnimatePresence>
		</div>
	);
};

export default CheckoutPage;
