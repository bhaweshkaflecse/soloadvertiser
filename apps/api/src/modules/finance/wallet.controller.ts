import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletTransactionQueryDto } from './dto/finance-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@solo-advertiser/types';

/**
 * Wallet Controller — Rider self-service wallet endpoints.
 *
 * Riders can view their own balance and transaction history.
 */
@Controller('api/v1/finance/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * GET /api/v1/finance/wallet/me
   * Get own wallet balance + recent transactions.
   */
  @Get('me')
  @Roles(Role.RIDER)
  async getMyWallet(@CurrentUser('sub') userId: string) {
    // Note: In production, resolve riderId from userId
    // For now assumes userId mapping to riderId via rider module
    const wallet = await this.walletService.getWalletWithTransactions(userId);
    return { data: wallet };
  }

  /**
   * GET /api/v1/finance/wallet/me/transactions
   * Paginated transaction history for the rider.
   */
  @Get('me/transactions')
  @Roles(Role.RIDER)
  async getMyTransactions(
    @CurrentUser('sub') userId: string,
    @Query() query: WalletTransactionQueryDto,
  ) {
    // Resolve riderId from userId in production
    const transactions = await this.walletService.getTransactions(userId, {
      page: query.page,
      pageSize: query.pageSize,
      type: query.type,
    });
    return transactions;
  }
}
