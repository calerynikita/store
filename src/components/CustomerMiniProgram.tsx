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
  Filter,
  History
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
  currentView?: string;
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
  onResetSystem,
  currentView: propCurrentView
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
  const [showRemote, setShowRemote] = useState(false);

  // Parse URL parameter to support fully separated screens (mini vs tv vs split)
  const [currentView, setCurrentView] = useState<"split" | "mini" | "tv">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "mini" || viewParam === "tv" || viewParam === "split") {
        return viewParam as any;
      }
    }
    return "split";
  });

  // Track local order/ticket history
  const [historyTickets, setHistoryTickets] = useState<any[]>(() => {
    try {
      const historyJson = localStorage.getItem("boutique_ticket_history") || "[]";
      return JSON.parse(historyJson);
    } catch {
      return [];
    }
  });

  const addToHistory = (ticket: any, schoolName: string, items?: any[]) => {
    try {
      const historyJson = localStorage.getItem("boutique_ticket_history") || "[]";
      const history = JSON.parse(historyJson);
      if (history.some((h: any) => h.id === ticket.id)) {
        return;
      }
      const newHistoryItem = {
        id: ticket.id,
        number: ticket.number,
        type: ticket.type,
        schoolName: schoolName,
        timestamp: ticket.timestamp,
        orderedItems: items || [],
        status: ticket.status || "waiting"
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 15);
      localStorage.setItem("boutique_ticket_history", JSON.stringify(updatedHistory));
      setHistoryTickets(updatedHistory);
    } catch (err) {
      console.error("Failed to write to local history:", err);
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "mini" || viewParam === "tv" || viewParam === "split") {
        setCurrentView(viewParam as any);
      }
    };
    window.addEventListener("popstate", handleUrlChange);
    const interval = setInterval(handleUrlChange, 1000);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  // Synchronize history status with live queueStatus
  const syncedHistory = historyTickets.map(item => {
    let currentStatus = item.status;
    const isWaiting = (queueStatus?.waitingList.U.some(t => t.id === item.id)) ||
                      (queueStatus?.waitingList.A.some(t => t.id === item.id)) ||
                      (queueStatus?.waitingList.C.some(t => t.id === item.id));
                      
    const isCalled = queueStatus?.currentCalled.U === item.number ||
                     queueStatus?.currentCalled.A === item.number ||
                     queueStatus?.currentCalled.C === item.number;
                     
    if (isCalled) {
      currentStatus = "called";
    } else if (isWaiting) {
      currentStatus = "waiting";
    } else {
      if (item.status === "waiting" || item.status === "called") {
        currentStatus = "completed";
      }
    }
    
    return { ...item, status: currentStatus };
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (propCurrentView) {
      setCurrentView(propCurrentView as any);
    }
  }, [propCurrentView]);

  const speakCall = (num: string, type: "U" | "A" | "C") => {
    try {
      if (typeof window === "undefined") return;
      
      const hasSpeech = "speechSynthesis" in window && 
                        typeof window.speechSynthesis !== "undefined" && 
                        window.speechSynthesis !== null;
      if (!hasSpeech) return;

      const UtteranceClass = window.SpeechSynthesisUtterance || (window as any).webkitSpeechSynthesisUtterance;
      if (!UtteranceClass || typeof UtteranceClass !== "function") {
        return;
      }

      const typeName = type === "U" ? "校服发配处" : type === "A" ? "试衣改衣台" : "现场收银台";
      const text = `请 ${num.split("").join(" ")} 号顾客，前往 ${typeName} 办理业务。`;
      
      let utterance: SpeechSynthesisUtterance;
      try {
        utterance = new UtteranceClass(text);
      } catch (err) {
        console.warn("SpeechSynthesisUtterance is not constructible in this environment:", err);
        return;
      }

      window.speechSynthesis.cancel();
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      
      utterance.onerror = (event) => {
        console.warn("SpeechSynthesisUtterance async error:", event);
      };

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
      
      // Save to local history!
      addToHistory(result.ticket, schoolName, orderItems);

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
        
        // Save to local history!
        addToHistory(data.ticket, getSchoolNameById(selectedSchool));

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
      // Save current ticket to history before clearing if it exists
      if (myTicketDetail && myTicketDetail.ticket) {
        addToHistory(myTicketDetail.ticket, myTicketDetail.ticket.schoolName || getSchoolNameById(selectedSchool), myTicketDetail.ticket.orderedItems);
      }
      localStorage.removeItem("my_boutique_ticket_id");
      setMyTicketId(null);
      setMyTicketDetail(null);
      onRefreshQueue();
    }
  };

  // Switch to another order while keeping current one active in history
  const handleOrderAnother = () => {
    if (myTicketDetail && myTicketDetail.ticket) {
      addToHistory(myTicketDetail.ticket, myTicketDetail.ticket.schoolName || getSchoolNameById(selectedSchool), myTicketDetail.ticket.orderedItems);
    }
    localStorage.removeItem("my_boutique_ticket_id");
    setMyTicketId(null);
    setMyTicketDetail(null);
    setActiveTab("catalog");
  };

  // Reactivate a ticket from history to track its progress
  const handleReactivateTicket = (ticketId: string) => {
    setMyTicketId(ticketId);
    localStorage.setItem("my_boutique_ticket_id", ticketId);
    setActiveTab("queue");
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

  const showLeft = currentView === "split" || currentView === "mini";
  const showRight = currentView === "split" || currentView === "tv";

  return (
    <div className={`flex flex-col xl:flex-row gap-8 items-start justify-center w-full ${
      currentView === "split" ? "max-w-6xl" : "max-w-4xl"
    } mx-auto px-4 py-2`}>
      
      {showLeft && (
        <div className={`relative shrink-0 mx-auto ${currentView === "mini" ? "xl:scale-105 my-4" : ""}`}>
        
        {/* Soft glowing ambient backing */}
        <div className="absolute inset-8 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        {/* WeChat Simulator Outer shell - Classic School Uniform Premium White Styling */}
        <div className="w-[385px] h-[795px] bg-[#f8fafc] border-[10px] border-[#cbd5e1] rounded-[48px] overflow-hidden shadow-[0_30px_70px_-10px_rgba(15,23,42,0.15)] relative flex flex-col select-none border-double">
          
          {/* A. Top status Bar / Notch */}
          <div className="bg-slate-100 text-slate-600 h-11 px-6 flex justify-between items-center text-xs font-semibold relative shrink-0 border-b border-slate-200/50">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-slate-100 w-36 h-5 rounded-b-2xl flex items-center justify-center border-b border-slate-200">
              <span className="w-2 h-2 bg-slate-300 rounded-full border border-slate-200"></span>
            </div>
            <div>12:30</div>
            <div className="flex items-center space-x-1.5 text-slate-500">
              <span className="text-[9px] font-mono">5G</span>
              <div className="w-5 h-2.5 border border-slate-300 rounded-xs p-[1px] flex items-center">
                <div className="w-full h-full bg-slate-500 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* B. WeChat Header bar with Deep Blue School Uniform Logo / Title */}
          <div className="bg-white border-b border-slate-200 text-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              {/* Premium Deep Blue Shield Logo Crest Design */}
              <div className="w-6 h-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center shadow-xs border border-blue-200 relative">
                <GraduationCap size={13} className="text-blue-600 relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[11px] tracking-wider font-sans text-slate-800 leading-none">
                  阳光校服智能排号
                </span>
                <span className="text-[7.5px] text-blue-600 font-mono tracking-widest leading-none mt-0.5 uppercase">
                  Sunny Delivery
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
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-2 py-1.5 rounded-full text-[8px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-xs animate-pulse"
                title="模拟在门店中再次扫描货架上的二维码"
              >
                <QrCode size={10} className="text-blue-500" />
                <span>📷 模拟扫码</span>
              </button>

              <div className="bg-slate-100 border border-slate-200 rounded-full px-2 py-1 flex items-center space-x-2.5 text-slate-600 scale-85">
                <div className="flex space-x-1">
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                </div>
                <div className="w-[1px] h-2.5 bg-slate-200"></div>
                <div className="w-3 h-3 border border-slate-400 rounded-full flex items-center justify-center relative">
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>

          {/* C. Scrollable Content Window */}
          <div className="flex-1 overflow-y-auto pb-20 bg-slate-50 scrollbar-none relative">
            
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
                    className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                        <Users size={15} />
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] text-blue-600 font-bold block leading-none">再次扫码智能识别：</span>
                        <p className="text-[11px] text-slate-800 font-extrabold mt-1">您有正在等候的号码 <span className="text-blue-600 font-mono text-xs">{myTicketDetail.ticket.number}</span></p>
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
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-xs transition-all shrink-0 cursor-pointer"
                    >
                      秒开进度卡
                    </button>
                  </motion.div>
                )}

                {/* Store Information Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
                  
                  {/* Store Name and Live Status */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Store size={15} className="text-blue-600" />
                        <h3 className="text-[13px] font-black text-slate-800 tracking-wider">阳光校服·中山北路智能体验馆</h3>
                      </div>
                      <p className="text-[9.5px] text-slate-500 flex items-center gap-1">
                        <MapPin size={10} className="text-slate-400 shrink-0" />
                        <span>拱墅区中山北路88号首层 (中山北路校区旁)</span>
                      </p>
                    </div>
                    <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-black font-sans uppercase shrink-0">
                      营业中
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100"></div>

                  {/* Opening hours, Phone & Capacity */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[9.5px] text-slate-600 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Clock size={11} className="text-blue-500 shrink-0" />
                      <span>营业时间：09:00 - 21:00</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone size={11} className="text-blue-500 shrink-0" />
                      <span>咨询电话：0571-88888888</span>
                    </div>
                    <div className="col-span-2 text-[9.5px] bg-slate-50 text-slate-500 p-2 rounded-lg border border-slate-200/60 flex items-start space-x-1.5 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                      <span>
                        <strong className="text-blue-600">到店自助指南：</strong>到店家长请先在下方搜索并绑定孩子就读的学校，即可自动调取该校的现货校服并自助扫码下单，无需前台排队！
                      </span>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={13} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入学校全称、城区地名或首字母搜索..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-8.5 pr-8 text-[11px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans shadow-xs"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
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
                      <span className="text-[9.5px] font-black tracking-widest text-slate-600 uppercase">
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
                          className="text-[8.5px] text-blue-600 hover:underline font-extrabold"
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
                            <div className="text-center py-10 text-[10px] text-slate-400 italic bg-white rounded-xl border border-slate-200 shadow-xs">
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
                            className="w-full bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-2.5 text-left flex items-center justify-between shadow-xs transition-all group cursor-pointer"
                          >
                            <div className="space-y-0.5 max-w-[85%]">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] bg-blue-50 text-blue-600 font-black w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono shrink-0">
                                  {school.alphabet}
                                </span>
                                <h3 className="text-[11px] font-black text-slate-800 truncate">{school.name}</h3>
                              </div>
                              <p className="text-[9px] text-slate-500 pl-5 truncate">
                                {school.desc} | {school.addr}
                              </p>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors">
                              <ChevronRight size={10} />
                            </div>
                          </motion.button>
                        ));
                      })()}
                    </div>
                  </div>

                </div>

                {/* QR Code description */}
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-start space-x-1.5 text-[9px] text-slate-500 leading-normal shadow-xs">
                  <QrCode size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-blue-600">入店自助选购说明：</span>
                    顾客入店扫描货架上的校服专属二维码，可直接绑定该校校服。再次扫描该码系统将直接加载您已提交的订单排队窗口，无需重复搜索！
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ==================== 2. MAIN APPLICATION CONTENT (Tab 1: Shop, Tab 2: Queue) ==================== */
              <div className="p-4 space-y-4">
                
                {/* Active School Ribbon Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500 rounded-2xl p-3.5 flex items-center justify-between shadow-xs text-white">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-white/20 border border-white/20 rounded-lg text-white">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{getSchoolNameById(selectedSchool)}</h3>
                      <p className="text-[9px] text-blue-100">专供校服精品到店自助选购通道</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleClearSchool}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-black transition-all cursor-pointer"
                  >
                    切换学校
                  </button>
                </div>

                {/* Navigation switch */}
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      activeTab === "catalog" 
                        ? "bg-white text-slate-800 shadow-xs font-black" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    到店自助选购
                  </button>
                  <button
                    onClick={() => setActiveTab("queue")}
                    className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer relative ${
                      activeTab === "queue" 
                        ? "bg-white text-slate-800 shadow-xs font-black" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>我的排队叫号</span>
                    {myTicketId && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                </div>

                {activeTab === "catalog" ? (
                  /* ==================== TAB: CATALOG (SCHOOL UNIFORM SPECIFIC) ==================== */
                  <div className="space-y-4">
                    
                    {/* Welcome school uniform notice */}
                    <div className="text-[10px] text-slate-500 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                      💡 提示：本季提供【春秋季制服】及【夏季常服】的订购。正常下单后系统会自动为您分配<strong>【1号柜台校服发配排队号码】</strong>，凭号到柜台领取。若显示缺货，可登记手机号进行缺货登记。
                    </div>

                    {/* Grouped by categories */}
                    {["夏季校服", "秋季校服", "制式礼服", "常服系列", "户外校服", "运动系列"].map(category => {
                      const items = filteredItems.filter(item => item.category === category);
                      if (items.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-[10px] font-extrabold text-slate-800 border-l-2 border-blue-600 pl-1.5 py-0.5 tracking-widest uppercase">
                            {category}
                          </h4>
                          <div className="space-y-2.5">
                            {items.map(item => {
                              const totalStock = item.skus.reduce((sum, s) => sum + s.stock, 0);
                              return (
                                <div 
                                  key={item.id} 
                                  className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-xl p-3 shadow-xs flex flex-col justify-between gap-2.5 transition-all text-slate-800"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <span className="text-xs font-black text-slate-800 block">
                                        {item.name}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-extrabold text-blue-600">¥{item.price}</span>
                                        <span className="text-[9px] text-slate-500">
                                          ({item.skus.length}个尺码可选)
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Combined stock status badges */}
                                    {totalStock === 0 ? (
                                      <span className="text-[8px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200 font-extrabold">
                                        已售罄
                                      </span>
                                    ) : totalStock < 8 ? (
                                      <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200 animate-pulse font-extrabold">
                                        余量紧张
                                      </span>
                                    ) : (
                                      <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200 font-extrabold">
                                        现货充足
                                      </span>
                                    )}
                                  </div>

                                  {/* Action selectors */}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                    <div className="text-[9px] text-slate-400">
                                      包含尺码：{item.skus.map(s => s.size).join(", ")}
                                    </div>
                                    <button
                                      onClick={() => openSkuModal(item)}
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-1 px-3 rounded-lg text-[10px] transition-all flex items-center space-x-0.5 shadow-xs cursor-pointer"
                                    >
                                      <span>选规格配货</span>
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
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-lg sticky bottom-2 text-slate-800"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 relative">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                              {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-800 font-extrabold block">已选配货校服</span>
                            <span className="text-[10px] text-blue-600 font-bold block">
                              总计 ¥{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCheckoutPhone("");
                            setShowCheckoutModal(true);
                          }}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-1.5 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                        >
                          立即自助下单
                        </button>
                      </motion.div>
                    )}

                  </div>
                ) : (
                  /* ==================== TAB: QUEUE (叫号大屏 & 个人排号卡) ==================== */
                  <div className="space-y-4 text-slate-800">
                    
                    {/* Active Queue Ticket (PERSISTED & POLLED REAL-TIME) */}
                    {myTicketId && myTicketDetail ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 relative overflow-hidden"
                      >
                        {/* Live calling notice */}
                        {myTicketDetail.ticket.status === "called" && (
                          <div className="absolute right-0 top-0 bg-red-500 text-white text-[9px] px-3 py-1 rounded-bl-xl font-black flex items-center space-x-1.5 animate-pulse uppercase tracking-wider">
                            <Volume2 size={11} className="animate-bounce" />
                            <span>正在呼叫 请前往柜台</span>
                          </div>
                        )}
                        {myTicketDetail.ticket.status === "waiting" && (
                          <div className="absolute right-0 top-0 bg-blue-500 text-white text-[9px] px-3 py-1 rounded-bl-xl font-black">
                            <span>排队候补中</span>
                          </div>
                        )}
                        {myTicketDetail.ticket.status === "completed" && (
                          <div className="absolute right-0 top-0 bg-slate-400 text-white text-[9px] px-3 py-1 rounded-bl-xl font-black">
                            <span>领取服务完成</span>
                          </div>
                        )}
                        {myTicketDetail.ticket.status === "skipped" && (
                          <div className="absolute right-0 top-0 bg-amber-500 text-white text-[9px] px-3 py-1 rounded-bl-xl font-black">
                            <span>号码已过号</span>
                          </div>
                        )}

                        <div className="text-center pb-1 pt-2">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                            您当前的排队号码 (再次扫码自动开)
                          </span>
                          <h1 className="text-4xl font-black text-slate-800 tracking-widest mt-1.5 font-mono">
                            {myTicketDetail.ticket.number}
                          </h1>
                          <div className="inline-flex items-center space-x-1 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full mt-2">
                            {getQueueIcon(myTicketDetail.ticket.type, "w-3 h-3 text-blue-600")}
                            <span className="text-[10px] text-blue-600 font-bold">
                              1号柜台·配货领取 (Pickup)
                            </span>
                          </div>
                        </div>

                        {/* Position information */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-center border-r border-slate-200">
                            <span className="text-[10px] text-slate-500 block font-bold">前方还需等候</span>
                            <span className="text-lg font-black text-blue-600 block mt-0.5 font-mono">
                              {myTicketDetail.ticket.status === "waiting" ? `${myTicketDetail.ahead} 人` : "0 人"}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-500 block font-bold">预计等候时间</span>
                            <span className="text-lg font-black text-slate-700 block mt-0.5 font-mono">
                              {myTicketDetail.ticket.status === "waiting" ? `~${myTicketDetail.estimatedWaitMinutes} 分钟` : "请前往柜台"}
                            </span>
                          </div>
                        </div>

                        {/* Order contents block if ordered */}
                        {myTicketDetail.ticket.orderedItems && myTicketDetail.ticket.orderedItems.length > 0 && (
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 space-y-1 text-[10px] text-slate-700">
                            <span className="text-slate-800 font-bold block mb-1">已配货校服清单：</span>
                            {myTicketDetail.ticket.orderedItems.map((it: any, index: number) => (
                              <div key={index} className="flex justify-between text-slate-600 font-mono">
                                <span>• {it.name} ({it.size}码)</span>
                                <span>x{it.quantity} 件</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Alert notification text based on ticket status */}
                        <div className="border-t border-dashed border-slate-200 pt-3 text-center">
                          {myTicketDetail.ticket.status === "waiting" && (
                            <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                              📢 目前1号柜台正呼叫 <span className="font-extrabold text-blue-600 font-mono">{myTicketDetail.currentCalled}</span>。配货组老师正在加急核实校服款型并开包，叫到后请前往1号柜台。
                            </p>
                          )}
                          {myTicketDetail.ticket.status === "called" && (
                            <div className="text-red-500 font-black px-1 space-y-1 animate-pulse">
                              <p className="text-xs">✨ 请携带手机至「1号配货柜台」！</p>
                              <p className="text-[9.5px] text-slate-600 font-normal">您的校服包裹已经准备妥当，可以前往试穿或带走。</p>
                            </div>
                          )}
                          {myTicketDetail.ticket.status === "completed" && (
                            <p className="text-emerald-600 font-black py-0.5 text-[10px]">
                              🎉 领包完成！感谢您自助订购。如有其他购买需求，可直接点击下方再下一单。
                            </p>
                          )}
                          {myTicketDetail.ticket.status === "skipped" && (
                            <p className="text-amber-600 font-black py-0.5 text-[10px] px-1 leading-relaxed">
                              ⚠️ 抱歉，因连续呼叫超时您已被过号。如需再次领取，请向现场服务老师咨询。
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono mt-3 px-1">
                            <span>所属学校: {myTicketDetail.ticket.schoolName || getSchoolNameById(selectedSchool)}</span>
                            <span>取号: {new Date(myTicketDetail.ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-2 pt-1">
                          {/* "再下一单" Button for active tickets */}
                          <button
                            onClick={handleOrderAnother}
                            className="w-full flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded-xl text-xs font-black shadow-xs cursor-pointer"
                          >
                            <ShoppingCart size={13} />
                            <span>再下一单 (购买其他尺码或配货)</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={onRefreshQueue}
                              className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                            >
                              <RefreshCw size={12} className="animate-spin-slow text-blue-500" />
                              <span>手动刷新进度</span>
                            </button>
                            <button
                              onClick={handleCancelTicket}
                              className="bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-xs font-semibold border border-red-200 transition-colors cursor-pointer"
                            >
                              <span>放弃排号</span>
                            </button>
                          </div>
                        </div>

                        {/* Escaping to switch school/buy for another kid */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-1">
                          <p className="text-[9px] text-slate-400">
                            需要为其他孩子下单，或想解除绑定重新关联学校？
                          </p>
                          <div className="flex justify-center space-x-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSchool(null);
                              }}
                              className="text-[9.5px] text-blue-600 hover:text-blue-700 font-extrabold underline cursor-pointer"
                            >
                              切换学校 / 重新关联
                            </button>
                            <span className="text-slate-300 text-[10px] select-none">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("catalog");
                              }}
                              className="text-[9.5px] text-blue-600 hover:text-blue-700 font-extrabold underline cursor-pointer"
                            >
                              返回商品专区
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* If no active ticket, direct user to place order directly */
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center space-y-3.5 shadow-xs">
                        <div className="py-2 flex flex-col items-center">
                          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center border border-slate-200 mb-2 shadow-xs">
                            <QrCode size={18} className="text-blue-600 animate-pulse" />
                          </div>
                          <h3 className="text-xs font-extrabold text-slate-800">
                            您尚未获取配货排号
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                            如有购买校服，请先在下方<b>「到店自助选购」</b>中选择所需的款式与尺寸，自助下单即可自动为您分配1号柜台的排号。
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab("catalog")}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          前往选规格下单
                        </button>
                      </div>
                    )}

                    {/* QR SCAN HISTORY SECTION (Design for scanning again to see history) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5 text-left">
                      <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                        <History size={13} className="text-blue-600" />
                        <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase">
                          智能扫码历史排号记录
                        </span>
                      </div>
                      
                      {historyTickets.length === 0 ? (
                        <p className="text-[9px] text-slate-400 italic text-center py-2">
                          暂无历史下单记录，在门店下单后将自动在此保存。
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                          {historyTickets.map((tk) => {
                            const isCurrent = tk.id === myTicketId;
                            return (
                              <div 
                                key={tk.id}
                                className={`border rounded-xl p-2.5 flex items-center justify-between transition-all ${
                                  isCurrent 
                                    ? "bg-blue-50/50 border-blue-200 shadow-xs" 
                                    : "bg-slate-50 border-slate-150 hover:bg-slate-100/50"
                                }`}
                              >
                                <div className="space-y-0.5 max-w-[70%]">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[11px] font-extrabold font-mono text-slate-800">
                                      号码: {tk.number}
                                    </span>
                                    <span className="text-[8px] bg-slate-200/60 text-slate-500 px-1 rounded font-sans font-medium">
                                      {tk.schoolName || "合作学校"}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 truncate">
                                    {tk.orderedItems && tk.orderedItems.length > 0 
                                      ? tk.orderedItems.map((it: any) => `${it.name}(${it.size})`).join(", ")
                                      : "自助取号"
                                    }
                                  </p>
                                  <span className="text-[7.5px] text-slate-400 block font-mono">
                                    {new Date(tk.timestamp).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>

                                <div className="flex flex-col items-end space-y-1">
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                                    tk.status === "called" ? "bg-red-50 text-red-600 border border-red-100" :
                                    tk.status === "waiting" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    tk.status === "completed" ? "bg-slate-200 text-slate-600" :
                                    "bg-amber-50 text-amber-600 border border-amber-100"
                                  }`}>
                                    {tk.status === "called" ? "叫号中" :
                                     tk.status === "waiting" ? "等待中" :
                                     tk.status === "completed" ? "已完成" : "已过号"}
                                  </span>

                                  {!isCurrent && (
                                    <button
                                      onClick={() => handleReactivateTicket(tk.id)}
                                      className="text-[8.5px] text-blue-600 hover:underline font-extrabold cursor-pointer"
                                    >
                                      追踪此单进度 →
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Central live queue screen display board */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                        <span className="text-[11px] font-extrabold text-slate-800 flex items-center space-x-1 uppercase tracking-wider">
                          <Users size={12} className="text-blue-600" />
                          <span>1号柜台·领包服务呼叫屏</span>
                        </span>
                        <button 
                          onClick={onRefreshQueue}
                          className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center space-x-0.5 cursor-pointer"
                        >
                          <RefreshCw size={10} />
                          <span>同步进度</span>
                        </button>
                      </div>

                      {/* Display U Counter ONLY - Hide Alteration (A) and Cashier (C) from Simulator screen */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center max-w-xs mx-auto">
                        <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider">
                          1号配货发件柜台 (U)
                        </span>
                        <div className="text-3xl font-black text-blue-600 font-mono mt-1 animate-pulse">
                          {queueStatus?.currentCalled.U || "无"}
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-1.5 font-medium">
                          当前队列共 {queueStatus?.waitingCount.U || 0} 人等候
                        </span>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* D. WeChat Navigation Bottom Bar */}
          {selectedSchool && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4 z-20 shrink-0 shadow-lg text-slate-800">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                  activeTab === "catalog" ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <ShoppingBag size={18} />
                <span className="text-[9px]">自助选购</span>
              </button>
              <button
                onClick={() => setActiveTab("queue")}
                className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                  activeTab === "queue" ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Users size={18} />
                <span className="text-[9px]">排队叫号</span>
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
                className="absolute inset-0 bg-black/60 z-30 flex items-end"
              >
                <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-white w-full rounded-t-3xl p-5 pb-8 space-y-4 max-h-[88%] border-t border-slate-200 overflow-y-auto text-slate-800 shadow-xl"
                >
                  {/* SKU Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-widest block w-fit">
                        {getSchoolNameById(selectedSchool)}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 mt-1">
                        {selectedProduct.name}
                      </h4>
                      <p className="text-[11px] font-black text-blue-600">¥{selectedProduct.price}</p>
                    </div>
                    <button 
                      onClick={() => setShowSkuModal(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center font-extrabold cursor-pointer"
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
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                        <CheckCircle size={24} className="animate-bounce" />
                      </div>
                      <h4 className="text-xs font-black text-slate-800">缺货登记提交成功！</h4>
                      <p className="text-[10px] text-slate-500 max-w-[240px] leading-relaxed">
                        您的求购信息已即时直达 【缪斯门店库房/采购端】，我们将尽快进行调货！调货成功后将自动通过手机号进行通知！
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRegisterOutOfStockSubmit} className="space-y-4">
                      
                      {/* Out of stock mode prompt sticker */}
                      {isOutOfStockMode && (
                        <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-start space-x-2 text-[10px] text-red-600">
                          <AlertTriangle size={13} className="shrink-0 mt-0.5 text-red-500" />
                          <p className="leading-relaxed">
                            <strong>您已开启“缺货登记”模式</strong>：请在下方选择需要的缺货尺码并输入手机号。系统将单独汇总向店长发出加急采购强提醒。
                          </p>
                        </div>
                      )}

                      {/* SKU Size Select chips */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {isOutOfStockMode ? "选择需要登记的尺码" : "选择校服尺码"}
                          </label>
                          {!isOutOfStockMode && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOutOfStockMode(true);
                                setSkuQuantity(1);
                              }}
                              className="text-[10px] text-red-500 hover:text-red-600 font-extrabold flex items-center space-x-0.5 cursor-pointer"
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
                                      ? "border-red-500 bg-red-50 text-red-600"
                                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                                    : isSelected
                                      ? "border-blue-500 bg-blue-50 text-blue-600 font-black"
                                      : isSoldOut
                                        ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <span className="text-xs block font-mono">{sku.size}</span>
                                <span className="text-[8px] opacity-75 block mt-0.5">
                                  {isOutOfStockMode ? "登记款式" : isSoldOut ? "无货" : `库存: ${sku.stock}`}
                                </span>

                                {/* Corner "OutOfStock" badge */}
                                {isOutOfStockMode && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[7px] px-1 py-0.2 rounded shadow">
                                    缺货
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500">购买数量 (件)</span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setSkuQuantity(prev => Math.max(1, prev - 1))}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">{skuQuantity}</span>
                          <button
                            type="button"
                            onClick={() => setSkuQuantity(prev => prev + 1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Out of Stock Mode inputs */}
                      {isOutOfStockMode ? (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                              联系手机号 <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone size={12} />
                              </span>
                              <input
                                type="tel"
                                required
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                placeholder="请输入11位手机号用于接收调货短信"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsOutOfStockMode(false)}
                              className="w-1/3 border border-slate-200 hover:border-slate-300 text-slate-500 rounded-xl text-xs py-2.5 transition-all"
                            >
                              返回
                            </button>
                            <button
                              type="submit"
                              disabled={loading || regPhone.length !== 11}
                              className="w-2/3 bg-red-600 hover:bg-red-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center space-x-1 uppercase cursor-pointer"
                            >
                              {loading ? "登记提交中..." : "立即登记"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal mode: Add to cart / instant purchase - NO PHONE REQUIRED */
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleAddToCart}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-black border border-slate-200 transition-colors"
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
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-2.5 rounded-xl text-xs shadow-xs transition-all"
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
                className="absolute inset-0 bg-black/60 z-30 flex items-end"
              >
                <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-white w-full rounded-t-3xl p-5 pb-8 space-y-4 max-h-[85%] border-t border-slate-200 text-slate-800 shadow-xl"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      校服现货结算下单 (免登记手机号)
                    </span>
                    <button 
                      onClick={() => setShowCheckoutModal(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center font-bold"
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
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                        <CheckCircle size={24} className="animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800">正常下单成功！</h4>
                        <p className="text-[10px] text-slate-500">已为您自动分配到校服领取窗口排号：</p>
                        <h1 className="text-3xl font-black text-blue-600 tracking-wider font-mono">{newTicketNumber}</h1>
                      </div>
                      <p className="text-[9.5px] text-slate-400 max-w-[250px] leading-relaxed">
                        您的叫号单已经保存在小程序中，再次扫码也保持此状态。请在大厅等候配货叫号呼叫。
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      
                      {/* Products preview in checkout */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 space-y-2 max-h-36 overflow-y-auto">
                        <span className="text-[9px] text-slate-500 block font-bold">已订校服列表：</span>
                        {cart.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs text-slate-700 font-mono">
                            <span>{item.product.name} ({item.size}码)</span>
                            <span className="text-blue-600 font-bold">x{item.quantity} 件</span>
                          </div>
                        ))}
                        <div className="text-right border-t border-slate-200 pt-1.5 text-xs text-blue-600 font-black">
                          应付金额：¥{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-xl space-y-1 text-[9.5px] text-blue-700 border border-blue-100 leading-relaxed">
                        💡 <strong>说明：</strong> 下单后系统会自动为您生成一张“校服领取U号”。由于校服款式繁多，库房配货老师需按订单进行配货并熨烫，叫号呼叫后请前往柜台。
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center space-x-1 uppercase cursor-pointer"
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
                className="absolute inset-0 bg-black/60 z-30 flex items-end"
              >
                <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-white w-full rounded-t-3xl p-5 pb-8 space-y-4 border-t border-slate-200 shadow-xl"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      自助获取等候排号
                    </span>
                    <button 
                      onClick={() => setShowManualTicketModal(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleManualTicketSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block font-bold">排队类型</span>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-blue-600 flex items-center space-x-2">
                        {getQueueIcon(manualTicketType, "w-4 h-4 text-blue-600")}
                        <span>{getQueueName(manualTicketType)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center space-x-1 uppercase cursor-pointer"
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
      )}

      {/* ========================================================== */}
      {/* RIGHT: LCD Queue Calling Display Screen & IoT Simulation Remote */}
      {/* ========================================================== */}
      {showRight && (
        <div className="flex-1 min-w-[320px] max-w-md space-y-4 animate-fade-in">
          
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
              <div className="text-right flex items-center space-x-2">
                <button
                  onClick={() => setShowRemote(!showRemote)}
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-800 hover:border-slate-700 transition-all cursor-pointer font-bold shrink-0"
                  title="切换显示/隐藏大屏叫号测试遥控器"
                >
                  {showRemote ? "隐藏控制面板" : "模拟叫号遥控"}
                </button>
                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-950/40 tracking-widest shrink-0">
                  {currentTime || "09:00:00"}
                </span>
              </div>
            </div>

            {/* LED NOW CALLING STATE BOARD (正在呼叫大卡片) */}
            <div className="space-y-3">
              <div className="text-center py-1">
                <span className="text-[9px] bg-blue-950/80 text-blue-400 border border-blue-900/40 px-3 py-0.5 rounded-full font-black tracking-widest uppercase">
                  🔔 正在呼叫 / NOW CALLING
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {(() => {
                  const isCalledU = queueStatus?.currentCalled.U && queueStatus?.currentCalled.U !== "无" && queueStatus?.currentCalled.U !== "---";
                  const num = isCalledU ? queueStatus.currentCalled.U : "---";
                  
                  // Find the associated school name if available in history or waiting list
                  const matchedTicket = historyTickets.find(h => h.number === num) || queueStatus?.waitingList.U.find(t => t.number === num);
                  const schoolLabel = isCalledU ? (matchedTicket?.schoolName || "请携带手机至1号配货柜台") : "暂无呼叫号码";

                  return (
                    <div className={`relative overflow-hidden rounded-2xl p-3 border transition-all duration-300 flex items-center justify-between shadow-lg ${
                      isCalledU
                        ? "bg-[#040d21] border-blue-500 shadow-blue-950/20"
                        : "bg-[#02050c]/50 border-slate-900/60 opacity-60"
                    }`}>
                      {/* Left accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCalledU ? "bg-blue-500 animate-pulse" : "bg-slate-800"}`} />

                      <div className="flex items-center space-x-3 pl-1">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border shrink-0 ${
                          isCalledU ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-slate-950/50 border-slate-900/50 text-slate-600"
                        }`}>
                          <ShoppingBag size={18} />
                          <span className="text-[7.5px] font-black mt-0.5 leading-none">领配</span>
                        </div>

                        {/* Info */}
                        <div className="text-left">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">1号柜台 (校服发配)</span>
                            {isCalledU ? (
                              <span className="text-[8px] bg-red-950 text-red-400 border border-red-900/40 px-1.5 py-0.2 rounded font-black tracking-wider uppercase flex items-center space-x-1 animate-pulse">
                                <span className="h-1 w-1 rounded-full bg-red-400 animate-ping"></span>
                                <span>请到柜台</span>
                              </span>
                            ) : (
                              <span className="text-[8px] bg-slate-900 text-slate-500 px-1.5 py-0.2 rounded font-black tracking-wider">
                                空闲
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300 font-extrabold truncate max-w-[170px] block mt-0.5">
                            {schoolLabel}
                          </span>
                        </div>
                      </div>

                      {/* Calling Number */}
                      <div className="text-right flex items-center space-x-2 shrink-0">
                        <span className={`text-3xl font-black font-mono tracking-tighter ${
                          isCalledU ? "text-blue-400 text-shadow-blue animate-pulse" : "text-slate-700"
                        }`}>
                          {num}
                        </span>
                        {isCalledU && (
                          <button
                            onClick={() => speakCall(num, "U")}
                            className="w-7 h-7 rounded-full bg-blue-950 border border-blue-900/40 flex items-center justify-center text-blue-300 hover:bg-blue-900 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                            title="重播呼叫"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* LED WAITING QUEUE BOARD (等候队列卡片 - 与呼叫卡样式完全一致) */}
            <div className="space-y-3 mt-4 pt-4 border-t border-blue-950/40">
              <div className="text-center py-1 flex items-center justify-center space-x-2">
                <span className="text-[9px] bg-slate-900/80 text-slate-400 border border-slate-800 px-3 py-0.5 rounded-full font-black tracking-widest uppercase">
                  🕒 等候中号码 / WAITING IN LINE ({queueStatus?.waitingList.U.length || 0}人等候)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {queueStatus?.waitingList.U.length === 0 ? (
                  /* Empty/Idle waiting card with the SAME structure */
                  <div className="relative overflow-hidden rounded-2xl p-3 border border-slate-900/60 bg-[#02050c]/30 opacity-50 flex items-center justify-between shadow-inner">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-800" />
                    <div className="flex items-center space-x-3 pl-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-950/50 border border-slate-900/50 text-slate-700 flex flex-col items-center justify-center shrink-0">
                        <ShoppingBag size={18} />
                        <span className="text-[7.5px] font-black mt-0.5 leading-none">等候</span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-bold block">1号柜台 (校服发配)</span>
                        <span className="text-[11px] text-slate-400 font-extrabold block mt-0.5">暂无等候的家长</span>
                      </div>
                    </div>
                    <span className="text-3xl font-black font-mono tracking-tighter text-slate-800 pr-2">
                      ---
                    </span>
                  </div>
                ) : (
                  /* List of waiting cards with the EXACT SAME layout structure but labeled as "等候中" */
                  queueStatus?.waitingList.U.slice(0, 4).map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="relative overflow-hidden rounded-2xl p-3 border border-slate-800 bg-[#070e1d]/85 hover:border-slate-700 transition-all duration-300 flex items-center justify-between shadow-md"
                    >
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-600" />

                      <div className="flex items-center space-x-3 pl-1">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-855 text-slate-400 flex flex-col items-center justify-center shrink-0">
                          <ShoppingBag size={18} />
                          <span className="text-[7.5px] font-black mt-0.5 leading-none">领配</span>
                        </div>

                        {/* Info */}
                        <div className="text-left">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">1号柜台 (校服发配)</span>
                            <span className="text-[8px] bg-slate-900 text-slate-300 border border-slate-850 px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
                              等候中
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-300 font-extrabold truncate max-w-[170px] block mt-0.5">
                            {ticket.schoolName || "已绑定校服现货"}
                          </span>
                        </div>
                      </div>

                      {/* Waiting Number */}
                      <div className="text-right pr-2 shrink-0">
                        <span className="text-3xl font-black font-mono tracking-tighter text-slate-200">
                          {ticket.number}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {queueStatus?.waitingList.U && queueStatus.waitingList.U.length > 4 && (
                  <div className="text-center text-[9px] text-slate-500 font-bold tracking-widest uppercase bg-slate-950/20 py-1.5 rounded-lg border border-slate-900/30">
                    + 还有 {queueStatus.waitingList.U.length - 4} 个号码在后续队列中...
                  </div>
                )}
              </div>
            </div>

            {/* TV Bottom Bezel Support Stand mockup */}
            <div className="mt-2 text-center select-none text-slate-800 text-[8px] tracking-widest font-black">
              ────────── IoT SMART MONITOR PANEL ──────────
            </div>
          </div>

          {/* IOT SIMULATED REMOTE CONTROLLER DEVICE (大屏遥控调试器) */}
          {showRemote && (
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
                <span className="text-[9px] text-slate-400 font-black tracking-widest block uppercase px-0.5">一键触发下一位叫号 (模拟柜台办理)：</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { type: "U", name: "1号柜台领配" }
                  ].map(call => (
                    <button
                      key={call.type}
                      onClick={() => onCallNext(call.type as any)}
                      className="bg-slate-950 border border-slate-850 hover:border-blue-500 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-black hover:bg-blue-950/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {getQueueIcon(call.type as any, "w-4 h-4 text-blue-400")}
                      <span>呼叫下一位 ({call.name})</span>
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
                    {(["U"] as const).map(type => {
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
                                领取
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
          )}

        </div>
      )}

    </div>
  );
}
