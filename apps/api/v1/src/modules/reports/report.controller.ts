import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { ReportService } from "./report.service";
import type { AuthenticatedRequest } from "src/types/auth";

@Controller("reports")
export class ReportController {
	constructor(private readonly reportService: ReportService) {}

	@UseGuards(JwtAuthGuard)
	@Get("analytics/metrics")
	async getAnalyticsMetrics(
		@Req() req: AuthenticatedRequest,
		@Query("startDate") startDate: string,
		@Query("endDate") endDate: string,
	) {
		return this.reportService.getAnalyticsMetrics(
			req.user.id,
			new Date(startDate),
			new Date(endDate),
		);
	}
}
