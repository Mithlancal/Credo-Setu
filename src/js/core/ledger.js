import { getStore, saveStore } from './store.js';

/**
 * Generates a SHA-256 hash using the Web Crypto API
 * @param {string} message 
 * @returns {Promise<string>} Hex representation of the hash
 */
export async function generateHash(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Adds a new transaction to the ledger
 * @param {Object} txDetails 
 */
export async function addTransaction(txDetails) {
  const store = getStore();
  const previousTx = store.transactions.length > 0 ? store.transactions[store.transactions.length - 1] : null;
  const previousHash = previousTx ? previousTx.hash : 'GENESIS_HASH_0000000000000000';
  
  const txRecord = {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    amount: txDetails.amount,
    type: txDetails.type, // 'sale' or 'credit'
    customerPhone: txDetails.customerPhone || 'Walk-in',
    previousHash: previousHash,
    status: 'pending_validation' // requires peer validation to become 'verified'
  };

  // Create hash for current transaction linking it to the previous hash (Merkle chain logic)
  const dataString = `${txRecord.id}|${txRecord.timestamp}|${txRecord.amount}|${txRecord.type}|${previousHash}`;
  txRecord.hash = await generateHash(dataString);

  store.transactions.push(txRecord);
  saveStore(store);
  
  return txRecord;
}

export function getTransactions() {
  return getStore().transactions.sort((a, b) => b.timestamp - a.timestamp);
}
