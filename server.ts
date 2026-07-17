import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Ticket {
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

interface SKU {
  size: string;
  stock: number;
}

interface MenuItem {
  id: number;
  name: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
  category: string;
  price: number;
  schoolId: string;
  schoolName: string;
  skus: SKU[];
  imageUrl?: string;
}

interface OutOfStockRegistration {
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

interface AdminNotification {
  id: string;
  type: "out_of_stock" | "queue_alert" | "new_order";
  message: string;
  detail: string;
  timestamp: number;
  read: boolean;
}

// Initial Mock Queues
let tickets: Ticket[] = [
  { 
    id: "t1", 
    number: "U001", 
    type: "U", 
    status: "completed", 
    timestamp: Date.now() - 3600000,
    schoolName: "杭州市第一中学",
    orderedItems: [{ id: 1, name: "初中部夏季英伦风短袖衬衫", size: "150", quantity: 1, price: 120 }]
  },
  { 
    id: "t2", 
    number: "U002", 
    type: "U", 
    status: "called", 
    timestamp: Date.now() - 120000,
    schoolName: "西湖外国语学校",
    orderedItems: [{ id: 4, name: "贵族风制式双排扣礼服西装", size: "150", quantity: 2, price: 480 }]
  },
  { id: "t3", number: "A001", type: "A", status: "waiting", timestamp: Date.now() - 300000 },
  { id: "t4", number: "C001", type: "C", status: "waiting", timestamp: Date.now() - 150000 },
  { id: "t5", number: "U003", type: "U", status: "waiting", timestamp: Date.now() - 80000, schoolName: "浙江实验小学" }
];

let nextSerialNumbers = { U: 4, A: 2, C: 2 };

// Dynamic Uniform Menu items with nested SKU structure
let menuItems: MenuItem[] = [
  // School 1: 杭州市第一中学 (hz1)
  {
    id: 1,
    name: "初中部夏季英伦风短袖衬衫",
    status: "low_stock",
    category: "夏季校服",
    price: 120,
    schoolId: "hz1",
    schoolName: "杭州市第一中学",
    skus: [
      { size: "140", stock: 3 },
      { size: "150", stock: 12 },
      { size: "160", stock: 0 },
      { size: "170", stock: 8 },
      { size: "180", stock: 1 }
    ]
  },
  {
    id: 2,
    name: "高中部秋季高级防风运动外套",
    status: "in_stock",
    category: "秋季校服",
    price: 260,
    schoolId: "hz1",
    schoolName: "杭州市第一中学",
    skus: [
      { size: "150", stock: 0 },
      { size: "160", stock: 15 },
      { size: "170", stock: 24 },
      { size: "180", stock: 0 },
      { size: "190", stock: 2 }
    ]
  },
  {
    id: 3,
    name: "初/高中男女通用运动长裤",
    status: "in_stock",
    category: "运动系列",
    price: 110,
    schoolId: "hz1",
    schoolName: "杭州市第一中学",
    skus: [
      { size: "140", stock: 11 },
      { size: "150", stock: 0 },
      { size: "160", stock: 9 },
      { size: "170", stock: 14 },
      { size: "180", stock: 0 }
    ]
  },

  // School 2: 西湖外国语学校 (xhfl)
  {
    id: 4,
    name: "贵族风制式双排扣礼服西装",
    status: "in_stock",
    category: "制式礼服",
    price: 480,
    schoolId: "xhfl",
    schoolName: "西湖外国语学校",
    skus: [
      { size: "130", stock: 2 },
      { size: "140", stock: 0 },
      { size: "150", stock: 5 },
      { size: "160", stock: 0 },
      { size: "170", stock: 4 }
    ]
  },
  {
    id: 5,
    name: "纯棉针织V领学院风毛背心",
    status: "in_stock",
    category: "常服系列",
    price: 150,
    schoolId: "xhfl",
    schoolName: "西湖外国语学校",
    skus: [
      { size: "130", stock: 8 },
      { size: "140", stock: 12 },
      { size: "150", stock: 0 },
      { size: "160", stock: 14 }
    ]
  },

  // School 3: 浙江实验小学 (zjes)
  {
    id: 6,
    name: "小学生防泼水连帽冲锋衣",
    status: "low_stock",
    category: "户外校服",
    price: 199,
    schoolId: "zjes",
    schoolName: "浙江实验小学",
    skus: [
      { size: "110", stock: 1 },
      { size: "120", stock: 0 },
      { size: "130", stock: 18 },
      { size: "140", stock: 0 },
      { size: "150", stock: 5 }
    ]
  },
  {
    id: 7,
    name: "百搭松紧带全棉舒适短裤",
    status: "in_stock",
    category: "夏季校服",
    price: 75,
    schoolId: "zjes",
    schoolName: "浙江实验小学",
    skus: [
      { size: "110", stock: 14 },
      { size: "120", stock: 9 },
      { size: "130", stock: 0 },
      { size: "140", stock: 3 }
    ]
  }
];

let outOfStockRegistrations: OutOfStockRegistration[] = [
  {
    id: "reg1",
    itemId: 1,
    itemName: "初中部夏季英伦风短袖衬衫",
    schoolName: "杭州市第一中学",
    phoneNumber: "13511112222",
    quantity: 1,
    timestamp: Date.now() - 600000,
    status: "pending",
    size: "160"
  }
];

let adminNotifications: AdminNotification[] = [
  {
    id: "notif1",
    type: "out_of_stock",
    message: "校服缺货需求警报",
    detail: "【杭州市第一中学】顾客 13511112222 登记了 1 件 【初中部夏季英伦风短袖衬衫 - 160 码】！",
    timestamp: Date.now() - 600000,
    read: false
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper helper to dynamically check/update item status based on its SKUs
  const updateItemStatus = (item: MenuItem) => {
    const totalStock = item.skus.reduce((sum, sku) => sum + sku.stock, 0);
    if (totalStock === 0) {
      item.status = "out_of_stock";
    } else if (totalStock < 8) {
      item.status = "low_stock";
    } else {
      item.status = "in_stock";
    }
  };

  // Run initial status calculation
  menuItems.forEach(updateItemStatus);

  // 1. Get queue overview
  app.get("/api/queue", (req, res) => {
    const currentCalled = {
      U: tickets.find(t => t.type === "U" && t.status === "called")?.number || "无",
      A: tickets.find(t => t.type === "A" && t.status === "called")?.number || "无",
      C: tickets.find(t => t.type === "C" && t.status === "called")?.number || "无",
    };

    const waitingList = {
      U: tickets.filter(t => t.type === "U" && t.status === "waiting"),
      A: tickets.filter(t => t.type === "A" && t.status === "waiting"),
      C: tickets.filter(t => t.type === "C" && t.status === "waiting"),
    };

    const totalWaitingCount = tickets.filter(t => t.status === "waiting").length;

    res.json({
      success: true,
      currentCalled,
      waitingCount: {
        U: waitingList.U.length,
        A: waitingList.A.length,
        C: waitingList.C.length,
      },
      waitingList,
      totalWaitingCount,
    });
  });

  // 2. Customer: Directly take queue ticket (e.g., if they just want size exchange/checkout)
  app.post("/api/queue/take", (req, res) => {
    const { type, phone, schoolName } = req.body;
    if (!type || !["U", "A", "C"].includes(type)) {
      return res.status(400).json({ success: false, error: "无效的排队服务类型" });
    }

    const serialNum = nextSerialNumbers[type as "U" | "A" | "C"];
    const paddedNum = String(serialNum).padStart(3, "0");
    const ticketNumber = `${type}${paddedNum}`;

    nextSerialNumbers[type as "U" | "A" | "C"]++;

    const newTicket: Ticket = {
      id: "ticket_" + Math.random().toString(36).substr(2, 9),
      number: ticketNumber,
      type: type as "U" | "A" | "C",
      status: "waiting",
      timestamp: Date.now(),
      phone: phone || undefined,
      schoolName: schoolName || undefined
    };

    tickets.push(newTicket);

    const countAhead = tickets.filter(
      t => t.type === type && t.status === "waiting" && t.id !== newTicket.id
    ).length;

    // Wait estimations: Uniform Pickup ~ 6m, Exchange ~ 10m, Cashier ~ 3m
    const estTime = countAhead * (type === "U" ? 6 : type === "A" ? 10 : 3);

    res.json({
      success: true,
      ticket: newTicket,
      position: countAhead + 1,
      ahead: countAhead,
      estimatedWaitMinutes: Math.max(3, estTime)
    });
  });

  // 3. Customer: Check single ticket progress
  app.get("/api/queue/ticket/:id", (req, res) => {
    const { id } = req.params;
    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, error: "未找到生效的排号信息" });
    }

    const ticket = tickets[ticketIndex];
    let ahead = 0;
    if (ticket.status === "waiting") {
      const typeWaiting = tickets.filter(t => t.type === ticket.type && t.status === "waiting");
      const ownIndex = typeWaiting.findIndex(t => t.id === ticket.id);
      ahead = ownIndex === -1 ? 0 : ownIndex;
    }

    const currentCalled = tickets.find(t => t.type === ticket.type && t.status === "called")?.number || "无";
    const estTime = ahead * (ticket.type === "U" ? 6 : ticket.type === "A" ? 10 : 3);

    res.json({
      success: true,
      ticket,
      ahead,
      currentCalled,
      estimatedWaitMinutes: Math.max(3, estTime)
    });
  });

  // 4. Create Order and Auto-Generate Queuing Number (如果有货，正常下单后返回叫号)
  app.post("/api/order/create", (req, res) => {
    const { schoolName, phone, items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "购物车商品为空" });
    }

    // Double check stocks and decrement
    for (const orderItem of items) {
      const dbItem = menuItems.find(i => i.id === orderItem.id);
      if (!dbItem) {
        return res.status(404).json({ success: false, error: `商品 ${orderItem.name} 不存在` });
      }
      const sku = dbItem.skus.find(s => s.size === orderItem.size);
      if (!sku || sku.stock < orderItem.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `商品 ${dbItem.name} 的 [${orderItem.size}] 尺码库存不足 (剩余 ${sku ? sku.stock : 0} 件)，请先进行缺货登记` 
        });
      }
    }

    // Deduct stock
    items.forEach(orderItem => {
      const dbItem = menuItems.find(i => i.id === orderItem.id)!;
      const sku = dbItem.skus.find(s => s.size === orderItem.size)!;
      sku.stock -= orderItem.quantity;
      updateItemStatus(dbItem);
    });

    // Auto-create calling number (type: "U" - Uniform Pickup/Try-on)
    const serialNum = nextSerialNumbers.U;
    const paddedNum = String(serialNum).padStart(3, "0");
    const ticketNumber = `U${paddedNum}`;
    nextSerialNumbers.U++;

    const newTicket: Ticket = {
      id: "ticket_" + Math.random().toString(36).substr(2, 9),
      number: ticketNumber,
      type: "U",
      status: "waiting",
      timestamp: Date.now(),
      phone: phone || undefined,
      schoolName: schoolName,
      orderedItems: items
    };

    tickets.push(newTicket);

    const countAhead = tickets.filter(
      t => t.type === "U" && t.status === "waiting" && t.id !== newTicket.id
    ).length;

    // Create a new notification for store staffs
    const newNotif: AdminNotification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      type: "new_order",
      message: "新校服订单 & 自动配货排号",
      detail: `【${schoolName}】顾客下单并分配排号 【${ticketNumber}】。购买了: ${items.map(it => `${it.name}(${it.size}码)*${it.quantity}`).join(", ")}`,
      timestamp: Date.now(),
      read: false
    };
    adminNotifications.push(newNotif);

    res.json({
      success: true,
      ticket: newTicket,
      position: countAhead + 1,
      ahead: countAhead,
      estimatedWaitMinutes: Math.max(3, countAhead * 6)
    });
  });

  // 5. Admin API: Call next ticket (叫号)
  app.post("/api/queue/call-next", (req, res) => {
    const { type } = req.body;
    if (!type || !["U", "A", "C"].includes(type)) {
      return res.status(400).json({ success: false, error: "无效的叫号服务类型" });
    }

    // Complete any currently called ticket for this category
    tickets = tickets.map(t => {
      if (t.type === type && t.status === "called") {
        return { ...t, status: "completed" };
      }
      return t;
    });

    // Find next waiting
    const nextWaiting = tickets.find(t => t.type === type && t.status === "waiting");
    if (!nextWaiting) {
      return res.json({ success: true, message: `当前队列暂无等候的顾客`, calledTicket: null });
    }

    nextWaiting.status = "called";
    nextWaiting.timestamp = Date.now();

    // Create manager smart voice alert / wearable notif
    const newNotif: AdminNotification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      type: "queue_alert",
      message: "校服服务呼叫通知",
      detail: `正呼叫服务号码 【${nextWaiting.number}】${nextWaiting.schoolName ? ` (所属学校: ${nextWaiting.schoolName})` : ""}`,
      timestamp: Date.now(),
      read: false
    };
    adminNotifications.push(newNotif);

    res.json({
      success: true,
      calledTicket: nextWaiting
    });
  });

  // 6. Admin API: Skip (过号)
  app.post("/api/queue/skip", (req, res) => {
    const { ticketId } = req.body;
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return res.status(404).json({ success: false, error: "号码不存在" });

    ticket.status = "skipped";
    res.json({ success: true, ticket });
  });

  // 7. Admin: Complete (服务完成)
  app.post("/api/queue/complete", (req, res) => {
    const { ticketId } = req.body;
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return res.status(404).json({ success: false, error: "号码不存在" });

    ticket.status = "completed";
    res.json({ success: true, ticket });
  });

  // 8. Get school uniforms list
  app.get("/api/menu", (req, res) => {
    res.json({ success: true, menuItems });
  });

  // 9. Customer: Out-of-stock registration (缺货登记)
  app.post("/api/out-of-stock/register", (req, res) => {
    const { itemId, phoneNumber, quantity, size, schoolName } = req.body;
    if (!itemId || !phoneNumber || !quantity || !size) {
      return res.status(400).json({ success: false, error: "登记信息填写不完整" });
    }

    const item = menuItems.find(i => i.id === Number(itemId));
    if (!item) return res.status(404).json({ success: false, error: "校服款式不存在" });

    const newRegistration: OutOfStockRegistration = {
      id: "reg_" + Math.random().toString(36).substr(2, 9),
      itemId: Number(itemId),
      itemName: item.name,
      schoolName: schoolName || item.schoolName,
      phoneNumber,
      quantity: Number(quantity),
      timestamp: Date.now(),
      status: "pending",
      size
    };

    outOfStockRegistrations.push(newRegistration);

    // Push notification to store admin immediately
    const newNotif: AdminNotification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      type: "out_of_stock",
      message: "顾客提交缺货补货登记",
      detail: `【${newRegistration.schoolName}】顾客 ${phoneNumber} 登记了 ${quantity} 件 【${item.name} - ${size}码】，请尽快联系调货！`,
      timestamp: Date.now(),
      read: false
    };
    adminNotifications.push(newNotif);

    res.json({
      success: true,
      registration: newRegistration
    });
  });

  // 10. Admin API: Get all registrations
  app.get("/api/out-of-stock", (req, res) => {
    res.json({ success: true, registrations: outOfStockRegistrations });
  });

  // 11. Admin API: Resolve out-of-stock registration (调拨到货)
  app.post("/api/out-of-stock/handle", (req, res) => {
    const { registrationId } = req.body;
    const reg = outOfStockRegistrations.find(r => r.id === registrationId);
    if (!reg) return res.status(404).json({ success: false, error: "该登记单不存在" });

    reg.status = "resolved";

    // Replenish the specific SKU stock
    const item = menuItems.find(i => i.id === reg.itemId);
    if (item) {
      const sku = item.skus.find(s => s.size === reg.size);
      if (sku) {
        sku.stock += reg.quantity;
      } else {
        item.skus.push({ size: reg.size, stock: reg.quantity });
      }
      updateItemStatus(item);
    }

    res.json({ success: true, registration: reg, menuItems });
  });

  // 12. Get admin alerts
  app.get("/api/admin/notifications", (req, res) => {
    res.json({ success: true, notifications: adminNotifications });
  });

  app.post("/api/admin/notifications/clear", (req, res) => {
    const { id } = req.body;
    if (id) {
      adminNotifications = adminNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    } else {
      adminNotifications = adminNotifications.map(n => ({ ...n, read: true }));
    }
    res.json({ success: true, notifications: adminNotifications });
  });

  // 13. Reset System (Re-seed with School Uniform data)
  app.post("/api/queue/reset", (req, res) => {
    tickets = [
      { 
        id: "t2", 
        number: "U002", 
        type: "U", 
        status: "called", 
        timestamp: Date.now() - 120000,
        schoolName: "西湖外国语学校",
        orderedItems: [{ id: 4, name: "贵族风制式双排扣礼服西装", size: "150", quantity: 2, price: 480 }]
      },
      { id: "t3", number: "A001", type: "A", status: "waiting", timestamp: Date.now() - 300000 },
      { id: "t4", number: "C001", type: "C", status: "waiting", timestamp: Date.now() - 150000 },
      { id: "t5", number: "U003", type: "U", status: "waiting", timestamp: Date.now() - 80000, schoolName: "浙江实验小学" }
    ];
    nextSerialNumbers = { U: 4, A: 2, C: 2 };
    outOfStockRegistrations = [];
    adminNotifications = [];
    
    // Re-seed original uniform inventory & SKUs
    menuItems = [
      {
        id: 1,
        name: "初中部夏季英伦风短袖衬衫",
        status: "low_stock",
        category: "夏季校服",
        price: 120,
        schoolId: "hz1",
        schoolName: "杭州市第一中学",
        skus: [
          { size: "140", stock: 3 },
          { size: "150", stock: 12 },
          { size: "160", stock: 0 },
          { size: "170", stock: 8 },
          { size: "180", stock: 1 }
        ]
      },
      {
        id: 2,
        name: "高中部秋季高级防风运动外套",
        status: "in_stock",
        category: "秋季校服",
        price: 260,
        schoolId: "hz1",
        schoolName: "杭州市第一中学",
        skus: [
          { size: "150", stock: 0 },
          { size: "160", stock: 15 },
          { size: "170", stock: 24 },
          { size: "180", stock: 0 },
          { size: "190", stock: 2 }
        ]
      },
      {
        id: 3,
        name: "初/高中男女通用运动长裤",
        status: "in_stock",
        category: "运动系列",
        price: 110,
        schoolId: "hz1",
        schoolName: "杭州市第一中学",
        skus: [
          { size: "140", stock: 11 },
          { size: "150", stock: 0 },
          { size: "160", stock: 9 },
          { size: "170", stock: 14 },
          { size: "180", stock: 0 }
        ]
      },
      {
        id: 4,
        name: "贵族风制式双排扣礼服西装",
        status: "in_stock",
        category: "制式礼服",
        price: 480,
        schoolId: "xhfl",
        schoolName: "西湖外国语学校",
        skus: [
          { size: "130", stock: 2 },
          { size: "140", stock: 0 },
          { size: "150", stock: 5 },
          { size: "160", stock: 0 },
          { size: "170", stock: 4 }
        ]
      },
      {
        id: 5,
        name: "纯棉针织V领学院风毛背心",
        status: "in_stock",
        category: "常服系列",
        price: 150,
        schoolId: "xhfl",
        schoolName: "西湖外国语学校",
        skus: [
          { size: "130", stock: 8 },
          { size: "140", stock: 12 },
          { size: "150", stock: 0 },
          { size: "160", stock: 14 }
        ]
      },
      {
        id: 6,
        name: "小学生防泼水连帽冲锋衣",
        status: "low_stock",
        category: "户外校服",
        price: 199,
        schoolId: "zjes",
        schoolName: "浙江实验小学",
        skus: [
          { size: "110", stock: 1 },
          { size: "120", stock: 0 },
          { size: "130", stock: 18 },
          { size: "140", stock: 0 },
          { size: "150", stock: 5 }
        ]
      },
      {
        id: 7,
        name: "百搭松紧带全棉舒适短裤",
        status: "in_stock",
        category: "夏季校服",
        price: 75,
        schoolId: "zjes",
        schoolName: "浙江实验小学",
        skus: [
          { size: "110", stock: 14 },
          { size: "120", stock: 9 },
          { size: "130", stock: 0 },
          { size: "140", stock: 3 }
        ]
      }
    ];

    menuItems.forEach(updateItemStatus);

    res.json({ success: true, message: "系统数据已重置为校服尊享排队与缺货模式。" });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`School Uniform Store server running on port ${PORT}`);
  });
}

startServer();
