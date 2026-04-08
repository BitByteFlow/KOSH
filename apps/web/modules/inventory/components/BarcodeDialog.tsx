"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@kosh/ui/components/dialog";
import { Button } from "@kosh/ui/components/button";
import { Download, Printer, X } from "lucide-react";
import jsPDF from "jspdf";

interface Product {
	id: string;
	productName: string;
	variants: Array<{
		id: string;
		sku: string;
		barcode: string;
	}>;
}

interface BarcodeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	products: Product[];
}

const EAN13_PATTERNS: Record<string, Record<string, string>> = {
	L: {
		"0": "0001101",
		"1": "0011001",
		"2": "0010011",
		"3": "0111101",
		"4": "0100011",
		"5": "0110001",
		"6": "0101111",
		"7": "0111011",
		"8": "0110111",
		"9": "0001011",
	},
	G: {
		"0": "0100111",
		"1": "0110011",
		"2": "0011011",
		"3": "0100001",
		"4": "0011101",
		"5": "0111001",
		"6": "0000101",
		"7": "0010001",
		"8": "0001001",
		"9": "0010111",
	},
	R: {
		"0": "1110010",
		"1": "1100110",
		"2": "1101100",
		"3": "1000010",
		"4": "1011100",
		"5": "1001110",
		"6": "1010000",
		"7": "1000100",
		"8": "1001000",
		"9": "1110100",
	},
};

const EAN13_FIRST_DIGIT_PATTERN: Record<string, string> = {
	"0": "LLLLLL",
	"1": "LLGLGG",
	"2": "LLGGLG",
	"3": "LLGGGL",
	"4": "LGLLGG",
	"5": "LGGLLG",
	"6": "LGGGLL",
	"7": "LGLGLG",
	"8": "LGLGGL",
	"9": "LGGLGL",
};

function calculateEAN13CheckDigit(code12: string): number {
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		const digit = parseInt(code12[i]!, 10);
		sum += i % 2 === 0 ? digit : digit * 3;
	}
	return (10 - (sum % 10)) % 10;
}

function generateEAN13(text: string): string {
	if (text.length !== 13 || !/^\d{13}$/.test(text)) {
		console.error("Invalid EAN-13 barcode:", text);
		return "";
	}

	const firstDigit = text[0]!;
	const leftSide = text.slice(1, 7);
	const rightSide = text.slice(7, 13);

	const pattern = EAN13_FIRST_DIGIT_PATTERN[firstDigit]!;

	let binary = "101";

	for (let i = 0; i < 6; i++) {
		const digit = leftSide[i]!;
		const encoding = pattern[i]!;
		binary += EAN13_PATTERNS[encoding]![digit]!;
	}

	binary += "01010";

	const rPatterns = EAN13_PATTERNS.R!;
	for (let i = 0; i < 6; i++) {
		const digit = rightSide[i]!;
		binary += rPatterns[digit]!;
	}

	binary += "101";

	return binary;
}

const BarcodeItem = ({
	barcode,
	label,
}: {
	barcode: string;
	label: string;
}) => {
	let ean13Barcode = barcode;
	if (barcode.length === 12) {
		const checkDigit = calculateEAN13CheckDigit(barcode);
		ean13Barcode = barcode + checkDigit;
	}

	const binary = generateEAN13(ean13Barcode);
	const quietZone = 11;
	const totalWidth = binary.length + quietZone * 2;

	return (
		<div className="flex flex-col items-center p-4 border rounded bg-white shadow-sm print:shadow-none min-h-35 justify-center">
			<svg
				width="100%"
				height="80"
				viewBox={`0 0 ${totalWidth} 80`}
				preserveAspectRatio="xMidYMid meet"
				xmlns="http://www.w3.org/2000/svg"
				shapeRendering="crispEdges"
			>
				<title>{ean13Barcode}</title>
				<rect
					width="100%"
					height="100%"
					fill="white"
				/>
				{binary.split("").map((bit, i) =>
					bit === "1" ? (
						<rect
							key={`${ean13Barcode}-bar-${bit + Number(i)}`}
							x={i + quietZone}
							y="0"
							width="1"
							height="60"
							fill="black"
							shapeRendering={"crispEdges"}
						/>
					) : null,
				)}
			</svg>
			<span className="mt-2 text-sm font-mono font-bold tracking-widest">
				{ean13Barcode}
			</span>
			<span className="text-xs text-muted-foreground uppercase text-center line-clamp-1">
				{label}
			</span>
		</div>
	);
};

export function BarcodeDialog({
	open,
	onOpenChange,
	products,
}: BarcodeDialogProps) {
	const allBarcodes = products
		.flatMap((p) =>
			p.variants.map((v) => ({
				barcode: v.barcode || v.sku || "N/A",
				productName: p.productName,
				sku: v.sku,
			})),
		)
		.filter((b) => b.barcode !== "N/A");

	const handlePrint = () => {
		window.print();
	};

	const handleDownloadPDF = () => {
		const pdf = new jsPDF({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
		});

		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const margin = 15;
		const cols = 2; // 2 columns for larger barcodes
		const cardWidth = (pageWidth - margin * (cols + 1)) / cols;
		const barcodeHeight = 30; // Taller barcodes for better scanning
		const gap = 15;

		// Title
		pdf.setFontSize(16);
		pdf.setFont("helvetica", "bold");
		pdf.text("Product Barcodes", pageWidth / 2, 15, { align: "center" });
		pdf.setFontSize(10);
		pdf.setFont("helvetica", "normal");
		pdf.setTextColor(100, 100, 100);
		pdf.text(
			`Generated: ${new Date().toLocaleDateString()}`,
			pageWidth / 2,
			22,
			{ align: "center" },
		);
		pdf.setTextColor(0, 0, 0);

		let currentX = margin;
		let currentY = 30;
		let itemsOnPage = 0;
		const itemsPerPage =
			Math.floor(
				(pageHeight - currentY - margin) / (barcodeHeight + 15 + gap),
			) * cols;

		allBarcodes.forEach((b, i) => {
			// Add new page if needed
			if (itemsOnPage > 0 && itemsOnPage % itemsPerPage === 0) {
				pdf.addPage();
				currentX = margin;
				currentY = 15;
			}

			const label = `${b.productName} (${b.sku})`;

			// Ensure barcode is 13 digits for EAN-13
			let ean13Barcode = b.barcode;
			if (b.barcode.length === 12) {
				const checkDigit = calculateEAN13CheckDigit(b.barcode);
				ean13Barcode = b.barcode + checkDigit;
			}

			const binary = generateEAN13(ean13Barcode);
			// Add quiet zones (11 modules each side as per EAN-13 spec)
			const quietZone = 11;
			const totalModules = binary.length + quietZone * 2;
			const barWidth = Math.max(cardWidth / totalModules, 0.4); // Min 0.4mm for scannability
			const barcodeWidth = totalModules * barWidth;
			const startX = currentX + (cardWidth - barcodeWidth) / 2;

			// Draw white background for quiet zone area
			pdf.setFillColor(255, 255, 255);
			pdf.rect(startX, currentY, barcodeWidth, barcodeHeight, "F");

			// Draw barcode bars with proper quiet zones
			pdf.setFillColor(0, 0, 0);
			for (let j = 0; j < binary.length; j++) {
				if (binary[j] === "1") {
					pdf.rect(
						startX + (j + quietZone) * barWidth,
						currentY,
						barWidth,
						barcodeHeight,
						"F",
					);
				}
			}

			// Draw barcode text below
			pdf.setFontSize(10);
			pdf.setFont("courier", "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text(
				ean13Barcode,
				currentX + cardWidth / 2,
				currentY + barcodeHeight + 6,
				{ align: "center" },
			);

			// Draw product label
			pdf.setFontSize(8);
			pdf.setFont("helvetica", "normal");
			pdf.setTextColor(80, 80, 80);
			const truncatedLabel =
				label.length > 35 ? label.substring(0, 32) + "..." : label;
			pdf.text(
				truncatedLabel,
				currentX + cardWidth / 2,
				currentY + barcodeHeight + 12,
				{ align: "center" },
			);

			// Move to next position
			currentX += cardWidth + gap;
			if ((i + 1) % cols === 0) {
				currentX = margin;
				currentY += barcodeHeight + 15 + gap;
			}

			itemsOnPage++;
		});

		pdf.save(`barcodes-${Date.now()}.pdf`);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-200 max-h-[85vh] flex flex-col p-0 overflow-hidden bg-gray-50/50">
				<DialogHeader className="p-6 bg-white border-b sticky top-0 z-10">
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Download className="w-5 h-5 text-blue-600" />
						Generate Barcodes
					</DialogTitle>
					<DialogDescription>
						Preview and print high-quality barcodes for {allBarcodes.length}{" "}
						selected items.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					<div
						className="grid grid-cols-2 md:grid-cols-4 gap-4"
						id="barcode-grid"
					>
						{allBarcodes.map((b, i) => (
							<BarcodeItem
								key={b.barcode}
								barcode={b.barcode}
								label={`${b.productName} (${b.sku})`}
							/>
						))}
					</div>
					{allBarcodes.length === 0 && (
						<div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-white">
							<X className="w-10 h-10 mx-auto mb-4 opacity-20" />
							<p className="text-sm">No valid barcodes found for selection.</p>
						</div>
					)}
				</div>

				<DialogFooter className="p-4 bg-white border-t flex items-center justify-between sm:justify-between">
					<p className="text-xs text-muted-foreground italic px-2">
						* Download as PDF for offline usage
					</p>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							variant="outline"
							disabled={allBarcodes.length === 0}
							onClick={handleDownloadPDF}
						>
							<Download className="w-4 h-4 mr-2" />
							Download PDF
						</Button>
						<Button
							disabled={allBarcodes.length === 0}
							onClick={handlePrint}
							className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
						>
							<Printer className="w-4 h-4 mr-2" />
							Print
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
			<style
				jsx
				global
			>{`
				@media print {
					body > * {
						display: none !important;
					}
					div[role="dialog"] {
						display: block !important;
						position: absolute !important;
						left: 0 !important;
						top: 0 !important;
						width: 100% !important;
						height: auto !important;
						background: white !important;
					}
					#barcode-grid {
						display: grid !important;
						grid-template-cols: repeat(4, 1fr) !important;
						gap: 15px !important;
						width: 100% !important;
					}
					.no-print {
						display: none !important;
					}
				}
			`}</style>
		</Dialog>
	);
}
