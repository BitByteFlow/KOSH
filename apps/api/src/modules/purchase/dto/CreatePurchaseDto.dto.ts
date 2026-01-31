/* eslint-disable prettier/prettier */
import { UUID } from "crypto"

export class CreatePurchaseRequestDto {
    product: [
        categoryId: string,
        name: string,
        variants: [
            {
                productId: UUID,
                quantity: Int8Array,
                price: Float32Array
            }
        ]
    ]
}