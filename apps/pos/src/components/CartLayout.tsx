import React, { useCallback } from "react";
import Cart from "./Cart";
import { Button } from "@kosh/ui/components/button";
import { Banknote, CreditCard, History } from "lucide-react";
import { useCheckout } from "../hooks/useCheckout";

interface CartLayoutProps {
	onCreditCheckoutRequest: () => void;
	onCheckoutComplete?: () => void;
}

export const CartLayout: React.FC<CartLayoutProps> = React.memo(
	({ onCreditCheckoutRequest, onCheckoutComplete }) => {
		const { processInstantCheckout, isProcessing, canCheckout, cartItemCount } =
			useCheckout({
				onSuccess: onCheckoutComplete,
			});

		const handleInstantCheckout = useCallback(
			async (paymentType: "CASH" | "ONLINE") => {
				await processInstantCheckout(paymentType);
			},
			[processInstantCheckout],
		);

		const handleCreditRequest = useCallback(() => {
			if (canCheckout) {
				onCreditCheckoutRequest();
			}
		}, [canCheckout, onCreditCheckoutRequest]);

		const isDisabled = isProcessing || !canCheckout;

		return (
			<section
				className="w-full md:w-105 lg:w-120 flex flex-col shadow-2xl relative z-10"
				aria-label="Shopping cart and checkout"
			>
				{/* <div className="flex-1 overflow-hidden"> */}
				<Cart />
				{/* </div> */}

				<div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							size="lg"
							disabled={isDisabled}
							onClick={() => handleInstantCheckout("CASH")}
							className="h-20 rounded-2xl flex flex-col gap-3 bg-white hover:bg-green-50 hover:border-green-200 transition-all font-bold shadow-sm group border-slate-200"
							aria-label="Proceed with cash payment"
							aria-busy={isProcessing}
						>
							<div
								className=" rounded-xl text-green-600 group-hover:scale-110 transition-transform"
								aria-hidden="true"
							>
								<Banknote size={16} />
							</div>
							<span className="text-sm text-slate-500 group-hover:text-green-700">
								Cash Payment
							</span>
						</Button>

						<Button
							variant="outline"
							size="lg"
							disabled={isDisabled}
							onClick={() => handleInstantCheckout("ONLINE")}
							className="h-20 rounded-2xl flex flex-col gap-3 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all font-bold shadow-sm group border-slate-200"
							aria-label="Proceed with online payment"
							aria-busy={isProcessing}
						>
							<div
								className="rounded-xl text-blue-600 group-hover:scale-110 transition-transform"
								aria-hidden="true"
							>
								<CreditCard size={16} />
							</div>
							<span className="text-sm text-slate-500 group-hover:text-blue-700">
								Online
							</span>
						</Button>
					</div>

					<Button
						variant="ghost"
						size="lg"
						disabled={isDisabled}
						onClick={handleCreditRequest}
						className="w-full h-14 rounded-2xl font-bold text-sm text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-100 flex items-center justify-center gap-3"
						aria-label="Proceed with credit payment"
					>
						<History
							size={18}
							className="text-orange-400"
							aria-hidden="true"
						/>
						Pay on Credit
						{cartItemCount > 0 && (
							<span className="sr-only">
								, {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in cart
							</span>
						)}
					</Button>
				</div>
			</section>
		);
	},
);

CartLayout.displayName = "CartLayout";

export default CartLayout;
