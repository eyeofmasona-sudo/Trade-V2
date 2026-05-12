import { create } from 'zustand';

export type TxStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Completed';
export type TxType = 'Deposit' | 'Withdrawal';

export interface TxRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: TxType;
  amount: number;
  currency: string;
  status: TxStatus;
  date: string;
}

export interface AdminNotification {
  id: string;
  message: string;
  date: string;
  read: boolean;
}

interface TransactionState {
  requests: TxRequest[];
  notifications: AdminNotification[];
  addRequest: (req: Omit<TxRequest, 'id' | 'date' | 'status'>) => void;
  updateRequestStatus: (id: string, status: TxStatus) => void;
  addNotification: (message: string) => void;
  markNotificationRead: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  requests: [],
  notifications: [],
  addRequest: (reqData) => set((state) => {
    const newReq: TxRequest = {
      ...reqData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: 'Pending',
    };
    
    const notifMsg = `New ${newReq.type.toLowerCase()} request from ${newReq.userName} — ${newReq.amount} ${newReq.currency}`;
    const newNotif: AdminNotification = {
      id: crypto.randomUUID(),
      message: notifMsg,
      date: new Date().toISOString(),
      read: false,
    };

    return { 
      requests: [newReq, ...state.requests],
      notifications: [newNotif, ...state.notifications]
    };
  }),
  updateRequestStatus: (id, status) => set((state) => {
    const newReqs = state.requests.map(r => r.id === id ? { ...r, status } : r);
    return { requests: newReqs };
  }),
  addNotification: (message) => set((state) => ({
    notifications: [{
      id: crypto.randomUUID(),
      message,
      date: new Date().toISOString(),
      read: false
    }, ...state.notifications]
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  }))
}));
