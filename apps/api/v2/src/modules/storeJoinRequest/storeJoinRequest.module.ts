import { Module } from "@nestjs/common";
import { StoreJoinRequestService } from "./storeJoinRequest.service";
import { StoreJoinRequestResolver } from "./storeJoinRequest.resolver";

@Module({
	providers: [StoreJoinRequestService, StoreJoinRequestResolver],
	exports: [StoreJoinRequestService],
})
export class StoreJoinRequestModule {}
