import { Transaction, TransactionLabel } from './types';

export const parseCSV = (csvContent: string): Transaction[] => {
  const lines = csvContent.trim().split('\n');
  // Remove header
  const rows = lines.slice(1);

  return rows
    .filter(row => row.trim().length > 0) // Robust check for empty lines
    .map((row, index) => {
      // Handle potential quotes in CSV if strictly needed, but simple split works for this dataset
      // Trim each column to avoid issues with spaces (e.g. "USDT " vs "USDT")
      const cols = row.split(',').map(c => c.trim());
      
      // Date (UTC), Label, Outgoing Asset, Outgoing Amount, Incoming Asset, Incoming Amount, Fee Asset, Fee Amount, Trx. ID, Comment
      const dateStr = cols[0];
      // Ensure standard ISO format for parsing (replace space with T and add Z if missing)
      const isoDate = dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z');
      
      return {
        id: `txn-${index}-${cols[8]}`, // Unique ID combining index and trxId for stability
        date: new Date(isoDate),
        label: cols[1] as TransactionLabel,
        outgoingAsset: cols[2],
        outgoingAmount: parseFloat(cols[3] || '0'),
        incomingAsset: cols[4],
        incomingAmount: parseFloat(cols[5] || '0'),
        feeAsset: cols[6],
        feeAmount: parseFloat(cols[7] || '0'),
        trxId: cols[8],
        comment: cols[9]?.replace('\r', ''),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Default sort descending
};

export const formatCurrency = (amount: number, currency: string | undefined) => {
  // Format the number regardless of currency presence
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);

  // If currency is provided (and not empty), append it. Otherwise just return number.
  return currency ? `${formatted} ${currency}` : formatted;
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};