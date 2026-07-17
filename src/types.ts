export interface Ticket {
  id: string;
  number: string;
  type: "U" | "A" | "C"; // U: Uniform Pickup/Try-on, A: Size Alteration/Exchange, C: Cashier/Checkout
  status: "waiting" | "called" | "completed" | "skipped";
  timestamp: number;
  phone?: string;
  schoolName?: string;
  orderedItems?: {
    id: number;
    name: string;
    size: string;
    quantity: number;
    price: number;
  }[];
}

export interface SKU {
  size: string;
  stock: number;
}

export interface MenuItem {
  id: number;
  name: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
  category: string;
  price: number;
  schoolId: string; // The school this uniform belongs to
  schoolName: string;
  skus: SKU[];
  imageUrl?: string;
}

export interface OutOfStockRegistration {
  id: string;
  itemId: number;
  itemName: string;
  schoolName: string;
  phoneNumber: string;
  quantity: number;
  timestamp: number;
  status: "pending" | "resolved";
  size: string;
}

export interface AdminNotification {
  id: string;
  type: "out_of_stock" | "queue_alert" | "new_order";
  message: string;
  detail: string;
  timestamp: number;
  read: boolean;
}

export interface QueueStatus {
  success: boolean;
  currentCalled: {
    U: string;
    A: string;
    C: string;
  };
  waitingCount: {
    U: number;
    A: number;
    C: number;
  };
  waitingList: {
    U: Ticket[];
    A: Ticket[];
    C: Ticket[];
  };
  totalWaitingCount: number;
}
