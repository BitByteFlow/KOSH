import { gql } from "@/gql"
import { PreloadQuery } from "@/lib/graphql/apolloServer"
import InventoryPage from "@/modules/inventory/pages/InventoryPage"

const GET_INVENTORY_DATA = gql(`
	query getInventoryDate ($page: Int, $limit: Int, $search: String, $sortBy: String, $sortOrder: String, $status: String, $categoryId: String, $lowStock: Int, $minPrice: Int, $maxPrice: Int, $includeDeleted: Boolean) {
		listProductsWithFilter (page: $page, limit: $limit, search: $search, sortBy: $sortBy, sortOrder: $sortOrder, status: $status, categoryId: $categoryId, lowStock: $lowStock, minPrice: $minPrice, maxPrice: $maxPrice, includeDeleted: $includeDeleted) {
			data {
				id
				name
				category {
					id
					name
				}
				variants {
					id
					name
					stock
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
		<PreloadQuery query={GET_INVENTORY_DATA} variables={{ page: 1, limit: 10 }}>
			<InventoryPage />
		</PreloadQuery>
	)

}

export default page