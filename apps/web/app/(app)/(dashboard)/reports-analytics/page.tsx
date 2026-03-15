import { gql } from "@/gql"
import { PreloadQuery } from "@/lib/graphql/apolloServer"
import { getDateRange } from "@/lib/date-utils"
import {
	GET_ANALYTICS_METRICS,
	GET_SALES_REPORT,
	GET_SALES_TREND,
	GET_TOP_PRODUCTS
} from "@/services/reportsAnalytics.service"
import ReportAnalyticsPage from "@/modules/reports/pages/ReportAnalyticsPage"
import React from "react"

const page = () => {
	const { startDate, endDate } = getDateRange("This Month")

	return (
		<PreloadQuery query={GET_ANALYTICS_METRICS} variables={{ startDate, endDate }}>
			<PreloadQuery query={GET_SALES_TREND} variables={{ startDate, endDate }}>
				<PreloadQuery query={GET_TOP_PRODUCTS} variables={{ startDate, endDate }}>
					<PreloadQuery query={GET_SALES_REPORT} variables={{ filters: { startDate, endDate } }}>
						<ReportAnalyticsPage />
					</PreloadQuery>
				</PreloadQuery>
			</PreloadQuery>
		</PreloadQuery>
	)
}

export default page