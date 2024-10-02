/**
 * Represents an error that can occur in a transaction. Can be of any type or null.
 */
export type TxError = unknown | null;

/**
 * Enum for transaction status.
 */
export enum TxStatus {
  Failed,
  Mined,
  Pending,
}

/**
 * Represents a record of a transaction.
 */
export type TxRecord = {
  hash: string; // The hash of the transaction.
  from: string; // The address initiating the transaction.
  status: TxStatus; // The status of the transaction.
  error: TxError; // Any error associated with the transaction.
};

/**
 * Represents a mapping of transaction hashes to their corresponding records.
 */
export type TxByHash = Record<string, TxRecord>;
