/* eslint-disable global-require */
import moment from 'moment';
import {AnyQueryBuilder, mixin, Model} from 'objection';
import TenantModel from 'models/TenantModel';
import ModelSettings from './ModelSetting';
import UncategorizedCashflowTransactionMeta from './UncategorizedCashflowTransaction.meta';

export default class UncategorizedCashflowTransaction extends mixin(
  TenantModel,
  [ModelSettings]
) {
  id!: number;
  date!: Date | string;

  /**
   * Transaction amount.
   * Negative represents to spending and positive to deposit/card charge.
   * @param {number}
   */
  amount!: number;
  categorized!: boolean;
  accountId!: number;
  referenceNo!: string;
  payee!: string;
  description!: string;
  plaidTransactionId!: string;
  recognizedTransactionId!: number;
  excludedAt: Date;
  pending: boolean;

  /**
   * Table name.
   */
  static get tableName() {
    return 'uncategorized_cashflow_transactions';
  }

  /**
   * Timestamps columns.
   */
  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  /**
   * Virtual attributes.
   */
  static get virtualAttributes() {
    return [
      'withdrawal',
      'deposit',
      'isDepositTransaction',
      'isWithdrawalTransaction',
      'isRecognized',
      'isExcluded',
      'isPending',
    ];
  }

  static get meta() {
    return UncategorizedCashflowTransactionMeta;
  }

  /**
   * Retrieves the withdrawal amount.
   * @returns {number}
   */
  public get withdrawal() {
    return this.amount < 0 ? Math.abs(this.amount) : 0;
  }

  /**
   * Retrieves the deposit amount.
   * @returns {number}
   */
  public get deposit(): number {
    return this.amount > 0 ? Math.abs(this.amount) : 0;
  }

  /**
   * Detarmines whether the transaction is deposit transaction.
   */
  public get isDepositTransaction(): boolean {
    return this.deposit > 0;
  }

  /**
   * Detarmines whether the transaction is withdrawal transaction.
   */
  public get isWithdrawalTransaction(): boolean {
    return this.withdrawal > 0;
  }

  /**
   * Detarmines whether the transaction is recognized.
   */
  public get isRecognized(): boolean {
    return !!this.recognizedTransactionId;
  }

  /**
   * Detarmines whether the transaction is excluded.
   * @returns {boolean}
   */
  public get isExcluded(): boolean {
    return !!this.excludedAt;
  }

  /**
   * Detarmines whether the transaction is pending.
   * @returns {boolean}
   */
  public get isPending(): boolean {
    return !!this.pending;
  }

  /**
   * Model modifiers.
   */
  static get modifiers() {
    return {
      /**
       * Filters the not excluded transactions.
       */
      notExcluded(query: AnyQueryBuilder) {
        query.whereNull('excluded_at');
      },

      /**
       * Filters the excluded transactions.
       */
      excluded(query) {
        query.whereNotNull('excluded_at');
      },

      /**
       * Filter out the recognized transactions.
       * @param query
       */
      recognized(query) {
        query.whereNotNull('recognizedTransactionId');
      },

      /**
       * Filter out the not recognized transactions.
       * @param query
       */
      notRecognized(query) {
        query.whereNull('recognizedTransactionId');
      },

      categorized(query) {
        query.whereNotNull('categorizeRefType');
        query.whereNotNull('categorizeRefId');
      },

      notCategorized(query) {
        query.whereNull('categorizeRefType');
        query.whereNull('categorizeRefId');
      },

      /**
       * Filters the not pending transactions.
       */
      notPending(query) {
        query.where('pending', false);
      },

      /**
       * Filters the pending transactions.
       */
      pending(query) {
        query.where('pending', true);
      },

      minAmount(query, minAmount) {
        query.where('amount', '>=', minAmount);
      },

      maxAmount(query, maxAmount) {
        query.where('amount', '<=', maxAmount);
      },

      toDate(query, toDate) {
        const dateFormat = 'YYYY-MM-DD';
        const _toDate = moment(toDate).endOf('day').format(dateFormat);

        query.where('date', '<=', _toDate);
      },

      fromDate(query, fromDate) {
        const dateFormat = 'YYYY-MM-DD';
        const _fromDate = moment(fromDate).startOf('day').format(dateFormat);

        query.where('date', '>=', _fromDate);
      },

      matchDescription(query: AnyQueryBuilder, matchDescription: string) {
        query.where(`${(UncategorizedCashflowTransaction.tableName)}.description`, 'like', `%${matchDescription}%`);
      },
    };
  }

  /**
   * Relationship mapping.
   */
  static get relationMappings() {
    const Account = require('models/Account');
    const {
      RecognizedBankTransaction,
    } = require('models/RecognizedBankTransaction');
    const { MatchedBankTransaction } = require('models/MatchedBankTransaction');

    return {
      /**
       * Transaction may has associated to account.
       */
      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: Account.default,
        join: {
          from: 'uncategorized_cashflow_transactions.accountId',
          to: 'accounts.id',
        },
      },

      /**
       * Transaction may has association to recognized transaction.
       */
      recognizedTransaction: {
        relation: Model.HasOneRelation,
        modelClass: RecognizedBankTransaction,
        join: {
          from: 'uncategorized_cashflow_transactions.recognizedTransactionId',
          to: 'recognized_bank_transactions.id',
        },
      },

      /**
       * Uncategorized transaction may has association to matched transaction.
       */
      matchedBankTransactions: {
        relation: Model.HasManyRelation,
        modelClass: MatchedBankTransaction,
        join: {
          from: 'uncategorized_cashflow_transactions.id',
          to: 'matched_bank_transactions.uncategorizedTransactionId',
        },
      },
    };
  }
}
