import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { ReportService } from './report.service';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { AnalyticsMetrics, AnalyticsMetricsResponse } from './entities/analyticsMetrics.entity';
import { AnalyticsTrendResponse } from './entities/analyticsTrend.entity';
import { TopProductResponse } from './entities/topProduct.entity';
import { SaleReportFilter, SaleReportResponse } from './entities/saleReport.entity';
import { ProductPerformanceResult, ProductPerformanceFilter } from "./entities/productPerformance.entity";
import { InventoryReportResult, InventoryReportFilter } from "./entities/inventoryReport.entity";
import { AnalyticsTransactionResult, AnalyticsTransactionFilter } from "./entities/analyticsTransaction.entity";

@Resolver(() => AnalyticsMetrics)
export class ReportResolver {
	constructor(private readonly reportService: ReportService) { }

	@Query(() => AnalyticsMetricsResponse, { name: 'getAnalyticsMetrics' })
	@UseGuards(JwtAuthGuard)
	async getAnalyticsMetrics(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser
	): Promise<AnalyticsMetricsResponse> {
		return await this.reportService.getAnalyticsMetrics(
			user.id,
			new Date(startDate),
			new Date(endDate),
		);
	}

	@Query(() => AnalyticsTrendResponse, { name: 'getSalesTrend' })
	@UseGuards(JwtAuthGuard)
	async getSalesTrend(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser
	): Promise<AnalyticsTrendResponse> {
		return await this.reportService.getSalesTrend(
			user.id,
			new Date(startDate),
			new Date(endDate),
		);
	}

	@Query(() => TopProductResponse, { name: 'getTopProducts' })
	@UseGuards(JwtAuthGuard)
	async getTopProducts(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser
	): Promise<TopProductResponse> {
		return await this.reportService.getTopProducts(
			user.id,
			new Date(startDate),
			new Date(endDate),
		);
	}

	@Query(() => SaleReportResponse, { name: 'getSalesReport' })
	@UseGuards(JwtAuthGuard)
	async getSalesReport(
		@Args('filters') filters: SaleReportFilter,
		@CurrentUser() user: AuthenticatedUser
	): Promise<SaleReportResponse> {
		return await this.reportService.getSalesReport(user.id, filters);
	}

	@Query(() => ProductPerformanceResult)
	@UseGuards(JwtAuthGuard)
	async getProductPerformance(
		@CurrentUser() user: AuthenticatedUser,
		@Args("filters") filters: ProductPerformanceFilter,
	): Promise<ProductPerformanceResult> {
		return this.reportService.getProductPerformance(user.id, filters);
	}

	@Query(() => InventoryReportResult)
	@UseGuards(JwtAuthGuard)
	async getInventoryReport(
		@CurrentUser() user: AuthenticatedUser,
		@Args("filters") filters: InventoryReportFilter,
	): Promise<InventoryReportResult> {
		return await this.reportService.getInventoryReport(user.id, filters);
	}

	@Query(() => AnalyticsTransactionResult)
	@UseGuards(JwtAuthGuard)
	async getAnalyticsTransactions(
		@CurrentUser() user: AuthenticatedUser,
		@Args("filters") filters: AnalyticsTransactionFilter,
	): Promise<AnalyticsTransactionResult> {
		return await this.reportService.getAnalyticsTransactions(user.id, filters);
	}
}
