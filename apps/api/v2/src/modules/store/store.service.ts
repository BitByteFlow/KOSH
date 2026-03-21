import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateStoreInput, UpdateStoreInput } from "./dto/store.input";
import { StoreResponse, StoresResponse } from "./entities/store.entity";

@Injectable()
export class StoreService {
  constructor(private readonly database: DatabaseService) { }

  async createStore(creatorId: string, input: CreateStoreInput): Promise<StoreResponse> {
    const store = await this.database.prisma.store.create({
      data: {
        ...input,
        creatorId,
      },
    });

    // Automatically create settings for the new store
    await this.database.prisma.settings.create({
      data: {
        storeId: store.id,
      },
    });

    // Automatically add the creator as an ADMIN member of the store
    await this.database.prisma.storeMember.create({
      data: {
        storeId: store.id,
        userId: creatorId,
        role: "ADMIN",
      },
    });

    return {
      success: true,
      message: "Store created successfully",
      data: store as any,
    };
  }

  async updateStore(storeId: string, userId: string, input: UpdateStoreInput): Promise<StoreResponse> {
    const store = await this.database.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    if (store.creatorId !== userId) {
      throw new ForbiddenException("Only the store creator can update it");
    }

    const updatedStore = await this.database.prisma.store.update({
      where: { id: storeId },
      data: input,
    });

    return {
      success: true,
      message: "Store updated successfully",
      data: updatedStore as any,
    };
  }

  async deleteStore(storeId: string, userId: string): Promise<StoreResponse> {
    const store = await this.database.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    if (store.creatorId !== userId) {
      throw new ForbiddenException("Only the store creator can delete it");
    }

    await this.database.prisma.store.delete({
      where: { id: storeId },
    });

    return {
      success: true,
      message: "Store deleted successfully",
    };
  }

  async getStores(userId: string): Promise<StoresResponse> {
    const memberships = await this.database.prisma.storeMember.findMany({
      where: { userId },
      include: { store: true },
    });

    const stores = memberships.map((m) => m.store);

    return {
      success: true,
      message: "Stores fetched successfully",
      data: stores
    };
  }

  async getStoreById(storeId: string): Promise<StoreResponse> {
    const store = await this.database.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    return {
      success: true,
      message: "Store fetched successfully",
      data: store as any,
    };
  }
}
