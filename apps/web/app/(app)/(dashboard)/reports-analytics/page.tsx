import { gql } from "@/gql"
import { PreloadQuery } from "@/lib/graphql/apolloServer"
import ReportAnalyticsPage from "@/modules/reports/pages/ReportAnalyticsPage"
import React from "react"

const GET_REPORT_DATA = gql(`
	query getReportData ($startDate: String!, $endDate: String!){
		getAnalyticsMetrics (startDate: $startDate, endDate: $endDate) {
			success
			message
			data {
				label
				value
				trend
				trendLabel
				isPositive
				subtitle
			}
		}
	}
`)

const page = () => {
	return (
		<PreloadQuery query={GET_REPORT_DATA} variables={{ startDate: new Date().toISOString(), endDate: new Date().toISOString() }}>
			<ReportAnalyticsPage />
		</PreloadQuery>
	)
}

export default page