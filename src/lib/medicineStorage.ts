// lib/medicineStorage.ts
import { MedicineOrder } from '@/types';

const STORAGE_KEY = 'shedula_medicine_orders';

export const getMedicineOrders = (): MedicineOrder[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const ordersJson = localStorage.getItem(STORAGE_KEY);
  return ordersJson ? JSON.parse(ordersJson) : [];
};

export const saveMedicineOrder = (order: MedicineOrder) => {
  if (typeof window === 'undefined') {
    return;
  }
  const orders = getMedicineOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const cancelMedicineOrder = (orderId: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  const orders = getMedicineOrders();
  const updatedOrders = orders.filter(order => order.orderId !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
};

// Function to update an existing order (e.g., status, though not used in this iteration)
export const updateMedicineOrder = (orderId: string, updates: Partial<MedicineOrder>) => {
  if (typeof window === 'undefined') {
    return;
  }
  const orders = getMedicineOrders();
  const updatedOrders = orders.map(order =>
    order.orderId === orderId ? { ...order, ...updates } : order
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
};