import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "src/database/database.service";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { Prisma } from "@kosh/db";

@Injectable()
export class AuthService {
	constructor(
		private readonly database: DatabaseService,
		private readonly jwtService: JwtService,
	) { }

	async createUser(
		email: string,
		googleId: string,
		image: string,
		username: string,
		isCashier: boolean = false,
	): Promise<AuthResponseDto> {
		const existinguser = await this.database.user.findFirst({
			where: {
				OR: [
					{ email: email },
					{
						googleId: {
							equals: googleId,
						},
					},
				],
			},
		});

		if (existinguser) {
			throw new UnauthorizedException(
				"User already exists with this email and user Id",
			);
		}
		return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient): Promise<AuthResponseDto> => {
			const user = await tsx.user.create({
				data: {
					googleId: googleId,
					email: email,
					image: image,
					username: username,
				},
			})

			const token = this.jwtService.sign({
				sub: user.id,
				email: user.email,
				username: user.username,
			});

			if (isCashier) {
				return {
					user: {
						id: user.id,
						email: user.email,
						username: user.username,
					},
				}
			}

			const store = await tsx.store.create({
				data: {
					name: `store-${username}`,
					creatorId: user.id,
					members: {
						create: {
							userId: user.id,
							role: "ADMIN",
						}
					}
				}
			})

			return {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
				},
				store: {
					storeId: store.id,
					storeName: store.name,
				}
			};
		})

	}

	async signin(email: string, googleId: string, isCashier: boolean = false): Promise<AuthResponseDto> {
		const existinguser = await this.database.user.findFirst({
			where: {
				AND: [
					{ email: email },
					{
						googleId: {
							equals: googleId,
						},
					},
				],
			},
			include: {
				storeMember: {
					include: {
						store: {
							select: {
								id: true,
								name: true,
							}
						}
					}
				},
				createdStores: {
					take: 1,
					select: {
						id: true,
						name: true,
					}
				}
			}
		});

		if (!existinguser) {
			throw new UnauthorizedException(
				"User doesn't exist with this email and googleId",
			);
		}

		const token = this.jwtService.sign({
			sub: existinguser.id,
			email: existinguser.email,
			username: existinguser.username,
		});

		return {
			user: {
				id: existinguser.id,
				email: existinguser.email,
				username: existinguser.username,
			},
			store: {
				storeId: isCashier ? existinguser.storeMember?.store.id || "" : existinguser.createdStores[0].id,
				storeName: isCashier ? existinguser.storeMember?.store.name || "" : existinguser.createdStores[0].name,
			},
			isStoreCashier: isCashier && existinguser.storeMember !== null && existinguser.storeMember.isActive,
		};
	}
}
