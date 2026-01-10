export type TransactionState =
  | 'INITIATED'
  | 'PENDING_RISK_SCREENING'
  | 'DENIED'
  | 'QUEUED'
  | 'SENT'
  | 'CONFIRMED'
  | 'COMPLETE'
  | 'FAILED'
  | 'CANCELLED';

export type TransactionType = 'INBOUND' | 'OUTBOUND' | 'transfer';

export interface Transaction {
  id: string;
  hash?: string;
  state: TransactionState;
  type: TransactionType;
  amounts: string[];
  tokenId: string;
  walletId: string;
  sourceAddress: string;
  destinationAddress: string;
  transactionType: string;
  createDate: string;
  updateDate: string;
  errorReason?: string;
  feeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  networkFee?: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: bigint;
  blockHash: string;
  status: 'success' | 'reverted';
  gasUsed: bigint;
}

export interface TransactionFilters {
  type?: TransactionType;
  state?: TransactionState;
  from?: Date;
  to?: Date;
  minAmount?: string;
  maxAmount?: string;
}

export interface TransferParams {
  // Primary fields (one of these required)
  to?: string;
  recipient?: string;
  // Amount can be string or number
  amount: string | number;
  // Optional fields
  memo?: string;
  idempotencyKey?: string;
  // For TransactionBuilder
  id?: string;
}

export interface TransactionResult {
  transaction: Transaction;
  hash?: string;
  success: boolean;
}
