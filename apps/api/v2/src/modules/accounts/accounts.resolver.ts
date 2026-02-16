import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AccountsService } from './accounts.service';
import { AccountTransaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { Balance } from './entities/balance.entity';
import { PaginatedTransactions } from './entities/paginated-transactions.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';

@Resolver(() => AccountTransaction)
@UseGuards(JwtAuthGuard)
export class AccountsResolver {
  constructor(private readonly accountsService: AccountsService) {}

  @Mutation(() => AccountTransaction)
  async createTransaction(
    @Args('input') createTransactionDto: CreateTransactionDto,
	@CurrentUser() user: any,
  ) {
    const userId = user.id; 
    return this.accountsService.createTransaction(createTransactionDto, userId);
  }

  @Query(() => Balance)
  async getCurrentCashBalance(@CurrentUser() user: any) {
    const userId = user.id;
    return this.accountsService.getCurrentCashBalance(userId);
  }

  @Query(() => PaginatedTransactions)
  async getAccountTransactions(
		@CurrentUser() user: any,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('sortBy', { nullable: true, defaultValue: 'createdAt' }) sortBy: string,
    @Args('sortOrder', { nullable: true, defaultValue: 'desc' }) sortOrder: string,
  ) {
    const userId = user.id;
    return this.accountsService.getAccountTransactions(
      userId,
      page,
      limit,
      sortBy as "createdAt" | "amount" | "type",
      sortOrder as "asc" | "desc"
    );
  }
}
