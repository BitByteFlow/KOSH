import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { StoreGuard } from 'src/utils/store.guard';
import { ReportService } from './report.service';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import { CurrentStore } from 'src/utils/currentStore.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { AnalyticsMetrics, AnalyticsMetricsResponse } from './entities/analyticsMetrics.entity';
import { AnalyticsTrendResponse } from './entities/analyticsTrend.entity';
import { TopProductResponse } from './entities/topProduct.entity';
import { SaleReportFilter, SaleReportResponse } from './entities/saleReport.entity';
import { ProductPerformanceResult, ProductPerformanceFilter } from "./entities/productPerformance.entity";
import { InventoryReportResult, InventoryReportFilter } from "./entities/inventoryReport.entity";
import { AnalyticsTransactionResult, AnalyticsTransactionFilter } from "./entities/analyticsTransaction.entity";

@Resolver(() => AnalyticsMetrics)
@UseGuards(JwtAuthGuard, StoreGuard)
export class ReportResolver {
	constructor(private readonly reportService: ReportService) { }

	@Query(() => AnalyticsMetricsResponse, { name: 'getAnalyticsMetrics' })
	async getAnalyticsMetrics(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<AnalyticsMetricsResponse> {
		return await this.reportService.getAnalyticsMetrics(
			storeId,
			new Date(startDate),
			new Date(endDate),
		);
	}

	@Query(() => AnalyticsTrendResponse, { name: 'getSalesTrend' })
	async getSalesTrend(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<AnalyticsTrendResponse> {
		return await this.reportService.getSalesTrend(
			storeId,
			new Date(startDate),
			new Date(endDate),
		);
	}

	@Query(() => TopProductResponse, { name: 'getTopProducts' })
	async getTopProducts(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<TopProductResponse> {
		return await this.reportService.getTopProducts(
			storeId,
			new Date(startDate),
			new Date(endDate),
		);
	}

	@Query(() => SaleReportResponse, { name: 'getSalesReport' })
	async getSalesReport(
		@Args('filters') filters: SaleReportFilter,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<SaleReportResponse> {
		return await this.reportService.getSalesReport(storeId, filters);
	}

	@Query(() => ProductPerformanceResult)
	async getProductPerformance(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("filters") filters: ProductPerformanceFilter,
	): Promise<ProductPerformanceResult> {
		return this.reportService.getProductPerformance(storeId, filters);
	}

	@Query(() => InventoryReportResult)
	async getInventoryReport(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("filters") filters: InventoryReportFilter,
	): Promise<InventoryReportResult> {
		return await this.reportService.getInventoryReport(storeId, filters);
	}

	@Query(() => AnalyticsTransactionResult)
	async getAnalyticsTransactions(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("filters") filters: AnalyticsTransactionFilter,
	): Promise<AnalyticsTransactionResult> {
		return await this.reportService.getAnalyticsTransactions(storeId, filters);
	}
}
