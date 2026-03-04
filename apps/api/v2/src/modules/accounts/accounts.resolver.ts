import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AccountsService } from './accounts.service';
import { AccountTransaction } from './entities/transaction.entity';
import { CreateTransactionInput } from './dto/createTransaction.dto';
import { BalanceResponse } from './entities/balance.entity';
import { PaginatedTransactionsResponse } from './entities/paginatedTransactions.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { AccountResponse, UpdateAccountTransactionResponse } from './entities/account.entity';
import { UpdateTransactionInput } from './dto/updateTransaction.dto';

@Resolver(() => AccountTransaction)
@UseGuards(JwtAuthGuard)
export class AccountsResolver {
  constructor(private readonly accountsService: AccountsService) { }

  @Mutation(() => AccountResponse)
  async createTransaction(
    @Args('createTransactionInput') createTransactionDto: CreateTransactionInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AccountResponse> {
    const userId = user.id;
    return this.accountsService.createTransaction(createTransactionDto, userId);
  }

  @Query(() => BalanceResponse)
  async getCurrentCashBalance(@CurrentUser() user: AuthenticatedUser): Promise<BalanceResponse> {
    const userId = user.id;
    return this.accountsService.getCurrentCashBalance(userId);
  }

  @Mutation(() => UpdateAccountTransactionResponse)
  async updateAccountTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Args('transactionId', { type: () => String }) transactionId: string,
    @Args('updateTransactionInput', { type: () => UpdateTransactionInput }) updateTransactionDto: UpdateTransactionInput,
  ): Promise<UpdateAccountTransactionResponse> {
    const userId = user.id;
    return this.accountsService.updateAccountTransaction(transactionId, updateTransactionDto, userId);
  }

  @Query(() => PaginatedTransactionsResponse)
  async getAccountTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('sortBy', { nullable: true, defaultValue: 'createdAt' }) sortBy: string,
    @Args('sortOrder', { nullable: true, defaultValue: 'desc' }) sortOrder: string,
  ): Promise<PaginatedTransactionsResponse> {
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
