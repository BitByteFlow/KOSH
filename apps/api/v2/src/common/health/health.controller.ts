import { Controller, Get, Head, HttpCode, HttpStatus } from "@nestjs/common";
import { HealthService, type HealthStatus } from "./health.service";

@Controller("health")
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Get()
	async health(): Promise<HealthStatus> {
		return this.healthService.check();
	}

	@Head()
	@HttpCode(HttpStatus.NO_CONTENT)
	async healthHead(): Promise<void> {
		await this.healthService.simpleCheck();
	}
}
