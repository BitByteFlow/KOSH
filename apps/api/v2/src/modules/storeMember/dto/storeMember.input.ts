import { InputType, Field } from "@nestjs/graphql";
import { AddMemberInput as IAddMemberInput, UpdateMemberRoleInput as IUpdateMemberRoleInput } from "@kosh/validation";
import { createZodDto } from "nestjs-zod";
import { AddMemberSchema, UpdateMemberRoleSchema } from "@kosh/validation";
import { MemberRole } from "../entities/storeMember.entity";

@InputType()
export class AddMemberInput extends createZodDto(AddMemberSchema) {
  @Field(() => String)
  email!: string;

  @Field(() => MemberRole)
  role!: MemberRole;
}

@InputType()
export class UpdateMemberRoleInput extends createZodDto(UpdateMemberRoleSchema) {
  @Field(() => MemberRole)
  role!: MemberRole;
}
