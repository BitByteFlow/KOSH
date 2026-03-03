"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { Button } from "@kosh/ui/components/button";
import { FileDown, Download, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface SaleItem {
	id: string;
	quantity: number;
	sellPrice: number;
	costPrice: number;
	variantId: string;
}

interface Sale {
	id: string;
	total: number;
	discount: number;
	profit: number;
	paymentType: string;
	items: SaleItem[];
	createdAt: string;
}

interface SalesExportDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	salesData: Sale[];
}

const SalesExportDialog = ({
	isOpen,
	onOpenChange,
	salesData,
}: SalesExportDialogProps) => {
	const handleExport = () => {
		const doc = new jsPDF();
		const today = new Date();
		const dateStr = format(today, "MMMM dd, yyyy");

		doc.setFontSize(20);
		doc.setTextColor(40);
		doc.text("Sales Report", 14, 22);

		doc.setFontSize(10);
		doc.setTextColor(100);
		doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
		doc.text(`Report Period: ${dateStr} (Today)`, 14, 35);

		const tableData = salesData.map((sale) => [
			`#${sale.id.slice(0, 8)}`,
			format(new Date(sale.createdAt), "HH:mm"),
			sale.items.length.toString(),
			sale.paymentType,
			formatCurrency(sale.total),
			formatCurrency(sale.profit),
		]);

		autoTable(doc, {
			startY: 45,
			head: [["Invoice", "Time", "Items", "Payment", "Total", "Profit"]],
			body: tableData,
			headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
			alternateRowStyles: { fillColor: [249, 250, 251] },
			margin: { top: 45 },
		});

		const finalY = (doc as any).lastAutoTable.finalY + 10;
		const totalAmount = salesData.reduce((acc, s) => acc + s.total, 0);
		const totalProfit = salesData.reduce((acc, s) => acc + s.profit, 0);

		doc.setFontSize(12);
		doc.setTextColor(40);
		doc.text(`Total Sales: ${salesData.length}`, 14, finalY);
		doc.text(`Total Revenue: ${formatCurrency(totalAmount)}`, 14, finalY + 7);
		doc.text(`Total Profit: ${formatCurrency(totalProfit)}`, 14, finalY + 14);

		doc.save(`sales-report-${format(today, "yyyy-MM-dd")}.pdf`);
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<FileDown className="w-5 h-5 text-primary" />
						Export Sales
					</DialogTitle>
					<DialogDescription>
						Download today's sales records as a PDF document.
					</DialogDescription>
				</DialogHeader>

				<div className="py-6 flex flex-col items-center justify-center space-y-4 border-2 border-dashed rounded-xl bg-muted/30">
					<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
						<Download className="h-6 w-6 text-primary" />
					</div>
					<div className="text-center">
						<p className="text-sm font-semibold">Today's Sales Records</p>
						<p className="text-xs text-muted-foreground">
							{salesData.length} records found for export
						</p>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="flex items-center gap-2"
					>
						<X className="h-4 w-4" />
						Cancel
					</Button>
					<Button
						onClick={handleExport}
						disabled={salesData.length === 0}
						className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95"
					>
						<Download className="w-4 h-4 mr-2" />
						Confirm Download
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SalesExportDialog;
