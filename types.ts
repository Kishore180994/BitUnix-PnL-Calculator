export interface Transaction {
  id: string;
  date: Date;
  label: string;
  outgoingAsset: string;
  outgoingAmount: number;
  incomingAsset: string;
  incomingAmount: number;
  feeAsset: string;
  feeAmount: number;
  trxId: string;
  comment: string;
}

export interface DashboardStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalFees: number;
  netPnL: number;
  transactionCount: number;
}

export enum TransactionLabel {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Swap = 'Swap',
  FuturesProfit = 'Futures Profit',
  FuturesLoss = 'Futures Loss',
  RebateAgent = 'Rebate (Agent)',
  RebateNormal = 'Rebate (Normal)',
  SpotTrade = 'Spot Trade'
}