import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { ReportService } from './report.service';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { AnalyticsMetrics } from './entities/analyticsMetrics.entity';

@Resolver(() => AnalyticsMetrics)
export class ReportResolver {
	constructor(private readonly reportService: ReportService) {}

	@Query(() => AnalyticsMetrics, { name: 'getAnalyticsMetrics' })
	@UseGuards(JwtAuthGuard)
	async getAnalyticsMetrics(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser
	): Promise<AnalyticsMetrics[]> {
		return this.reportService.getAnalyticsMetrics(
			user.id,
			new Date(startDate),
			new Date(endDate),
		);
	}
}
