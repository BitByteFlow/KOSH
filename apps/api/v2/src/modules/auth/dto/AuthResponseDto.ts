export class AuthResponseDto {
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
    };
    store?: {
        storeId: string
        storeName: string
    }
    isStoreCashier?: boolean
}