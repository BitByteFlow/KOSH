import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { StoreService } from "./store.service";
import { StoreResponse, StoresResponse } from "./entities/store.entity";
import { CreateStoreInput, UpdateStoreInput } from "./dto/store.input";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { CurrentUser } from "src/utils/currentUser.decorator";
import type { AuthenticatedUser } from "src/types/jwt.types";

@Resolver()
@UseGuards(JwtAuthGuard)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  @Mutation(() => StoreResponse)
  async createStore(
    @Args("input") input: CreateStoreInput,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<StoreResponse> {
    return this.storeService.createStore(user.id, input);
  }

  @Mutation(() => StoreResponse)
  async updateStore(
    @Args("storeId") storeId: string,
    @Args("input") input: UpdateStoreInput,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<StoreResponse> {
    return this.storeService.updateStore(storeId, user.id, input);
  }

  @Mutation(() => StoreResponse)
  async deleteStore(
    @Args("storeId") storeId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<StoreResponse> {
    return this.storeService.deleteStore(storeId, user.id);
  }

  @Query(() => StoresResponse)
  async getStores(@CurrentUser() user: AuthenticatedUser): Promise<StoresResponse> {
    return this.storeService.getStores(user.id);
  }

  @Query(() => StoreResponse)
  async getStoreById(@Args("storeId") storeId: string): Promise<StoreResponse> {
    return this.storeService.getStoreById(storeId);
  }
}
