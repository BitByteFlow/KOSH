import { Module } from "@nestjs/common";
import { StoreMemberService } from "./storeMember.service";
import { StoreMemberResolver } from "./storeMember.resolver";

@Module({
  providers: [StoreMemberService, StoreMemberResolver],
  exports: [StoreMemberService],
})
export class StoreMemberModule { }
