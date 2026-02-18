import { gql } from "@/gql"
import { PreloadQuery } from "@/lib/graphql/apolloServer"
import InventoryPage from "@/modules/inventory/pages/InventoryPage"

const GET_INVENTORY_DATA = gql(`
	query GetInventoryPage ($filterInput: ProductFilterInput!) {
		listProductsWithFilter (filterInput: $filterInput) {
			data {
				id
				productName
				category {
					id 
					name
				} 
				totalStock
				variantCount
				status
				variants {
					id
					sku
					barcode
					attributes {
						name
						value
					}
					price
					stock
					lowStock
					status
					sellingPrice
					costPrice
				}
			}
			meta {
				page
				limit
				total
				totalPages
				hasNext
				hasPrev
			}	
		}
	}
`)

const page = () => {
	return (
		<PreloadQuery query={GET_INVENTORY_DATA} variables={{ filterInput: { page: 1, limit: 10 } }}>
			<InventoryPage />
		</PreloadQuery>
	)

}

export default page