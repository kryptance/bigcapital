import { Inject, Service } from 'typedi';
import { initialize } from 'objection';
import { TransformerInjectable } from '@/lib/Transformer/TransformerInjectable';
import { IGetUncategorizedTransactionsQuery } from '@/interfaces';
import HasTenancyService from '../Tenancy/TenancyService';
import { UncategorizedTransactionTransformer } from './UncategorizedTransactionTransformer';

@Service()
export class GetUncategorizedTransactions {
  @Inject()
  private tenancy: HasTenancyService;

  @Inject()
  private transformer: TransformerInjectable;

  /**
   * Retrieves the uncategorized cashflow transactions.
   * @param {number} tenantId - Tenant id.
   * @param {number} accountId - Account Id.
   */
  public async getTransactions(
    tenantId: number,
    accountId: number,
    query: IGetUncategorizedTransactionsQuery,
  ) {
    const {
      UncategorizedCashflowTransaction,
      RecognizedBankTransaction,
      MatchedBankTransaction,
      Account,
    } = this.tenancy.models(tenantId);
    const knex = this.tenancy.knex(tenantId);

    // Parsed query with default values.
    const _query = {
      page: 1,
      pageSize: 20,
      ...query,
    };

    // Initialize the ORM models metadata.
    await initialize(knex, [
      UncategorizedCashflowTransaction,
      MatchedBankTransaction,
      RecognizedBankTransaction,
      Account,
    ]);

    const { results, pagination } = await UncategorizedCashflowTransaction.query()
      .onBuild((q) => {
        q.where('accountId', accountId);
        q.where('categorized', false);

        q.modify('notExcluded');
        q.modify('notPending');

        q.withGraphFetched('account');
        q.withGraphFetched('recognizedTransaction.assignAccount');

        q.withGraphJoined('matchedBankTransactions');

        q.whereNull('matchedBankTransactions.id');
        q.orderBy('date', 'DESC');

        if (_query.minDate) {
          q.modify('fromDate', _query.minDate);
        }
        if (_query.maxDate) {
          q.modify('toDate', _query.maxDate);
        }
        if (_query.matchDescription) {
          q.modify('matchDescription', _query.matchDescription);
        }
        if (_query.minAmount) {
          q.modify('minAmount', _query.minAmount);
        }
        if (_query.maxAmount) {
          q.modify('maxAmount', _query.maxAmount);
        }
      })
      .pagination(_query.page - 1, _query.pageSize);

    const data = await this.transformer.transform(
      tenantId,
      results,
      new UncategorizedTransactionTransformer(),
    );
    return {
      data,
      pagination,
    };
  }
}
