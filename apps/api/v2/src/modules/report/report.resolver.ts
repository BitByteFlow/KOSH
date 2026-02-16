import { UseGuards } from '@nestjs/common';
import { Args, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { ReportService } from './report.service';
import { CurrentUser } from 'src/utils/currentUser.decorator';

@Resolver()
export class ReportResolver {
	constructor(private readonly reportService: ReportService) {}

	@UseGuards(JwtAuthGuard)
	async getAnalyticsMetrics(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: any
	) {
		return this.reportService.getAnalyticsMetrics(
			user.id,
			new Date(startDate),
			new Date(endDate),
		);
	}
}
