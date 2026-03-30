export function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateUniqueProductName() {
    return `Product-${generateRandomString(8)}-${Date.now()}`;
}

export function generateUniqueSku() {
    return `SKU-${generateRandomString(6)}-${Date.now()}`;
}

export function generateUniqueBarcode() {
    return `BARCODE-${generateRandomString(10)}-${Date.now()}`;
}

export function generateVariantData() {
    return {
        costPrice: generateRandomNumber(10, 100),
        sellingPrice: generateRandomNumber(101, 200),
        stock: generateRandomNumber(10, 50),
        attributes: [
            { name: "color", value: generateRandomString(5) },
            { name: "size", value: generateRandomNumber(1, 10).toString() }
        ]
    };
}

export function generateRandomPaymentType() {
    const types = ['CASH', 'ONLINE', 'CREDIT'];
    return types[Math.floor(Math.random() * types.length)];
}

export function generateSaleItemData(variantId) {
    return {
        variantId: variantId,
        quantity: generateRandomNumber(1, 5),
        sellPrice: generateRandomNumber(100, 200),
        costPrice: generateRandomNumber(50, 90)
    };
}
