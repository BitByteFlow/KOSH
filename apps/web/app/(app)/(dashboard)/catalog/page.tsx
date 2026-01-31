import { ProductTable } from "@/components/catalog/ProductTable";

const mockProducts = [
	{
		id: "1",
		sku: "#PRD-001",
		name: "Xiaomi Monitor 27 Inch 165Hz",
		category: "Monitor",
		stock: 0,
		barcode: "890123456789",
		status: "Out of Stock" as const,
	},
	{
		id: "2",
		sku: "#PRD-002",
		name: "Samsung Galaxy A35 12/512Gb",
		category: "Smartphone",
		stock: 20,
		barcode: "456123789012",
		status: "Pre-Order" as const,
	},
	{
		id: "3",
		sku: "#PRD-003",
		name: "MacBook Air M3 Grey 13 inch",
		category: "Macbook",
		stock: 11,
		barcode: "789012345678",
		status: "Active" as const,
	},
	{
		id: "4",
		sku: "#PRD-004",
		name: "MacBook Pro M3 Black 15 Inch",
		category: "Macbook",
		stock: 15,
		barcode: "123456789012",
		status: "Pre-Order" as const,
	},
	{
		id: "5",
		sku: "#PRD-005",
		name: "MacBook Air M2 White 13 inch",
		category: "Macbook",
		stock: 75,
		barcode: "987654321012",
		status: "Active" as const,
	},
	{
		id: "6",
		sku: "#PRD-006",
		name: "iMac Pro M3 Green 512Gb",
		category: "Desktop",
		stock: 30,
		barcode: "654321098765",
		status: "Out of Stock" as const,
	},
	{
		id: "7",
		sku: "#PRD-007",
		name: "Samsung Galaxy A56 8/256",
		category: "Smartphone",
		stock: 30,
		barcode: "321654987000",
		status: "Out of Stock" as const,
	},
	{
		id: "8",
		sku: "#PRD-008",
		name: "ASUS Zenbook 14 OLED UM3406HA",
		category: "Laptop",
		stock: 30,
		barcode: "112233445566",
		status: "Out of Stock" as const,
	},
];

export default function CatalogPage() {
	return (
		<section className="w-full overflow-y-auto p-8">
			<div className="w-full">
				<ProductTable products={mockProducts} />
			</div>
		</section>
	);
}
