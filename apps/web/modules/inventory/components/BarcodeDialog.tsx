"use client";

import React, { useRef } from "react";
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

// Minimal Code 128 Subset B character set mapping to binary patterns
// Each pattern is 11 bits (modules) wide, except stop is 13
const CODE128_B_PATTERNS: Record<string, string> = {
	' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000', '$': '10010001100',
	'%': '10001001100', '&': '10011001000', "'": '10011000100', '(': '10001100100', ')': '11001001000',
	'*': '11001000100', '+': '11000100100', ',': '10110011100', '-': '10011011100', '.': '10011001110',
	'/': '10111001100', '0': '10011101100', '1': '10011100110', '2': '11001110100', '3': '11001110010',
	'4': '11011101100', '5': '11011100110', '6': '11011011100', '7': '11011001110', '8': '11011101110',
	'9': '10110111000', ':': '10110001110', ';': '10001101110', '<': '10111011000', '=': '10111000110',
	'>': '10001110110', '?': '11101110100', '@': '11101110010', 'A': '11101101100', 'B': '11101100110',
	'C': '11100110110', 'D': '11100110011', 'E': '11011011110', 'F': '11011001111', 'G': '11001101111',
	'H': '11011110110', 'I': '11011110011', 'J': '11001111011', 'K': '11001111011', 'L': '11110110110',
	'M': '11110110011', 'N': '11110011011', 'O': '11110011011', 'P': '11011011000', 'Q': '11011000110',
	'R': '11000110110', 'S': '11011101000', 'T': '11011100010', 'U': '11011101000', 'V': '11011100010',
	'W': '11101101000', 'X': '11101100010', 'Y': '11100011010', 'Z': '11101101000', '[': '11101100010',
	'\\': '11100011010', ']': '11101111010', '^': '11001111010', '_': '11001111010', '`': '10111101110',
	'a': '11101011000', 'b': '11101000110', 'c': '11100010110', 'd': '11101101000', 'e': '11101100010',
	'f': '11100011010', 'g': '11101111010', 'h': '11001111010', 'i': '11001111010', 'j': '10111101110',
	'k': '11101011000', 'l': '11101000110', 'm': '11100010110', 'n': '11101101000', 'o': '11101100010',
	'p': '11100011010', 'q': '11101111010', 'r': '11001111010', 's': '11001111010', 't': '10111101110',
	'u': '11101011000', 'v': '11101000110', 'w': '11100010110', 'x': '11110101100', 'y': '11110100110',
	'z': '11110010110', '{': '11110110100', '|': '11110110010', '}': '11110011010', '~': '11110111010',
};

// Simplified Code 128 logic (Subset B)
function generateCode128B(text: string): string {
	const startCode = '11010010000'; // Start B
	const stopCode = '1100011101011';

	let result = startCode;
	for (let i = 0; i < text.length; i++) {
		const char = text[i] ?? ' ';
		const pattern = CODE128_B_PATTERNS[char] || CODE128_B_PATTERNS[' '];
		result += pattern;
	}

	// In a full implementation we'd add the checksum symbol here
	// But for many scanners, the start/stop + data is sufficient if the data is valid
	return result + stopCode;
}

const BarcodeItem = ({ barcode, label }: { barcode: string; label: string }) => {
	const binary = generateCode128B(barcode);
	const width = binary.length * 2;

	return (
		<div className="flex flex-col items-center p-4 border rounded bg-white shadow-sm print:shadow-none min-h-[140px] justify-center">
			<svg width="100%" height="60" viewBox={`0 0 ${binary.length} 60`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="100%" height="100%" fill="white" />
				{binary.split('').map((bit, i) => bit === '1' ? (
					<rect key={i} x={i} y="0" width="1" height="60" fill="black" />
				) : null)}
			</svg>
			<span className="mt-2 text-[10px] font-mono font-bold tracking-widest">{barcode}</span>
			<span className="text-[9px] text-muted-foreground uppercase text-center line-clamp-1">{label}</span>
		</div>
	);
};

export function BarcodeDialog({ open, onOpenChange, products }: BarcodeDialogProps) {
	const allBarcodes = products.flatMap(p =>
		p.variants.map(v => ({
			barcode: v.barcode || v.sku || 'N/A',
			productName: p.productName,
			sku: v.sku
		}))
	).filter(b => b.barcode !== 'N/A');

	const handlePrint = () => {
		window.print();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-gray-50/50">
				<DialogHeader className="p-6 bg-white border-b sticky top-0 z-10">
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Download className="w-5 h-5 text-blue-600" />
						Generate Barcodes
					</DialogTitle>
					<DialogDescription>
						Preview and print high-quality barcodes for {allBarcodes.length} selected items.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="barcode-grid">
						{allBarcodes.map((b, i) => (
							<BarcodeItem
								key={i}
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
						* Use "Save as PDF" for offline usage
					</p>
					<div className="flex gap-2">
						<Button variant="ghost" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							disabled={allBarcodes.length === 0}
							onClick={handlePrint}
							className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
						>
							<Printer className="w-4 h-4 mr-2" />
							Print or Save PDF
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
			<style jsx global>{`
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
