import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AccountsService } from './accounts.service';
import { AccountTransaction } from './entities/transaction.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { Balance } from './entities/balance.entity';
import { PaginatedTransactions } from './entities/paginated-transactions.entity';

@Resolver(() => AccountTransaction)
export class AccountsResolver {
  constructor(private readonly accountsService: AccountsService) {}

  @Mutation(() => AccountTransaction)
  async createTransaction(
    @Args('createTransactionInput') createTransactionInput: CreateTransactionInput,
  ) {
    // TODO: Get userId from context/auth
    const userId = "cmp73b3p00000u80t51025a5p"; 
    return this.accountsService.createTransaction(createTransactionInput, userId);
  }

  @Query(() => Balance)
  async getCurrentCashBalance() {
    const userId = "cmp73b3p00000u80t51025a5p";
    return this.accountsService.getCurrentCashBalance(userId);
  }

  @Query(() => PaginatedTransactions)
  async getAccountTransactions(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('sortBy', { nullable: true, defaultValue: 'createdAt' }) sortBy: string,
    @Args('sortOrder', { nullable: true, defaultValue: 'desc' }) sortOrder: string,
  ) {
    const userId = "cmp73b3p00000u80t51025a5p";
    return this.accountsService.getAccountTransactions(
      userId,
      page,
      limit,
      sortBy as "createdAt" | "amount" | "type",
      sortOrder as "asc" | "desc"
    );
  }
}
