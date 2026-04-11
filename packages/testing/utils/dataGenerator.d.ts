export function generateRandomString(length: any): string;
export function generateRandomNumber(min: any, max: any): any;
export function generateUniqueProductName(): string;
export function generateUniqueSku(): string;
export function generateUniqueBarcode(): string;
export function generateVariantData(): {
    costPrice: any;
    sellingPrice: any;
    stock: any;
    attributes: {
        name: string;
        value: any;
    }[];
};
export function generateRandomPaymentType(): string;
export function generateSaleItemData(variantId: any): {
    variantId: any;
    quantity: any;
    sellPrice: any;
    costPrice: any;
};
