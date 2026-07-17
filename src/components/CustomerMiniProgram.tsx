import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  QrCode, 
  Users, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle, 
  Phone, 
  ShoppingBag, 
  Volume2, 
  Smartphone,
  ChevronLeft,
  Scissors,
  Bookmark,
  Sparkles,
  Award,
  Bell,
  Sliders,
  Check,
  Package,
  X,
  CreditCard,
  ShoppingCart,
  MapPin,
  GraduationCap,
  Store,
  ChevronDown,
  Search,
  Filter
} from "lucide-react";
import { Ticket, MenuItem, QueueStatus, OutOfStockRegistration, AdminNotification } from "../types";

interface CustomerMiniProgramProps {
  queueStatus: QueueStatus | null;
  onRefreshQueue: () => void;
  onRegisterOutOfStock: (itemId: number, phone: string, quantity: number, size: string, schoolName?: string) => Promise<boolean>;
  onOrderCreate: (schoolName: string, phone: string, items: { id: number; name: string; size: string; quantity: number; price: number }[]) => Promise<any>;
  menuItems: MenuItem[];
  onRefreshMenu: () => void;
  // Simulation methods integrated directly
  registrations: OutOfStockRegistration[];
  notifications: AdminNotification[];
  onCallNext: (type: "U" | "A" | "C") => void;
  onSkipTicket: (ticketId: string) => void;
  onCompleteTicket: (ticketId: string) => void;
  onHandleOutOfStock: (registrationId: string) => void;
  onClearNotification: (id?: string) => void;
  onResetSystem: () => void;
}

const ALL_SCHOOLS = [
  { id: "hz1", name: "杭州市第一中学", alphabet: "H", level: "初中/高中", district: "拱墅区", desc: "初中部 / 高中部", addr: "拱墅区中山北路校区" },
  { id: "xhfl", name: "西湖外国语学校", alphabet: "X", level: "初中/高中", district: "西湖区", desc: "国际部 / 双语部", addr: "西湖区文二西路校区" },
  { id: "zjes", name: "浙江实验小学", alphabet: "Z", level: "小学", district: "上城区", desc: "一至六年级", addr: "上城区延安路校区" },
  { id: "ahxx", name: "安吉路实验学校", alphabet: "A", level: "小学", district: "下城区", desc: "九年一贯制示范校", addr: "安吉路2号" },
  { id: "bcts", name: "保俶塔实验学校", alphabet: "B", level: "小学", district: "西湖区", desc: "九年制公办名校", addr: "天目山路81号" },
  { id: "bjsy", name: "滨江实验小学", alphabet: "B", level: "小学", district: "滨江区", desc: "重点公办小学", addr: "建业路" },
  { id: "cwxx", name: "崇文实验学校", alphabet: "C", level: "小学", district: "上城区", desc: "民办精品示范小学", addr: "近江路" },
  { id: "che2", name: "采荷第二小学", alphabet: "C", level: "小学", district: "江干区", desc: "传统教育名校", addr: "采荷路" },
  { id: "dgxx", name: "大关小学", alphabet: "D", level: "小学", district: "拱墅区", desc: "艺术特色学校", addr: "莫干山路" },
  { id: "gysy", name: "行知小学", alphabet: "G", level: "小学", district: "西湖区", desc: "行知教育实践基地", addr: "学院路" },
  { id: "hz2", name: "杭州市第二中学", alphabet: "H", level: "高中", district: "滨江区", desc: "百年省一级重点", addr: "东信大道" },
  { id: "xjzx", name: "杭州学军中学", alphabet: "H", level: "高中", district: "西湖区", desc: "省一级重点高中", addr: "文三路" },
  { id: "hz14", name: "杭州第十四中学", alphabet: "H", level: "高中", district: "下城区", desc: "重点省示范高中", addr: "凤起路" },
  { id: "hzgz", name: "杭州高级中学", alphabet: "H", level: "高中", district: "下城区", desc: "历史百年名校", addr: "贡院前" },
  { id: "hwzx", name: "杭州外国语学校", alphabet: "H", level: "初中/高中", district: "西湖区", desc: "教育部认定的外国语学校", addr: "小和山" },
  { id: "jlzx", name: "建兰中学", alphabet: "J", level: "初中", district: "上城区", desc: "民办初中第一梯队", addr: "抚宁巷" },
  { id: "jnsy", name: "江南实验学校", alphabet: "J", level: "小学/初中", district: "滨江区", desc: "九年一贯制特色学校", addr: "滨和路" },
  { id: "lcyh", name: "绿城育华学校", alphabet: "L", level: "小学/初中/高中", district: "西湖区", desc: "高品质双语寄宿学校", addr: "文一西路" },
  { id: "qjwg", name: "钱江外国语学校", alphabet: "Q", level: "小学/初中", district: "上城区", desc: "新型国际化公办学校", addr: "钱江新城" },
  { id: "tsxx", name: "天水小学", alphabet: "T", level: "小学", district: "下城区", desc: "美育特色公办小学", addr: "天水巷" },
  { id: "wlzx", name: "文澜中学", alphabet: "W", level: "初中", district: "拱墅区", desc: "著名省示范初中", addr: "通运路" },
  { id: "xhxx", name: "西湖小学", alphabet: "X", level: "小学", district: "西湖区", desc: "传统西湖公办名校", addr: "曙光路" },
  { id: "xzxx", name: "星洲小学", alphabet: "X", level: "小学", district: "西湖区", desc: "求是教育集团示范校", addr: "古墩路" },
  { id: "ycwg", name: "育才外国语学校", alphabet: "Y", level: "小学", district: "西湖区", desc: "双语民办精品小学", addr: "文二路" }
];

const POPULAR_SCHOOLS = ["hz1", "xhfl", "zjes", "xjzx"];

export default function CustomerMiniProgram({
  queueStatus,
  onRefreshQueue,
  onRegisterOutOfStock,
  onOrderCreate,
  menuItems,
  onRefreshMenu,
  registrations,
  notifications,
  onCallNext,
  onSkipTicket,
  onCompleteTicket,
  onHandleOutOfStock,
  onClearNotification,
  onResetSystem
}: CustomerMiniProgramProps) {
  // Persistence state
  const [selectedSchool, setSelectedSchool] = useState<string | null>(() => {
    return localStorage.getItem("selected_school");
  });
  
  // School search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlphabet, setSelectedAlphabet] = useState<string>("全部");
  const [selectedLevel, setSelectedLevel] = useState<string>("全部");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("全部");

  const [activeTab, setActiveTab] = useState<"catalog" | "queue">(() => {
    return localStorage.getItem("my_boutique_ticket_id") ? "queue" : "catalog";
  });
  const [myTicketId, setMyTicketId] = useState<string | null>(() => {
    return localStorage.getItem("my_boutique_ticket_id");
  });
  const [myTicketDetail, setMyTicketDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Scan simulation feedback toast
  const [scanToast, setScanToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Big Screen TV Clock, Audio Speech Synthesis, and Auto Calling states
  const [currentTime, setCurrentTime] = useState("");
  const [autoCallMode, setAutoCallMode] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const speakCall = (num: string, type: "U" | "A" | "C") => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // cancel any active speech first
      const typeName = type === "U" ? "校服发配处" : type === "A" ? "试衣改衣台" : "现场收银台";
      const text = `请 ${num.split("").join(" ")} 号顾客，前往 ${typeName} 办理业务。`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS Speech error:", e);
    }
  };

  // Watch currentCalled and auto speech broadcast
  const prevCalledRef = React.useRef<{ U: string; A: string; C: string } | null>(null);
  useEffect(() => {
    if (!queueStatus) return;
    const prev = prevCalledRef.current;
    if (prev) {
      if (queueStatus.currentCalled.U && queueStatus.currentCalled.U !== prev.U) {
        speakCall(queueStatus.currentCalled.U, "U");
      } else if (queueStatus.currentCalled.A && queueStatus.currentCalled.A !== prev.A) {
        speakCall(queueStatus.currentCalled.A, "A");
      } else if (queueStatus.currentCalled.C && queueStatus.currentCalled.C !== prev.C) {
        speakCall(queueStatus.currentCalled.C, "C");
      }
    }
    prevCalledRef.current = { ...queueStatus.currentCalled };
  }, [queueStatus?.currentCalled]);

  // Auto progression calling simulator
  useEffect(() => {
    if (!autoCallMode || !queueStatus) return;
    const interval = setInterval(() => {
      const types: ("U" | "A" | "C")[] = ["U", "A", "C"];
      for (const t of types) {
        if ((queueStatus.waitingCount[t] || 0) > 0) {
          onCallNext(t);
          break;
        }
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [autoCallMode, queueStatus, onCallNext]);

  useEffect(() => {
    if (scanToast) {
      const timer = setTimeout(() => setScanToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [scanToast]);

  const handleSimulateScan = (mode: "first" | "school_only" | "with_ticket") => {
    if (mode === "first") {
      localStorage.removeItem("selected_school");
      localStorage.removeItem("my_boutique_ticket_id");
      setSelectedSchool(null);
      setMyTicketId(null);
      setCart([]);
      setSearchQuery("");
      setActiveTab("catalog");
      setScanToast({
        message: "📸 扫码成功：检测到首次到店，已为您加载中山北路智能体验馆。请输入学校进行筛选！",
        type: "success"
      });
    } else if (mode === "school_only") {
      localStorage.setItem("selected_school", "zjes");
      localStorage.removeItem("my_boutique_ticket_id");
      setSelectedSchool("zjes");
      setMyTicketId(null);
      setActiveTab("catalog");
      setScanToast({
        message: "📸 再次扫码成功：检测到您已选择“浙江实验小学”，已自动跳过搜索，直接进入该校专柜！",
        type: "info"
      });
    } else if (mode === "with_ticket") {
      let ticketIdToUse = myTicketId;
      if (!ticketIdToUse) {
        ticketIdToUse = "mock-ticket-id-123";
        localStorage.setItem("my_boutique_ticket_id", ticketIdToUse);
        setMyTicketId(ticketIdToUse);
      }
      if (!selectedSchool) {
        setSelectedSchool("zjes");
        localStorage.setItem("selected_school", "zjes");
      }
      setActiveTab("queue");
      setScanToast({
        message: "📸 再次扫码成功：检测到您已有正在等候的号码！已智能秒开排队进度卡片，让您免选校直接查看进度！",
        type: "warning"
      });
    }
  };
  
  // Cart state
  const [cart, setCart] = useState<{ product: MenuItem; size: string; quantity: number }[]>([]);

  // SKU Modal state
  const [showSkuModal, setShowSkuModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [skuQuantity, setSkuQuantity] = useState(1);
  const [isOutOfStockMode, setIsOutOfStockMode] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Normal Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [newTicketNumber, setNewTicketNumber] = useState("");

  // Manual pull number ticket (for Alteration or Cashier directly)
  const [showManualTicketModal, setShowManualTicketModal] = useState(false);
  const [manualTicketType, setManualTicketType] = useState<"A" | "C">("A");
  const [manualPhone, setManualPhone] = useState("");

  // Demo controller toggles
  const [showSimPanel, setShowSimPanel] = useState(true);

  // Poll active ticket progress
  useEffect(() => {
    if (!myTicketId) return;

    const fetchMyTicket = async () => {
      try {
        const res = await fetch(`/api/queue/ticket/${myTicketId}`);
        const data = await res.json();
        if (data.success) {
          setMyTicketDetail(data);
          // If called, play simulated speech sound
          if (data.ticket.status === "called") {
            // Can show a web audio synth effect if wanted
          }
        } else {
          // ticket expired
          setMyTicketId(null);
          setMyTicketDetail(null);
          localStorage.removeItem("my_boutique_ticket_id");
        }
      } catch (err) {
        console.error("Error fetching ticket progress", err);
      }
    };

    fetchMyTicket();
    const timer = setInterval(fetchMyTicket, 2000);
    return () => clearInterval(timer);
  }, [myTicketId]);

  // School name lookup helper
  const getSchoolNameById = (id: string | null) => {
    if (!id) return "未选择学校";
    return ALL_SCHOOLS.find(s => s.id === id)?.name || id;
  };

  // Switch school handler
  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchool(schoolId);
    localStorage.setItem("selected_school", schoolId);
    setCart([]); // Clear cart when switching school to prevent mixed orders
    // Reset filters
    setSearchQuery("");
    setSelectedAlphabet("全部");
    setSelectedLevel("全部");
    setSelectedDistrict("全部");
  };

  const handleClearSchool = () => {
    setSelectedSchool(null);
    localStorage.removeItem("selected_school");
    setCart([]);
    // Reset filters
    setSearchQuery("");
    setSelectedAlphabet("全部");
    setSelectedLevel("全部");
    setSelectedDistrict("全部");
  };

  // SKU selection handler
  const openSkuModal = (product: MenuItem) => {
    setSelectedProduct(product);
    // Auto-select first size with stock, or default first size
    const availableSku = product.skus.find(s => s.stock > 0);
    setSelectedSize(availableSku ? availableSku.size : product.skus[0]?.size || "150");
    setSkuQuantity(1);
    setIsOutOfStockMode(false);
    setRegPhone("");
    setRegSuccess(false);
    setShowSkuModal(true);
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize) return;
    
    // Check if item already exists in cart with same size
    const existingIndex = cart.findIndex(
      item => item.product.id === selectedProduct.id && item.size === selectedSize
    );

    const skuInfo = selectedProduct.skus.find(s => s.size === selectedSize);
    const maxStock = skuInfo ? skuInfo.stock : 0;

    let newQuantity = skuQuantity;
    if (existingIndex !== -1) {
      newQuantity += cart[existingIndex].quantity;
    }

    if (newQuantity > maxStock) {
      alert(`抱歉，该尺码库存不足！目前该门店最大剩余：${maxStock}件`);
      return;
    }

    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQuantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product: selectedProduct, size: selectedSize, quantity: skuQuantity }]);
    }

    setShowSkuModal(false);
  };

  // Submit out of stock registration from modal
  const handleRegisterOutOfStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedSize || !regPhone) return;
    if (!/^\d{11}$/.test(regPhone)) {
      alert("请输入有效的11位手机号码，以便到货后第一时间通知您！");
      return;
    }

    setLoading(true);
    const schoolName = getSchoolNameById(selectedSchool);
    const success = await onRegisterOutOfStock(selectedProduct.id, regPhone, skuQuantity, selectedSize, schoolName);
    setLoading(false);

    if (success) {
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setShowSkuModal(false);
      }, 2000);
    }
  };

  // Submit normal order and get a queue ticket
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    const schoolName = getSchoolNameById(selectedSchool);
    const orderItems = cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price
    }));

    const result = await onOrderCreate(schoolName, "", orderItems);
    setLoading(false);

    if (result && result.success) {
      // Order placed and ticket issued!
      setMyTicketId(result.ticket.id);
      localStorage.setItem("my_boutique_ticket_id", result.ticket.id);
      setNewTicketNumber(result.ticket.number);
      setOrderSuccess(true);
      setCart([]); // Clear cart
      
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckoutModal(false);
        setActiveTab("queue"); // Direct to queue progression screen
      }, 3000);
    }
  };

  // Manual draw alteration or cashier queue ticket
  const handleManualTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch("/api/queue/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: manualTicketType,
          phone: "",
          schoolName: getSchoolNameById(selectedSchool)
        })
      });
      const data = await res.json();
      if (data.success) {
        setMyTicketId(data.ticket.id);
        localStorage.setItem("my_boutique_ticket_id", data.ticket.id);
        setShowManualTicketModal(false);
        setManualPhone("");
        onRefreshQueue();
        setActiveTab("queue");
      } else {
        alert(data.error || "取号失败");
      }
    } catch (err) {
      console.error(err);
      alert("服务器连接错误");
    } finally {
      setLoading(false);
    }
  };

  // Quit/Cancel active queue ticket
  const handleCancelTicket = () => {
    if (confirm("确定要放弃您当前的排队号码吗？如果已经完成付款，请咨询柜台老师。")) {
      localStorage.removeItem("my_boutique_ticket_id");
      setMyTicketId(null);
      setMyTicketDetail(null);
      onRefreshQueue();
    }
  };

  // Resolve queue type names
  const getQueueName = (type: "U" | "A" | "C") => {
    switch(type) {
      case "U": return "校服领取与试穿 (Pickup/Try-on)";
      case "A": return "尺码修改与调换 (Alteration/Exchange)";
      case "C": return "收银结算与开单 (Cashier/Invoice)";
    }
  };

  const getQueueIcon = (type: "U" | "A" | "C", sizeClass = "w-4 h-4") => {
    switch(type) {
      case "U": return <ShoppingBag className={sizeClass} />;
      case "A": return <Scissors className={sizeClass} />;
      case "C": return <CreditCard className={sizeClass} />;
    }
  };

  // Filter items based on chosen school and categorise
  const getFilteredItems = () => {
    if (!selectedSchool) return [];
    
    // Check if we have items for this specific school
    const directItems = menuItems.filter(item => item.schoolId === selectedSchool);
    if (directItems.length > 0) return directItems;

    // Fallback logic if there are no direct items: map generic items based on school level
    const currentSchoolObj = ALL_SCHOOLS.find(s => s.id === selectedSchool);
    const isPrimary = currentSchoolObj?.level.includes("小学") || false;
    
    // Fallback template items: if primary, use zjes, otherwise use hz1
    const templateSchoolId = isPrimary ? "zjes" : "hz1";
    const templates = menuItems.filter(item => item.schoolId === templateSchoolId);
    
    // Clone and map to current school
    return templates.map(item => ({
      ...item,
      schoolId: selectedSchool,
      schoolName: currentSchoolObj?.name || item.schoolName
    }));
  };

  const filteredItems = getFilteredItems();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start justify-center w-full max-w-6xl mx-auto px-4 py-2">
      
      {/* ========================================================== */}
      {/* LEFT: School Uniform Micro-Program Device Simulator (Deep Blue Theme) */}
      {/* ========================================================== */}
      <div className="relative shrink-0 mx-auto">
        
        {/* Soft glowing ambient backing */}
        <div className="absolute inset-8 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        {/* WeChat Simulator Outer shell - Classic School Uniform Navy Styling */}
        <div className="w-[385px] h-[795px] bg-[#0c1122] border-[10px] border-[#1e2945] rounded-[48px] overflow-hidden shadow-[0_30px_70px_-10px_rgba(3,7,18,0.95)] relative flex flex-col select-none border-double">
          
          {/* A. Top status Bar / Notch */}
          <div className="bg-[#070b16] text-slate-400 h-11 px-6 flex justify-between items-center text-xs font-semibold relative shrink-0">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-[#070b16] w-36 h-5 rounded-b-2xl flex items-center justify-center border-b border-slate-900">
              <span className="w-2 h-2 bg-slate-900 rounded-full border border-slate-800"></span>
            </div>
            <div>19:51</div>
            <div className="flex items-center space-x-1.5 text-slate-500">
              <span className="text-[9px] font-mono">5G</span>
              <div className="w-5 h-2.5 border border-slate-700 rounded-xs p-[1px] flex items-center">
                <div className="w-full h-full bg-slate-400 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* B. WeChat Header bar with Deep Blue School Uniform Logo / Title */}
          <div className="bg-[#0b1226] border-b border-blue-950 text-slate-100 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              {/* Premium Deep Blue Shield Logo Crest Design */}
              <div className="w-6 h-6 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-lg flex items-center justify-center shadow-lg border border-blue-700/40 relative">
                <div className="absolute inset-0 rounded-lg bg-blue-500/10 animate-pulse"></div>
                <GraduationCap size={13} className="text-blue-300 relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[11px] tracking-wider font-sans text-white leading-none">
                  阳光校服智能排号
                </span>
                <span className="text-[7.5px] text-blue-400 font-mono tracking-widest leading-none mt-0.5 uppercase">
                  Sunny Deep-Blue
                </span>
              </div>
            </div>
            
            {/* WeChat Capsule UI with Scan Simulation */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => {
                  if (myTicketId) {
                    handleSimulateScan("with_ticket");
                  } else if (selectedSchool) {
                    handleSimulateScan("school_only");
                  } else {
                    handleSimulateScan("first");
                  }
                }}
                className="bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/30 px-2 py-1.5 rounded-full text-[8px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer animate-pulse"
                title="模拟在门店中再次扫描货架上的二维码"
              >
                <QrCode size={10} className="text-blue-400" />
                <span>📷 模拟扫码</span>
              </button>

              <div className="bg-black/30 border border-slate-800 rounded-full px-2 py-1 flex items-center space-x-2.5 text-slate-400 scale-85">
                <div className="flex space-x-1">
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                </div>
                <div className="w-[1px] h-2.5 bg-slate-800"></div>
                <div className="w-3 h-3 border border-slate-400 rounded-full flex items-center justify-center relative">
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>

          {/* C. Scrollable Content Window */}
          <div className="flex-1 overflow-y-auto pb-20 bg-[#080c18] scrollbar-none relative">
            
            {/* Simulation Notification Toast Overlay */}
            <AnimatePresence>
              {scanToast && (
                <motion.div 
                  initial={{ opacity: 0, y: -40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute top-3 left-3 right-3 z-40 bg-[#0b132c]/95 border border-blue-500/40 rounded-xl p-3 shadow-xl shadow-black/80 flex items-start space-x-2.5 backdrop-blur-md"
                >
                  <div className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={11} className="animate-pulse" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-[9px] font-black text-blue-400 tracking-wider uppercase block">智能传感器扫码触发</span>
                    <p className="text-[10px] text-slate-200 font-semibold leading-relaxed mt-0.5">{scanToast.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedSchool ? (
              /* ==================== 1. SCHOOL SELECTION LANDING ==================== */
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-4 space-y-4 flex flex-col h-full relative"
              >
                {/* Active Ticket Banner Alert for Returning/Re-scanning Customers */}
                {myTicketId && myTicketDetail && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-950 border border-blue-500/40 p-3 rounded-xl flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Users size={15} />
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] text-blue-300 font-bold block leading-none">再次扫码智能识别：</span>
                        <p className="text-[11px] text-white font-extrabold mt-1">您有正在等候的号码 <span className="text-blue-400 font-mono text-xs">{myTicketDetail.ticket.number}</span></p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (myTicketDetail.ticket.schoolName) {
                          const sObj = ALL_SCHOOLS.find(s => s.name === myTicketDetail.ticket.schoolName);
                          if (sObj) setSelectedSchool(sObj.id);
                        } else {
                          setSelectedSchool("zjes");
                        }
                        setActiveTab("queue");
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      秒开进度卡
                    </button>
                  </motion.div>
                )}

                {/* Store Information Card */}
                <div className="bg-gradient-to-br from-[#0c142c] to-[#080d1e] border border-blue-900/40 rounded-2xl p-4 space-y-3 shadow-md shadow-blue-950/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
                  
                  {/* Store Name and Live Status */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Store size={15} className="text-blue-400" />
                        <h3 className="text-[13px] font-black text-white tracking-wider">阳光校服·中山北路智能体验馆</h3>
                      </div>
                      <p className="text-[9.5px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10} className="text-slate-500 shrink-0" />
                        <span>拱墅区中山北路88号首层 (中山北路校区旁)</span>
                      </p>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black font-sans uppercase animate-pulse shrink-0">
                      营业中
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-blue-950/50"></div>

                  {/* Opening hours, Phone & Capacity */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[9.5px] text-slate-300 font-medium">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Clock size={11} className="text-blue-500 shrink-0" />
                      <span>营业时间：09:00 - 21:00</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Phone size={11} className="text-blue-500 shrink-0" />
                      <span>咨询电话：0571-88888888</span>
                    </div>
                    <div className="col-span-2 text-[9.5px] bg-[#050914] text-slate-400 p-2 rounded-lg border border-blue-950/25 flex items-start space-x-1.5 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></div>
                      <span>
                        <strong className="text-blue-300">选校指南：</strong>到店家长请先在下方搜索并绑定孩子就读的学校，即可自动调取该校的现货校服并进行快捷排号领取。
                      </span>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search size={13} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入学校全称、城区地名或首字母搜索..."
                    className="w-full bg-[#090e1c] border border-blue-900/40 rounded-xl py-2 pl-8.5 pr-8 text-[11px] font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white text-xs cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Index Rail Container & Main List */}
                <div className="flex flex-col relative flex-1 min-h-[280px]">
                  
                  {/* Schools list area */}
                  <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9.5px] font-black tracking-widest text-blue-400/85 uppercase">
                        合作中小学校 ({
                          ALL_SCHOOLS.filter(school => {
                            const query = searchQuery.trim().toLowerCase();
                            return query === "" || 
                              school.name.toLowerCase().includes(query) || 
                              school.addr.toLowerCase().includes(query) ||
                              school.desc.toLowerCase().includes(query) ||
                              school.alphabet.toLowerCase().includes(query);
                          }).length
                        } / 24 所)
                      </span>
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="text-[8.5px] text-blue-400 hover:underline font-extrabold"
                        >
                          重置搜索
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {(() => {
                        const filtered = ALL_SCHOOLS.filter(school => {
                          const query = searchQuery.trim().toLowerCase();
                          return query === "" || 
                            school.name.toLowerCase().includes(query) || 
                            school.addr.toLowerCase().includes(query) ||
                            school.desc.toLowerCase().includes(query) ||
                            school.alphabet.toLowerCase().includes(query);
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-10 text-[10px] text-slate-500 italic bg-[#090e1c]/30 rounded-xl border border-blue-950/20">
                              没有找到符合条件的学校，请换个词搜索
                            </div>
                          );
                        }

                        return filtered.map((school) => (
                          <motion.button
                            key={school.id}
                            onClick={() => handleSelectSchool(school.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full bg-[#0a0e1b] border border-blue-900/30 hover:border-blue-500/40 rounded-xl p-2.5 text-left flex items-center justify-between shadow-sm transition-all group cursor-pointer"
                          >
                            <div className="space-y-0.5 max-w-[85%]">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] bg-blue-950 text-blue-300 font-black w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono shrink-0">
                                  {school.alphabet}
                                </span>
                                <h3 className="text-[11px] font-black text-slate-100 truncate">{school.name}</h3>
                              </div>
                              <p className="text-[9px] text-slate-400 pl-5 truncate">
                                {school.desc} | {school.addr}
                              </p>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-blue-950/80 border border-blue-900/40 flex items-center justify-center text-blue-400 shrink-0">
                              <ChevronRight size={10} />
                            </div>
                          </motion.button>
                        ));
                      })()}
                    </div>
                  </div>

                </div>

                {/* QR Code description */}
                <div className="bg-slate-950/80 border border-blue-950/40 rounded-xl p-2.5 flex items-start space-x-1.5 text-[9px] text-slate-400 leading-normal">
                  <QrCode size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-blue-300">入店扫码说明：</span>
                    顾客入店扫描货架上的校服专属二维码，可直接绑定该校校服。再次扫描该码系统将直接加载您已提交的订单排队窗口，无需重复搜索！
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ==================== 2. MAIN APPLICATION CONTENT (Tab 1: Shop, Tab 2: Queue) ==================== */
              <div className="p-4 space-y-4">
                
                {/* Active School Ribbon Header */}
                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-900/40 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-blue-900/30 border border-blue-800/40 rounded-lg text-blue-400">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-100">{getSchoolNameById(selectedSchool)}</h3>
                      <p className="text-[9px] text-slate-400">专供校服精品选购通道</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleClearSchool}
                    className="bg-blue-900/40 hover:bg-blue-800/40 text-blue-300 border border-blue-700/30 rounded-lg px-2.5 py-1 text-[9px] font-black transition-all cursor-pointer"
                  >
                    切换学校
                  </button>
                </div>

                {/* Navigation switch */}
                <div className="grid grid-cols-2 gap-1.5 bg-slate-900/50 border border-slate-800/80 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className={`py-2 text-[11px] font-extrabold rounded-lg transition-all ${
                      activeTab === "catalog" 
                        ? "bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md font-black" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    校服预订 (Catalog)
                  </button>
                  <button
                    onClick={() => setActiveTab("queue")}
                    className={`py-2 text-[11px] font-extrabold rounded-lg transition-all relative ${
                      activeTab === "queue" 
                        ? "bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md font-black" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>排队大屏 & 叫号</span>
                    {myTicketId && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                </div>

                {activeTab === "catalog" ? (
                  /* ==================== TAB: CATALOG (SCHOOL UNIFORM SPECIFIC) ==================== */
                  <div className="space-y-4">
                    
                    {/* Welcome school uniform notice */}
                    <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded-xl border border-slate-900">
                      💡 提示：本季提供【春秋季制服】及【夏季常服】的订购。如有货，正常下单后系统会自动为您分配<strong>【校服领取排队号码】</strong>，凭号到取件台领取试穿。若显示缺货，可进行缺货登记。
                    </div>

                    {/* Grouped by categories */}
                    {["夏季校服", "秋季校服", "制式礼服", "常服系列", "户外校服", "运动系列"].map(category => {
                      const items = filteredItems.filter(item => item.category === category);
                      if (items.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-[10px] font-extrabold text-blue-400 border-l-2 border-blue-500 pl-1.5 py-0.5 tracking-widest uppercase">
                            {category}
                          </h4>
                          <div className="space-y-2.5">
                            {items.map(item => {
                              const totalStock = item.skus.reduce((sum, s) => sum + s.stock, 0);
                              return (
                                <div 
                                  key={item.id} 
                                  className="bg-[#0e1428] border border-blue-950/60 rounded-xl p-3 shadow-inner flex flex-col justify-between gap-2.5 hover:border-blue-950 transition-all"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <span className="text-xs font-black text-slate-100 block">
                                        {item.name}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-extrabold text-blue-400">¥{item.price}</span>
                                        <span className="text-[9px] text-slate-400">
                                          ({item.skus.length}个尺码可选)
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Combined stock status badges */}
                                    {totalStock === 0 ? (
                                      <span className="text-[8px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded border border-red-900/30 font-extrabold">
                                        已售罄
                                      </span>
                                    ) : totalStock < 8 ? (
                                      <span className="text-[8px] bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded border border-amber-900/30 animate-pulse font-extrabold">
                                        余量紧张
                                      </span>
                                    ) : (
                                      <span className="text-[8px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/30 font-extrabold">
                                        现货充足
                                      </span>
                                    )}
                                  </div>

                                  {/* Action selectors */}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                                    <div className="text-[9px] text-slate-500">
                                      包含尺码：{item.skus.map(s => s.size).join(", ")}
                                    </div>
                                    <button
                                      onClick={() => openSkuModal(item)}
                                      className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold py-1 px-3 rounded-lg text-[10px] transition-all flex items-center space-x-0.5 shadow-md cursor-pointer"
                                    >
                                      <span>选规格下单</span>
                                      <ChevronRight size={10} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Floating shopping cart summary */}
                    {cart.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-blue-900/30 rounded-2xl p-3.5 flex items-center justify-between shadow-lg sticky bottom-2"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 bg-blue-950 border border-blue-800 rounded-xl flex items-center justify-center text-blue-400 relative">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                              {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-100 font-extrabold block">已选校服成衣</span>
                            <span className="text-[10px] text-blue-400 font-bold block">
                              总计 ¥{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCheckoutPhone("");
                            setShowCheckoutModal(true);
                          }}
                          className="bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-600 hover:to-emerald-700 text-white font-black py-1.5 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                        >
                          立即结算下单
                        </button>
                      </motion.div>
                    )}

                  </div>
                ) : (
                  /* ==================== TAB: QUEUE (叫号大屏 & 个人排号卡) ==================== */
                  <div className="space-y-4">
                    
                    {/* Active Queue Ticket (PERSISTED & POLLED REAL-TIME) */}
                    {myTicketId && myTicketDetail ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-[#0c132c] via-[#0f193a] to-[#0c132c] rounded-2xl p-5 border border-blue-500/30 shadow-md space-y-4 relative overflow-hidden"
                      >
                        {/* Live calling notice */}
                        {myTicketDetail.ticket.status === "called" && (
                          <div className="absolute right-0 top-0 bg-red-600 text-white text-[9px] px-3 py-1 rounded-bl-xl font-black flex items-center space-x-1.5 animate-pulse uppercase tracking-wider">
                            <Volume2 size={11} className="animate-bounce" />
                            <span>正在呼叫 请前往柜台</span>
                          </div>
                        )}
                        {myTicketDetail.ticket.status === "waiting" && (
                          <div className="absolute right-0 top-0 bg-blue-600 text-white text-[9px] px-3 py-1 rounded-bl-xl font-black">
                            <span>排队候补中</span>
                          </div>
                        )}
                        {myTicketDetail.ticket.status === "completed" && (
                          <div className="absolute right-0 top-0 bg-slate-700 text-slate-300 text-[9px] px-3 py-1 rounded-bl-xl font-black">
                            <span>领取服务完成</span>
                          </div>
                        )}
                        {myTicketDetail.ticket.status === "skipped" && (
                          <div className="absolute right-0 top-0 bg-amber-600 text-white text-[9px] px-3 py-1 rounded-bl-xl font-black">
                            <span>号码已过号</span>
                          </div>
                        )}

                        <div className="text-center pb-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                            您当前的排队号码 (再次扫码也显示)
                          </span>
                          <h1 className="text-4xl font-black text-white tracking-widest mt-1.5 font-mono text-shadow-blue">
                            {myTicketDetail.ticket.number}
                          </h1>
                          <div className="inline-flex items-center space-x-1 bg-blue-950 border border-blue-900/40 px-3 py-0.5 rounded-full mt-2">
                            {getQueueIcon(myTicketDetail.ticket.type, "w-3 h-3 text-blue-400")}
                            <span className="text-[10px] text-blue-300 font-bold">
                              {getQueueName(myTicketDetail.ticket.type).split(" ")[0]}
                            </span>
                          </div>
                        </div>

                        {/* Position information */}
                        <div className="grid grid-cols-2 gap-2 bg-[#080d1a] p-3 rounded-xl border border-blue-950/60">
                          <div className="text-center border-r border-slate-900">
                            <span className="text-[10px] text-slate-400 block font-bold">前方还需等候</span>
                            <span className="text-lg font-black text-blue-400 block mt-0.5 font-mono">
                              {myTicketDetail.ticket.status === "waiting" ? `${myTicketDetail.ahead} 人` : "0 人"}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block font-bold">预计等候时间</span>
                            <span className="text-lg font-black text-slate-200 block mt-0.5 font-mono">
                              {myTicketDetail.ticket.status === "waiting" ? `~${myTicketDetail.estimatedWaitMinutes} 分钟` : "请前往柜台"}
                            </span>
                          </div>
                        </div>

                        {/* Order contents block if ordered */}
                        {myTicketDetail.ticket.orderedItems && myTicketDetail.ticket.orderedItems.length > 0 && (
                          <div className="bg-blue-950/40 border border-blue-900/20 rounded-xl p-2.5 space-y-1 text-[10px]">
                            <span className="text-slate-400 font-bold block mb-1">配货校服成衣清单：</span>
                            {myTicketDetail.ticket.orderedItems.map((it: any, index: number) => (
                              <div key={index} className="flex justify-between text-slate-300 font-mono">
                                <span>• {it.name} ({it.size}码)</span>
                                <span>x{it.quantity} 件</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Alert notification text based on ticket status */}
                        <div className="border-t border-dashed border-slate-900 pt-3 text-center">
                          {myTicketDetail.ticket.status === "waiting" && (
                            <p className="text-[10px] text-slate-400 leading-relaxed px-1">
                              📢 目前取件台正呼叫 <span className="font-extrabold text-blue-400 font-mono">{myTicketDetail.currentCalled}</span>。配货组老师正在加急核实校服款型并开包折叠，叫到后请前往柜台。
                            </p>
                          )}
                          {myTicketDetail.ticket.status === "called" && (
                            <div className="text-red-400 font-black px-1 space-y-1 animate-pulse">
                              <p className="text-xs">✨ 请携带手机至「1号或2号取包台」！</p>
                              <p className="text-[9.5px] text-slate-300 font-normal">您的校服包裹已经打包完毕，可以试穿或带走。</p>
                            </div>
                          )}
                          {myTicketDetail.ticket.status === "completed" && (
                            <p className="text-emerald-400 font-black py-0.5 text-[10px]">
                              🎉 领包完成！如有不合身可重新取【尺寸调换】号办理。
                            </p>
                          )}
                          {myTicketDetail.ticket.status === "skipped" && (
                            <p className="text-amber-500 font-black py-0.5 text-[10px] px-1 leading-relaxed">
                              ⚠️ 抱歉，因连续呼叫超时您已被过号。如需再次领取，请向现场服务老师咨询恢复。
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono mt-3 px-1">
                            <span>所属学校: {myTicketDetail.ticket.schoolName || getSchoolNameById(selectedSchool)}</span>
                            <span>取号: {new Date(myTicketDetail.ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={onRefreshQueue}
                            className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 py-2 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
                          >
                            <RefreshCw size={12} className="animate-spin-slow text-blue-400" />
                            <span>手动刷新进度</span>
                          </button>
                          <button
                            onClick={handleCancelTicket}
                            className="bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 py-2 rounded-xl text-xs font-semibold border border-red-900/30 transition-colors"
                          >
                            <span>放弃排号</span>
                          </button>
                        </div>

                        {/* Escaping to switch school/buy for another kid */}
                        <div className="bg-[#050914] p-2.5 rounded-xl border border-blue-950/40 text-center space-y-1">
                          <p className="text-[9px] text-slate-500">
                            需要为其他孩子下单，或想解除绑定重新关联学校？
                          </p>
                          <div className="flex justify-center space-x-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSchool(null);
                              }}
                              className="text-[9.5px] text-blue-400 hover:text-blue-300 font-extrabold underline cursor-pointer"
                            >
                              切换学校 / 重新关联
                            </button>
                            <span className="text-slate-800 text-[10px] select-none">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("catalog");
                              }}
                              className="text-[9.5px] text-blue-400 hover:text-blue-300 font-extrabold underline cursor-pointer"
                            >
                              返回商品专柜
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* If no active ticket, explain how to get a manual queue if they just need help without ordering */
                      <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-900 text-center space-y-3.5">
                        <div className="py-2 flex flex-col items-center">
                          <div className="w-10 h-10 bg-slate-950 text-slate-300 rounded-full flex items-center justify-center border border-slate-800 mb-2">
                            <QrCode size={18} className="text-blue-400 animate-pulse" />
                          </div>
                          <h3 className="text-xs font-extrabold text-slate-200">
                            您尚未获取排号
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                            如有购买现货，下单后会自动分配领取号码。如果您只需办理<strong>“尺寸调换/修改”</strong>或<strong>“现场人工收银结算”</strong>，可直接在下方自助拉取等候号码：
                          </p>
                        </div>

                        {/* Queue list selections */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setManualTicketType("A");
                              setManualPhone("");
                              setShowManualTicketModal(true);
                            }}
                            className="bg-[#0e1428] border border-blue-900/20 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-blue-500/40 transition-all cursor-pointer group"
                          >
                            <Scissors className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-105 transition-transform" />
                            <span className="text-[11px] font-extrabold text-slate-100">尺寸修改与调换</span>
                            <span className="text-[8px] text-slate-500 mt-0.5">
                              排队 {queueStatus?.waitingCount.A || 0} 人
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setManualTicketType("C");
                              setManualPhone("");
                              setShowManualTicketModal(true);
                            }}
                            className="bg-[#0e1428] border border-blue-900/20 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-blue-500/40 transition-all cursor-pointer group"
                          >
                            <CreditCard className="w-4 h-4 text-sky-400 mb-1 group-hover:scale-105 transition-transform" />
                            <span className="text-[11px] font-extrabold text-slate-100">现场结算与收银</span>
                            <span className="text-[8px] text-slate-500 mt-0.5">
                              排队 {queueStatus?.waitingCount.C || 0} 人
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Central live queue screen display board */}
                    <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-[11px] font-extrabold text-slate-100 flex items-center space-x-1 uppercase tracking-wider">
                          <Users size={12} className="text-blue-400" />
                          <span>门店服务窗口呼叫大屏</span>
                        </span>
                        <button 
                          onClick={onRefreshQueue}
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center space-x-0.5 cursor-pointer"
                        >
                          <RefreshCw size={10} />
                          <span>同步进度</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#0b101f] p-2.5 rounded-xl text-center border border-blue-950/40">
                          <span className="text-[9px] text-slate-400 block font-bold">校服领取 U</span>
                          <div className="text-base font-black text-blue-400 font-mono mt-0.5 text-shadow-blue">
                            {queueStatus?.currentCalled.U || "无"}
                          </div>
                          <span className="text-[8px] text-slate-500 block mt-0.5 font-medium">
                            {queueStatus?.waitingCount.U || 0}人等候
                          </span>
                        </div>
                        <div className="bg-[#0b101f] p-2.5 rounded-xl text-center border border-blue-950/40">
                          <span className="text-[9px] text-slate-400 block font-bold">尺码修改 A</span>
                          <div className="text-base font-black text-indigo-400 font-mono mt-0.5 text-shadow-blue">
                            {queueStatus?.currentCalled.A || "无"}
                          </div>
                          <span className="text-[8px] text-slate-500 block mt-0.5 font-medium">
                            {queueStatus?.waitingCount.A || 0}人等候
                          </span>
                        </div>
                        <div className="bg-[#0b101f] p-2.5 rounded-xl text-center border border-blue-950/40">
                          <span className="text-[9px] text-slate-400 block font-bold">收银开单 C</span>
                          <div className="text-base font-black text-sky-400 font-mono mt-0.5 text-shadow-blue">
                            {queueStatus?.currentCalled.C || "无"}
                          </div>
                          <span className="text-[8px] text-slate-500 block mt-0.5 font-medium">
                            {queueStatus?.waitingCount.C || 0}人等候
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* D. WeChat Navigation Bottom Bar */}
          {selectedSchool && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#0c1122] border-t border-slate-900 flex items-center justify-around px-4 z-20 shrink-0 shadow-lg">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                  activeTab === "catalog" ? "text-blue-400 font-extrabold" : "text-slate-500 hover:text-slate-400"
                }`}
              >
                <ShoppingBag size={18} />
                <span className="text-[9px]">校服商城</span>
              </button>
              <button
                onClick={() => setActiveTab("queue")}
                className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                  activeTab === "queue" ? "text-blue-400 font-extrabold" : "text-slate-500 hover:text-slate-400"
                }`}
              >
                <Users size={18} />
                <span className="text-[9px]">排队进度</span>
              </button>
            </div>
          )}

          {/* E. Overlays and Modals */}
          <AnimatePresence>
            
            {/* 1. SKU SPEC SELECTION MODAL WITH OUT-OF-STOCK INTEGRATION */}
            {showSkuModal && selectedProduct && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 z-30 flex items-end"
              >
                <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-[#0f152b] w-full rounded-t-3xl p-5 pb-8 space-y-4 max-h-[88%] border-t border-blue-900/40 overflow-y-auto"
                >
                  {/* SKU Header */}
                  <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] bg-blue-900/30 text-blue-300 font-extrabold px-1.5 py-0.5 rounded border border-blue-800/20 uppercase tracking-widest block w-fit">
                        {getSchoolNameById(selectedSchool)}
                      </span>
                      <h4 className="text-xs font-black text-slate-100 mt-1">
                        {selectedProduct.name}
                      </h4>
                      <p className="text-[11px] font-black text-blue-400">¥{selectedProduct.price}</p>
                    </div>
                    <button 
                      onClick={() => setShowSkuModal(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-900 w-6 h-6 rounded-full flex items-center justify-center font-extrabold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {regSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-8 flex flex-col items-center text-center space-y-3"
                    >
                      <div className="w-12 h-12 bg-emerald-950/50 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle size={24} className="animate-bounce" />
                      </div>
                      <h4 className="text-xs font-black text-white">缺货登记提交成功！</h4>
                      <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed">
                        您的求购信息已即时直达 【缪斯门店库房/采购端】，我们将尽快进行调货！调货成功后将自动通过手机号进行通知！
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRegisterOutOfStockSubmit} className="space-y-4">
                      
                      {/* Out of stock mode prompt sticker */}
                      {isOutOfStockMode && (
                        <div className="bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl flex items-start space-x-2 text-[10px] text-red-400">
                          <AlertTriangle size={13} className="shrink-0 mt-0.5 text-red-500" />
                          <p className="leading-relaxed">
                            <strong>您已开启“缺货登记”模式</strong>：请在下方选择需要的缺货尺码并输入手机号。系统将单独汇总向店长发出加急采购强提醒。
                          </p>
                        </div>
                      )}

                      {/* SKU Size Select chips */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isOutOfStockMode ? "选择需要登记的尺码" : "选择校服尺码"}
                          </label>
                          {!isOutOfStockMode && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOutOfStockMode(true);
                                setSkuQuantity(1);
                              }}
                              className="text-[10px] text-red-400 hover:text-red-300 font-extrabold flex items-center space-x-0.5 cursor-pointer"
                            >
                              <AlertTriangle size={10} />
                              <span>缺货尺码登记入口</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {selectedProduct.skus.map(sku => {
                            const isSelected = selectedSize === sku.size;
                            const isSoldOut = sku.stock === 0;
                            return (
                              <button
                                key={sku.size}
                                type="button"
                                onClick={() => setSelectedSize(sku.size)}
                                className={`rounded-xl p-2.5 text-center relative transition-all border ${
                                  isOutOfStockMode
                                    ? isSelected
                                      ? "border-red-500 bg-red-950/30 text-red-300"
                                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                                    : isSelected
                                      ? "border-blue-500 bg-blue-950/40 text-blue-300 font-black"
                                      : isSoldOut
                                        ? "border-slate-900 bg-slate-950/20 text-slate-600 cursor-not-allowed"
                                        : "border-slate-850 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                                }`}
                              >
                                <span className="text-xs block font-mono">{sku.size}</span>
                                <span className="text-[8px] opacity-75 block mt-0.5">
                                  {isOutOfStockMode ? "登记款式" : isSoldOut ? "无货" : `库存: ${sku.stock}`}
                                </span>

                                {/* Corner "OutOfStock" badge (CRITICAL REQUIREMENT) */}
                                {isOutOfStockMode && (
                                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[7px] px-1 py-0.2 rounded shadow">
                                    缺货
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-900">
                        <span className="text-[11px] font-bold text-slate-400">购买数量 (件)</span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setSkuQuantity(prev => Math.max(1, prev - 1))}
                            className="w-7 h-7 bg-slate-900 rounded-lg text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-white w-4 text-center">{skuQuantity}</span>
                          <button
                            type="button"
                            onClick={() => setSkuQuantity(prev => prev + 1)}
                            className="w-7 h-7 bg-slate-900 rounded-lg text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Out of Stock Mode inputs (CRITICAL REQUIREMENT) */}
                      {isOutOfStockMode ? (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              联系手机号 <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Phone size={12} />
                              </span>
                              <input
                                type="tel"
                                required
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                placeholder="请输入11位手机号用于接收调货短信"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-700 focus:outline-none focus:border-red-500 font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsOutOfStockMode(false)}
                              className="w-1/3 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-xl text-xs py-2.5 transition-all"
                            >
                              返回
                            </button>
                            <button
                              type="submit"
                              disabled={loading || regPhone.length !== 11}
                              className="w-2/3 bg-red-600 hover:bg-red-500 disabled:bg-red-950/60 text-white font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center space-x-1 uppercase cursor-pointer"
                            >
                              {loading ? "登记提交中..." : "立即登记"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal mode: Add to cart / instant purchase */
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleAddToCart}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-200 py-2.5 rounded-xl text-xs font-black border border-slate-800 transition-colors"
                          >
                            加入购物车
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Direct to checkout with this single product
                              setCart([{ product: selectedProduct, size: selectedSize, quantity: skuQuantity }]);
                              setShowSkuModal(false);
                              setShowCheckoutModal(true);
                            }}
                            className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-750 text-white font-black py-2.5 rounded-xl text-xs shadow-md transition-all"
                          >
                            立即购买/结算
                          </button>
                        </div>
                      )}

                    </form>
                  )}

                </motion.div>
              </motion.div>
            )}

            {/* 2. CHECKOUT MODAL (PRESENTS QUEUE TICKET NUMBER UPON COMPLETION) */}
            {showCheckoutModal && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 z-30 flex items-end"
              >
                <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-[#0f152b] w-full rounded-t-3xl p-5 pb-8 space-y-4 max-h-[85%] border-t border-blue-900/40"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                      校服现货结算下单
                    </span>
                    <button 
                      onClick={() => setShowCheckoutModal(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-900 w-6 h-6 rounded-full flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {orderSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-6 flex flex-col items-center text-center space-y-4"
                    >
                      <div className="w-12 h-12 bg-emerald-950/50 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle size={24} className="animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-white">正常下单成功！</h4>
                        <p className="text-[10px] text-slate-400">已为您自动分配到校服领取窗口排号：</p>
                        <h1 className="text-3xl font-black text-blue-400 tracking-wider font-mono">{newTicketNumber}</h1>
                      </div>
                      <p className="text-[9.5px] text-slate-500 max-w-[250px] leading-relaxed">
                        您的叫号单已经保存在小程序中，再次扫码也保持此状态。请在大厅等候配货叫号呼叫。
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      
                      {/* Products preview in checkout */}
                      <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-900 space-y-2 max-h-36 overflow-y-auto">
                        <span className="text-[9px] text-slate-500 block font-bold">已订校服列表：</span>
                        {cart.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs text-slate-200 font-mono">
                            <span>{item.product.name} ({item.size}码)</span>
                            <span className="text-blue-400 font-bold">x{item.quantity} 件</span>
                          </div>
                        ))}
                        <div className="text-right border-t border-slate-900 pt-1.5 text-xs text-blue-400 font-black">
                          应付金额：¥{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl space-y-1 text-[9.5px] text-slate-400 border border-slate-900 leading-relaxed">
                        💡 <strong>说明：</strong> 下单后系统会自动为您生成一张“校服领取U号”。由于校服款式繁多，库房配货老师需按订单进行配货并熨烫，叫号呼叫后请前往柜台。
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center space-x-1 uppercase cursor-pointer"
                      >
                        {loading ? "正在处理校服订单..." : "立即下单并分配领取排号"}
                      </button>
                    </form>
                  )}

                </motion.div>
              </motion.div>
            )}

            {/* 3. MANUAL DRAW QUEUE TICKET (EXCHANGE / CASHIER) */}
            {showManualTicketModal && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 z-30 flex items-end"
              >
                <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-[#0f152b] w-full rounded-t-3xl p-5 pb-8 space-y-4 border-t border-blue-900/40"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                      自助获取等候排号
                    </span>
                    <button 
                      onClick={() => setShowManualTicketModal(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-900 w-6 h-6 rounded-full flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleManualTicketSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">排队类型</span>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-xs font-extrabold text-blue-400 flex items-center space-x-2">
                        {getQueueIcon(manualTicketType, "w-4 h-4 text-blue-400")}
                        <span>{getQueueName(manualTicketType)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center space-x-1 uppercase cursor-pointer"
                    >
                      {loading ? "取号中..." : "确认获取排号"}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>

      {/* ========================================================== */}
      {/* RIGHT: LCD Queue Calling Display Screen & IoT Simulation Remote */}
      {/* ========================================================== */}
      <div className="flex-1 min-w-[320px] max-w-md space-y-4">
        
        {/* TV BIG SCREEN MONITOR BOARD */}
        <div className="bg-[#050914] border-4 border-slate-950 rounded-3xl shadow-2xl p-4 relative overflow-hidden ring-2 ring-slate-800/50">
          
          {/* Glass glare effect for TV screen look */}
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10"></div>
          
          {/* TV Screen Top Bezel indicator */}
          <div className="flex items-center justify-between border-b border-blue-950/80 pb-3 mb-4 text-slate-200">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <div className="text-left">
                <span className="text-[11px] font-black text-white tracking-widest block">阳光校服智能排号大屏幕</span>
                <span className="text-[8px] text-slate-400 font-mono block tracking-wider uppercase">LED PUBLIC BROADCASTING BOARD</span>
              </div>
            </div>
            
            {/* TV Clock Display */}
            <div className="text-right">
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-950/40 tracking-widest">
                {currentTime || "09:00:00"}
              </span>
            </div>
          </div>

          {/* LED NOW CALLING STATE BOARD (机场航显式大卡片) */}
          <div className="space-y-3">
            <div className="text-center py-1">
              <span className="text-[9px] bg-blue-950/80 text-blue-400 border border-blue-900/40 px-3 py-0.5 rounded-full font-black tracking-widest uppercase">
                🔔 正在呼叫 / NOW CALLING
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* CATEGORY U - UNIFORM PICKUP */}
              <div className="bg-[#02050c]/90 border border-blue-950 rounded-2xl p-3 flex items-center justify-between shadow-inner relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-blue-400">
                    <ShoppingBag size={18} />
                    <span className="text-[7px] font-black mt-0.5">领配</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] text-slate-500 font-bold block">1号柜台 (校服发配)</span>
                    <span className="text-[10px] text-slate-300 font-extrabold truncate max-w-[130px] block">
                      {queueStatus?.currentCalled.U ? "已关联学校现货" : "暂无呼叫"}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex items-center space-x-2.5">
                  <span className="text-2xl font-black font-mono tracking-tighter text-blue-400 text-shadow-blue animate-pulse">
                    {queueStatus?.currentCalled.U || "---"}
                  </span>
                  {queueStatus?.currentCalled.U && (
                    <button
                      onClick={() => speakCall(queueStatus.currentCalled.U, "U")}
                      className="w-6 h-6 rounded-full bg-blue-950 border border-blue-900/40 flex items-center justify-center text-blue-300 hover:bg-blue-900 hover:text-white transition-all cursor-pointer"
                      title="重播播报"
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* CATEGORY A - SIZE ALTERATION */}
              <div className="bg-[#02050c]/90 border border-indigo-950 rounded-2xl p-3 flex items-center justify-between shadow-inner relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center text-indigo-400">
                    <Scissors size={16} />
                    <span className="text-[7px] font-black mt-0.5">调换</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] text-slate-500 font-bold block">2号柜台 (试衣改衣)</span>
                    <span className="text-[10px] text-slate-300 font-extrabold block">
                      {queueStatus?.currentCalled.A ? "尺码异常/售后调换" : "暂无呼叫"}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex items-center space-x-2.5">
                  <span className="text-2xl font-black font-mono tracking-tighter text-indigo-400 text-shadow-blue animate-pulse">
                    {queueStatus?.currentCalled.A || "---"}
                  </span>
                  {queueStatus?.currentCalled.A && (
                    <button
                      onClick={() => speakCall(queueStatus.currentCalled.A, "A")}
                      className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-900/40 flex items-center justify-center text-indigo-300 hover:bg-indigo-900 hover:text-white transition-all cursor-pointer"
                      title="重播播报"
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* CATEGORY C - CASHIER REGISTER */}
              <div className="bg-[#02050c]/90 border border-sky-950 rounded-2xl p-3 flex items-center justify-between shadow-inner relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center justify-center text-sky-400">
                    <CreditCard size={16} />
                    <span className="text-[7px] font-black mt-0.5">收银</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] text-slate-500 font-bold block">3号柜台 (财务开单)</span>
                    <span className="text-[10px] text-slate-300 font-extrabold block">
                      {queueStatus?.currentCalled.C ? "非预定现场结账" : "暂无呼叫"}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex items-center space-x-2.5">
                  <span className="text-2xl font-black font-mono tracking-tighter text-sky-400 text-shadow-blue animate-pulse">
                    {queueStatus?.currentCalled.C || "---"}
                  </span>
                  {queueStatus?.currentCalled.C && (
                    <button
                      onClick={() => speakCall(queueStatus.currentCalled.C, "C")}
                      className="w-6 h-6 rounded-full bg-sky-950 border border-sky-900/40 flex items-center justify-center text-sky-300 hover:bg-sky-900 hover:text-white transition-all cursor-pointer"
                      title="重播播报"
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* SCREEN WAITING TICKETS FOOTER BAR (底栏滚动等候提示) */}
          <div className="mt-4 pt-3.5 border-t border-blue-950/80 bg-[#02050c]/40 p-2.5 rounded-xl text-left">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
              🕒 门店实时等候中号码 ({queueStatus?.totalWaitingCount || 0}人等候)：
            </span>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-950 text-blue-400 font-mono font-bold px-1.5 py-0.2 rounded shrink-0 scale-90">发配(U)</span>
                <span className="text-slate-300 font-mono font-extrabold truncate">
                  {queueStatus?.waitingList.U.length === 0 
                    ? "暂无等候" 
                    : queueStatus?.waitingList.U.map(t => t.number).join(", ")
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-950 text-indigo-400 font-mono font-bold px-1.5 py-0.2 rounded shrink-0 scale-90">调换(A)</span>
                <span className="text-slate-300 font-mono font-extrabold truncate">
                  {queueStatus?.waitingList.A.length === 0 
                    ? "暂无等候" 
                    : queueStatus?.waitingList.A.map(t => t.number).join(", ")
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-sky-950 text-sky-400 font-mono font-bold px-1.5 py-0.2 rounded shrink-0 scale-90">收银(C)</span>
                <span className="text-slate-300 font-mono font-extrabold truncate">
                  {queueStatus?.waitingList.C.length === 0 
                    ? "暂无等候" 
                    : queueStatus?.waitingList.C.map(t => t.number).join(", ")
                  }
                </span>
              </div>
            </div>
          </div>

          {/* TV Bottom Bezel Support Stand mockup */}
          <div className="mt-2 text-center select-none text-slate-800 text-[8px] tracking-widest font-black">
            ────────── IoT SMART MONITOR PANEL ──────────
          </div>
        </div>

        {/* IOT SIMULATED REMOTE CONTROLLER DEVICE (大屏遥控调试器) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center space-x-1.5">
              <Sliders size={13} className="text-blue-400" />
              <span>📱 大屏叫号测试遥控器</span>
            </h3>
            <span className="text-[8px] bg-blue-950 text-blue-400 font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
              IoT Remote
            </span>
          </div>

          {/* Auto Simulation Trigger and Remote Info */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-extrabold text-blue-400 block">自动仿真循环演练模式</span>
                <p className="text-[8px] text-slate-500 font-medium leading-none mt-0.5">每 12 秒自动叫号并播放真人语音</p>
              </div>
              
              <button
                onClick={() => setAutoCallMode(!autoCallMode)}
                className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                  autoCallMode 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" 
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{autoCallMode ? "🟢 自动轮叫中" : "🔴 点击开启自动"}</span>
              </button>
            </div>
          </div>

          {/* Smart call simulation buttons */}
          <div className="space-y-2">
            <span className="text-[9px] text-slate-400 font-black tracking-widest block uppercase px-0.5">一键触发下一位叫号 (模拟各柜台办理)：</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { type: "U", name: "1号柜台领配" },
                { type: "A", name: "2号柜台试穿" },
                { type: "C", name: "3号柜台收银" }
              ].map(call => (
                <button
                  key={call.type}
                  onClick={() => onCallNext(call.type as any)}
                  className="bg-slate-950 border border-slate-850 hover:border-blue-500 text-slate-200 py-2 px-1 rounded-xl text-[10px] font-black hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer"
                >
                  {getQueueIcon(call.type as any, "w-3.5 h-3.5 text-blue-400")}
                  <span>{call.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Queue manipulation pool with Complete/Skip buttons so tester can handle queues */}
          <div className="space-y-2 border-t border-slate-900 pt-3">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">
                等候队列精准操作控制 ({queueStatus?.totalWaitingCount || 0}人等候)：
              </span>
            </div>

            {queueStatus?.totalWaitingCount === 0 ? (
              <p className="text-[10px] text-slate-600 italic py-2 text-center bg-slate-950/30 rounded-xl border border-slate-900/35">
                当前暂无排队等候的家长号码...
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin pr-1">
                {(["U", "A", "C"] as const).map(type => {
                  const list = queueStatus?.waitingList[type] || [];
                  return list.map(ticket => (
                    <div 
                      key={ticket.id} 
                      className="bg-slate-950/80 border border-slate-900 px-2 py-1.5 rounded-xl flex items-center justify-between text-[11px] shadow-sm"
                    >
                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-white font-mono">{ticket.number}</span>
                          <span className="text-[8px] bg-slate-900 text-slate-400 font-mono px-1 rounded scale-90">
                            {type === "U" ? "领取" : type === "A" ? "修改" : "收银"}
                          </span>
                        </div>
                        {ticket.schoolName && (
                          <span className="text-[8px] text-slate-500 block leading-none mt-0.5 truncate max-w-[150px]">
                            学校：{ticket.schoolName}
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-1 shrink-0">
                        <button
                          onClick={() => speakCall(ticket.number, type)}
                          className="bg-blue-950/40 text-blue-400 border border-blue-900/40 hover:bg-blue-900 hover:text-white text-[8px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer"
                        >
                          🔊 广播
                        </button>
                        <button
                          onClick={() => onSkipTicket(ticket.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer"
                        >
                          过号
                        </button>
                        <button
                          onClick={() => onCompleteTicket(ticket.id)}
                          className="bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900 border border-emerald-900 text-[8px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer"
                        >
                          办理完成
                        </button>
                      </div>
                    </div>
                  ));
                })}
              </div>
            )}
          </div>

          {/* OUT OF STOCK DISPATCH LOGS COMPACT BAR (缺货追踪与极简操作) */}
          {registrations.length > 0 && (
            <div className="space-y-2 border-t border-slate-900 pt-3 text-left">
              <span className="text-[9px] text-slate-400 font-black tracking-widest block uppercase px-0.5">
                📦 缺货补配登记池 ({registrations.filter(r => r.status === "pending").length} 单待调配)：
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto scrollbar-thin pr-1">
                {registrations.map(reg => (
                  <div 
                    key={reg.id} 
                    className={`border px-2 py-1 rounded-lg flex items-center justify-between text-[10px] shadow-sm transition-all ${
                      reg.status === "resolved" 
                        ? "bg-slate-950/20 border-slate-950 text-slate-600" 
                        : "bg-red-950/5 border-red-950/25 text-slate-300"
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex items-center space-x-1">
                        <span className="font-extrabold text-slate-200">{reg.itemName}</span>
                        <span className="text-[8px] bg-red-950/40 text-red-400 px-1 rounded scale-90">
                          {reg.size}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-500 block">学校：{reg.schoolName} | {reg.phoneNumber}</span>
                    </div>

                    <div className="shrink-0">
                      {reg.status === "pending" ? (
                        <button
                          onClick={() => onHandleOutOfStock(reg.id)}
                          className="bg-red-950 hover:bg-red-900/60 border border-red-900/40 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer"
                        >
                          标记到货
                        </button>
                      ) : (
                        <span className="text-[8px] text-emerald-500 font-extrabold">
                          ✓ 已发通知短信
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset button & Scenario Scans */}
          <div className="border-t border-slate-900 pt-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-900">
              <button
                onClick={() => handleSimulateScan("first")}
                className="text-[8px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer font-bold"
                title="模拟首次到店"
              >
                情景A
              </button>
              <button
                onClick={() => handleSimulateScan("school_only")}
                className="text-[8px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer font-bold"
                title="模拟已选择学校"
              >
                情景B
              </button>
              <button
                onClick={() => handleSimulateScan("with_ticket")}
                className="text-[8px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer font-bold"
                title="模拟已有排队号"
              >
                情景C
              </button>
            </div>

            <button
              onClick={onResetSystem}
              className="text-[9px] bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 border border-red-900/20 py-1 px-3 rounded-lg font-bold transition-all cursor-pointer"
            >
              初始化所有排队模拟数据
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
