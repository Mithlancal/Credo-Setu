// Simple LocalStorage Wrapper for our simulated database

const STORE_KEY = 'credo_setu_db';

const defaultState = {
  merchant: {
    id: null,
    name: '',
    phone: '',
    score: 300, // starting base score
    onboardedAt: null
  },
  transactions: [],
  peerRequests: [] // Incoming peer validation requests
};

export const getStore = () => {
  const data = localStorage.getItem(STORE_KEY);
  if (!data) return { ...defaultState };
  return JSON.parse(data);
};

export const saveStore = (data) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
};

export const clearStore = () => {
  localStorage.removeItem(STORE_KEY);
};

// Initialize with some dummy peer requests if empty
export const initDummyDataIfNeeded = () => {
  const store = getStore();
  if (store.peerRequests.length === 0) {
    store.peerRequests = [
      { id: 'req_1', merchantName: 'Raju Tea Stall', amount: 150, type: 'credit', timestamp: Date.now() - 3600000, status: 'pending' },
      { id: 'req_2', merchantName: 'Gupta Kirana', amount: 500, type: 'sale', timestamp: Date.now() - 7200000, status: 'pending' }
    ];
    saveStore(store);
  }
};
