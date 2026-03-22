import { Module } from "@nestjs/common";
import { StoreMemberService } from "./storeMember.service";
import { StoreMemberResolver } from "./storeMember.resolver";
import { StoreMemberController } from "./storeMember.controller";

@Module({
  providers: [StoreMemberService, StoreMemberResolver],
  controllers: [StoreMemberController],
  exports: [StoreMemberService, StoreMemberController],
})
export class StoreMemberModule { }
