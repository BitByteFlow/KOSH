/* eslint-disable prettier/prettier */
import {
	Body,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Req,
} from "@nestjs/common";

import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { CategoryService } from "./categories.service";
import { CategoryResponseDto } from "./dto/CategoryResponseDto";
import { CreateCategoryDto } from "./dto/CreateCategoryDto";
import type { AuthenticatedRequest } from "src/types/auth";

@Controller("categories/")
export class CategoriesController {
	constructor(private categoryService: CategoryService) {}

	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	@Post()
	async createCategory(
		@Req() req: AuthenticatedRequest,
		@Body() createCategory: CreateCategoryDto,
	): Promise<CategoryResponseDto> {
		console.log(req.user);
		const response = await this.categoryService.createCategories(
			createCategory.name,
			req.user.id,
		);
		return response;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.ACCEPTED)
	@Get()
	async getCategories(@Req() req: AuthenticatedRequest): Promise<any> {
		const response = await this.categoryService.getCategories(req.user.id);

		return response;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.ACCEPTED)
	@Delete(":id")
	async deleteCategory(
		@Req() req: AuthenticatedRequest,
		@Param("id") id: string,
	): Promise<CategoryResponseDto> {
		const response = await this.categoryService.deleteCategories(
			id,
			req.user.id,
		);
		return response;
	}
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.ACCEPTED)
	@Patch(":id")
	async updateCategory(
		@Req() req: AuthenticatedRequest,
		@Param("id") id: string,
		@Body() createCategory: CreateCategoryDto,
	): Promise<CategoryResponseDto> {
		const response = await this.categoryService.updateCategories(
			id,
			req.user.id,
			createCategory.name,
		);
		return response;
	}
}
