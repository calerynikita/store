import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  RefreshCw, 
  Sparkles,
  Award,
  ShoppingBag,
  Bell,
  GraduationCap,
  Layers
} from "lucide-react";
import CustomerMiniProgram from "./components/CustomerMiniProgram";
import { QueueStatus, MenuItem, OutOfStockRegistration, AdminNotification } from "./types";

export default function App() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [registrations, setRegistrations] = useState<OutOfStockRegistration[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [systemLoading, setSystemLoading] = useState(false);

  // Sync state from server
  const fetchAllData = async () => {
    try {
      const [queueRes, menuRes, regRes, notifRes] = await Promise.all([
        fetch("/api/queue"),
        fetch("/api/menu"),
        fetch("/api/out-of-stock"),
        fetch("/api/admin/notifications")
      ]);

      const [queueData, menuData, regData, notifData] = await Promise.all([
        queueRes.json(),
        menuRes.json(),
        regRes.json(),
        notifRes.json()
      ]);

      if (queueData.success) setQueueStatus(queueData);
      if (menuData.success) setMenuItems(menuData.menuItems);
      if (regData.success) setRegistrations(regData.registrations);
      if (notifData.success) setNotifications(notifData.notifications);
    } catch (err) {
      console.error("Error fetching state from full-stack server", err);
    }
  };

  // Poll server state to achieve real-time responsiveness
  useEffect(() => {
    fetchAllData();
    const timer = setInterval(fetchAllData, 1500);
    return () => clearInterval(timer);
  }, []);

  // Admin: Call Next Number (Uniform pickup U, Exchange/Alteration A, Cashier C)
  const handleCallNext = async (type: "U" | "A" | "C") => {
    try {
      const res = await fetch("/api/queue/call-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      } else {
        alert(data.error || "叫号出错");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin: Skip Ticket
  const handleSkipTicket = async (ticketId: string) => {
    try {
      const res = await fetch("/api/queue/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin: Complete Ticket (served)
  const handleCompleteTicket = async (ticketId: string) => {
    try {
      const res = await fetch("/api/queue/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Customer: Register out-of-stock
  const handleRegisterOutOfStock = async (itemId: number, phone: string, quantity: number, size: string, schoolName?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/out-of-stock/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, phoneNumber: phone, quantity, size, schoolName }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        return true;
      } else {
        alert(data.error || "登记失败");
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("网络错误，登记失败");
      return false;
    }
  };

  // Customer: Normal Order Creation (自动生成领取排队U号)
  const handleOrderCreate = async (schoolName: string, phone: string, items: any[]): Promise<any> => {
    try {
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName, phone, items }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        return data;
      } else {
        alert(data.error || "下单失败");
        return null;
      }
    } catch (err) {
      console.error(err);
      alert("网络连接故障，请检查您的网络设置");
      return null;
    }
  };

  // Admin: Handle out of stock registration (mark arrived/resolved)
  const handleResolveOutOfStock = async (registrationId: string) => {
    try {
      const res = await fetch("/api/out-of-stock/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin: Clear/read notifications
  const handleClearNotification = async (id?: string) => {
    try {
      const res = await fetch("/api/admin/notifications/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin: Reset entire system
  const handleResetSystem = async () => {
    if (!confirm("确定要初始化阳光校服排队及缺货登记系统吗？这会恢复默认库存及初始叫号队列。")) return;
    setSystemLoading(true);
    try {
      const res = await fetch("/api/queue/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("my_boutique_ticket_id");
        localStorage.removeItem("selected_school");
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSystemLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050915] flex flex-col items-center justify-between p-4 md:p-8 font-sans antialiased text-slate-300 selection:bg-blue-500/30">
      
      {/* Elegantly styled branding section with deep blue accent colors */}
      <header className="w-full max-w-5xl mx-auto mb-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-blue-950/40 pb-5 shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-950 to-indigo-900 rounded-2xl flex items-center justify-center text-white border border-blue-800/30 shadow-md">
            <GraduationCap size={20} className="text-blue-300" />
          </div>
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <h1 className="text-xl font-black text-slate-100 tracking-wider">SUNSHINE UNIFORMS</h1>
              <span className="bg-blue-500/15 text-blue-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/20 tracking-widest uppercase">
                阳光智能校服系统
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              合作中小学专供校服订购系统 • 微信小程序模拟（扫码选校 • 自助选尺码下单 • 缺货实时登记推送 • 智能排号领取）
            </p>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-900/60 border border-blue-950 px-3.5 py-1.5 rounded-full text-[10px] flex items-center space-x-2 text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
            </span>
            <span className="font-extrabold tracking-wider text-slate-300 uppercase">物联网云端同步中</span>
          </div>
        </div>
      </header>

      {/* Main Single-View - Customer Mini Program + Admin IoT notification simulator */}
      <main className="w-full flex-1 flex items-center justify-center py-2">
        <CustomerMiniProgram
          queueStatus={queueStatus}
          onRefreshQueue={fetchAllData}
          onRegisterOutOfStock={handleRegisterOutOfStock}
          onOrderCreate={handleOrderCreate}
          menuItems={menuItems}
          onRefreshMenu={fetchAllData}
          registrations={registrations}
          notifications={notifications}
          onCallNext={handleCallNext}
          onSkipTicket={handleSkipTicket}
          onCompleteTicket={handleCompleteTicket}
          onHandleOutOfStock={handleResolveOutOfStock}
          onClearNotification={handleClearNotification}
          onResetSystem={handleResetSystem}
        />
      </main>

      {/* Footer styled for School Uniform service */}
      <footer className="w-full text-center py-6 text-[10px] text-slate-500 border-t border-blue-950/40 mt-8 max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="flex items-center space-x-1 justify-center">
          <Award size={10} className="text-blue-400" />
          <span>© 2026 SUNSHINE UNIFORMS • 阳光学园智能服装门店管理中心. All Rights Reserved.</span>
        </p>
        <p className="font-mono bg-[#030712] px-3 py-1 rounded-full border border-blue-950/40">
          Smart Queue Engine v2.1 • Zero Admin Overhead
        </p>
      </footer>

      {/* Database reset loading panel */}
      {systemLoading && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
          <RefreshCw size={36} className="text-blue-500 animate-spin mb-4" />
          <p className="text-xs text-slate-400 font-extrabold tracking-wider">正在初始化阳光校服排队及库存数据库...</p>
        </div>
      )}
    </div>
  );
}
