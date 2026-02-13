import { useState, useEffect, useRef } from 'react';
import { utils, writeFile } from 'xlsx';

import { motion, AnimatePresence } from 'framer-motion';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type {
  GuestPayment,
} from '../types/guestPayment';

interface MasterGuest {
  id: string;
  fullName: string;
  title?: string;
  address?: string;
}
import {
  CATEGORIES,
  PAYMENT_METHODS,
  CURRENCIES,
  convertToUSD,
  // getCategoryColor
} from '../types/guestPayment';
import {
  Plus,
  Trash2,
  Pencil,
  DollarSign,
  Users,
  Banknote,
  // Wallet,
  Search,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  Trophy,
  Send,

  TrendingUp,
  PieChart,
  MapPin,
  RefreshCw,
  Printer,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '../components/ui/drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";

import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

export default function GuestPaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [guests, setGuests] = useState<GuestPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<GuestPayment | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterCurrency, setFilterCurrency] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [masterGuests, setMasterGuests] = useState<MasterGuest[]>([]);
  const [suggestions, setSuggestions] = useState<MasterGuest[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: 'Family' as GuestPayment['category'],
    paymentMethod: 'Cash' as GuestPayment['paymentMethod'],
    currency: 'USD' as GuestPayment['currency'],
    amount: '',
    note: '',
  });
  const [paymentMethodOptions] = useState<string[]>([...PAYMENT_METHODS]);
  const [isCustomPaymentMethod, setIsCustomPaymentMethod] = useState(false);
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");

  const getPaymentMethodStyles = (method: string) => {
    switch (method) {
      case 'Cash': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'ABA Bank': return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' };
      case 'ACLEDA Bank': return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600' };
      case 'Wing': return { bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' };
      default: return { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
    }
  };

  const handleLogout = async () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      toast.success("✅ ចាកចេញបានជោគជ័យ!");
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("❌ មិនអាចចាកចេញបានទេ។");
    }
  };

  // Fetch guests from Firestore
  useEffect(() => {
    if (user) {
      fetchGuests();
      fetchMasterGuests();
    }
  }, [user]);

  const fetchMasterGuests = async () => {
    try {
      const q = query(collection(db, 'guests'), orderBy('fullName', 'asc'));
      const querySnapshot = await getDocs(q);
      const guestData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MasterGuest[];
      setMasterGuests(guestData);
    } catch (error) {
      console.error('Error fetching master guests:', error);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const fetchGuests = async () => {
    try {
      const q = query(collection(db, 'guestPayments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const guestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as GuestPayment[];
      setGuests(guestsData);
    } catch (error) {
    //   console.error('Error fetching guests:', error);
      toast.error('មិនអាចទាញយកបញ្ជីភ្ញៀវបានទេ។');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) {
      toast.error('សូមបំពេញព័ត៌មានដែលចាំបាច់');
      return;
    }

    // Handle custom payment method
    let finalPaymentMethod = formData.paymentMethod;
    if (isCustomPaymentMethod && customPaymentMethod.trim()) {
        finalPaymentMethod = customPaymentMethod.trim() as any;
    }

    try {
      setIsSubmitting(true);
      const guestData = {
        name: formData.name,
        location: formData.location || null,
        category: formData.category,
        paymentMethod: finalPaymentMethod,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        note: formData.note || null,
        updatedAt: Timestamp.now(),
      };

      if (editingGuestId) {
        await updateDoc(doc(db, 'guestPayments', editingGuestId), guestData);
        toast.success(`ធ្វើបច្ចុប្បន្នភាពរួចរាល់៖ ${guestData.name}`, {
          description: `ចំនួនទឹកប្រាក់៖ ${guestData.currency === 'USD' ? '$' : '៛'}${guestData.amount.toLocaleString()}`,
          icon: <CheckCircle2 className="text-blue-500" size={20} />,
        });
        setShowAddModal(false);
      } else {
        await addDoc(collection(db, 'guestPayments'), {
          ...guestData,
          createdAt: Timestamp.now(),
        });
        toast.success(`បន្ថែមជោគជ័យ៖ ${guestData.name}`, {
          description: `ចំនួនទឹកប្រាក់៖ ${guestData.currency === 'USD' ? '$' : '៛'}${guestData.amount.toLocaleString()}`,
          icon: <CheckCircle2 className="text-green-500" size={20} />,
        });
      }
      resetForm();
      fetchGuests();
      // Auto focus back to name input
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Error adding/updating guest:', error);
      toast.error('មានបញ្ហាជាមួយទិន្នន័យ។');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (guest: GuestPayment) => {
    setFormData({
      name: guest.name,
      location: guest.location || '',
      category: guest.category,
      paymentMethod: guest.paymentMethod,
      currency: guest.currency,
      amount: guest.amount.toString(),
      note: guest.note || '',
    });
    // Check if the payment method is custom
    if (!PAYMENT_METHODS.includes(guest.paymentMethod)) {
      setIsCustomPaymentMethod(true);
      setCustomPaymentMethod(guest.paymentMethod);
    } else {
      setIsCustomPaymentMethod(false);
      setCustomPaymentMethod("");
    }
    setEditingGuestId(guest.id);
    setShowAddModal(true);
  };

  const handleDeleteGuest = async (payment: GuestPayment) => {
    setPaymentToDelete(payment);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    try {
      setDeletingId(paymentToDelete.id);
      await deleteDoc(doc(db, 'guestPayments', paymentToDelete.id));
      toast.success('លុបទិន្នន័យបានជោគជ័យ');
      fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('មិនអាចលុបទិន្នន័យបានទេ។');
    } finally {
      setDeletingId(null);
      setPaymentToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      category: 'Family',
      paymentMethod: 'Cash',
      currency: 'USD',
      amount: '',
      note: '',
    });
    setEditingGuestId(null);
    setIsCustomPaymentMethod(false);
    setCustomPaymentMethod("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    try {
      // 1. Prepare data with Khmer headers
      const dataToExport = filteredGuests.map((guest, index) => ({
        'ល.រ': index + 1,
        'ឈ្មោះពេញ': guest.name,
        'ត្រូវជា?': guest.category,
        'អាសយដ្ឋាន/ទីកន្លែង': guest.location || 'N/A',
        'វិធីចងដៃ': guest.paymentMethod,
        'រូបិយប័ណ្ណ': guest.currency,
        'ចំនួនទឹកប្រាក់': guest.amount,
        'ចំណាំ': guest.note || ''
      }));

      // 2. Create worksheet and workbook
      const ws = utils.json_to_sheet(dataToExport);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'បញ្ជីចំណងដៃ');

      // 3. Set column widths for better readability
      const wscols = [
        { wch: 6 },  // No.
        { wch: 25 }, // Name
        { wch: 15 }, // Category
        { wch: 25 }, // Location
        { wch: 20 }, // Payment Method
        { wch: 10 }, // Currency
        { wch: 15 }, // Amount
        { wch: 30 }, // Note
      ];
      ws['!cols'] = wscols;

      // 4. Generate filename with current date
      const date = new Date().toLocaleDateString('km-KH').replace(/\//g, '-');
      writeFile(wb, `របាយការណ៍ចំណងដៃ_${date}.xlsx`);
      
      toast.success('ទាញយកឯកសារ Excel រួចរាល់');
    } catch (error) {
      console.error('Error exporting excel:', error);
      toast.error('មានបញ្ហាក្នុងការទាញយកឯកសារ Excel');
    }
  };

  const handleSendThanks = (guest: GuestPayment) => {
    const amountStr = `${guest.currency === 'USD' ? '$' : '៛'}${guest.amount.toLocaleString()}`;
    const message = `សូមអរគុណលោក ${guest.name} ដែលបានចូលរួមកម្មវិធីមង្គលការ និងផ្តល់កិត្តិយសជាចំណងដៃចំនួន ${amountStr}។ សូមជូនពរសុខភាពល្អ សំណាងល្អ និងជោគជ័យគ្រប់ភារកិច្ច! 🙏✨`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://t.me/share/url?url=${encodedMsg}`, '_blank');
  };

  const handleNameChange = (val: string) => {
    setFormData({ ...formData, name: val });
    
    if (val.trim().length > 0) {
      const filtered = masterGuests.filter(g => 
        g.fullName.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectGuest = (guest: MasterGuest) => {
    setFormData({
      ...formData,
      name: guest.fullName,
      location: guest.address || formData.location,
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Calculate totals
  const filteredGuests = guests.filter((guest) => {
    const categoryMatch = filterCategory === 'All' || guest.category === filterCategory;
    const currencyMatch = filterCurrency === 'All' || guest.currency === filterCurrency;
    const searchMatch = searchQuery.trim() === '' || 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.location && guest.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && currencyMatch && searchMatch;
  });

  const totalUSD = filteredGuests
    .filter((g) => g.currency === 'USD')
    .reduce((sum, g) => sum + g.amount, 0);

  const totalKHR = filteredGuests
    .filter((g) => g.currency === 'KHR')
    .reduce((sum, g) => sum + g.amount, 0);

  const avgUSD = filteredGuests.filter(g => g.currency === 'USD').length > 0 
    ? totalUSD / filteredGuests.filter(g => g.currency === 'USD').length 
    : 0;
    
  const avgKHR = filteredGuests.filter(g => g.currency === 'KHR').length > 0 
    ? totalKHR / filteredGuests.filter(g => g.currency === 'KHR').length 
    : 0;

  // Find top category
  const categoryTotals = filteredGuests.reduce((acc, guest) => {
    const val = guest.currency === 'USD' ? guest.amount : convertToUSD(guest.amount, 'KHR');
    acc[guest.category] = (acc[guest.category] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const dateStr = new Date().toLocaleDateString('km-KH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const grandTotalUSD = totalUSD + convertToUSD(totalKHR, 'KHR');

  return (
    <div className="min-h-screen bg-slate-50/50 p-2 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              បញ្ជីចំណងដៃ
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">កត់ត្រា និងគ្រប់គ្រងថវិកាចំណងដៃសម្រាប់មង្គលការ</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-base transition-all rounded-xl shadow-sm cursor-pointer"
            >
              <LayoutDashboard size={20} className="text-primary" />
              ផ្ទាំងគ្រប់គ្រង
            </Button>
            
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-base transition-all rounded-xl shadow-sm cursor-pointer"
            >
              <Printer size={20} className="text-secondary" />
              បោះពុម្ព
            </Button>

            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-base transition-all rounded-xl shadow-sm cursor-pointer"
            >
              <FileSpreadsheet size={20} className="text-emerald-500" />
              ទាញយក Excel
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="h-12 px-6 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 flex items-center gap-2.5 font-bold text-base transition-all rounded-xl shadow-sm cursor-pointer"
            >
              <LogOut size={20} />
              ចាកចេញ
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Total Guests Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-8 min-h-[140px] border border-primary/10 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">ភ្ញៀវសរុប</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{filteredGuests.length}</span>
                  <span className="text-slate-400 text-sm font-semibold">នាក់</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                <Users className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>

          {/* USD Total Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-8 min-h-[140px] border border-secondary/10 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">សរុបដុល្លារ</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-secondary text-base font-black">$</span>
                  <span className="text-3xl md:text-2xl font-black text-slate-900 tracking-tight">{totalUSD.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center shadow-inner">
                <DollarSign className="w-7 h-7 text-secondary" />
              </div>
            </div>
          </div>

          {/* KHR Total Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-8 min-h-[140px] border border-amber-50 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">សរុបប្រាក់រៀល</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-amber-600 text-base font-black">៛</span>
                  <span className="text-2xl md:text-2xl font-black text-slate-900 tracking-tight">{totalKHR.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                <Banknote className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Average Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-8 min-h-[140px] border border-blue-50 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">មធ្យមភាគចំណងដៃ</p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-secondary text-xs font-bold">$</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight">{avgUSD.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-amber-600 text-xs font-bold">៛</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight">{avgKHR.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Top Category Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-8 min-h-[140px] border border-purple-50 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">សកម្មបំផុត</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{topCategory}</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                <PieChart className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
          {/* Grand Total Card */}
          <div className="relative overflow-hidden bg-primary rounded-2xl p-8 min-h-[140px] shadow-lg shadow-primary/20 transition-all hover:shadow-xl group flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center justify-between text-white">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">សរុបរួម (USD)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-white/80 text-base font-bold">$</span>
                  <span className="text-4xl font-black text-white tracking-tight">
                    {grandTotalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm">
                <Trophy className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-primary/10 shadow-sm">
          <div className="relative flex-1 w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ ឬអាសយដ្ឋាន..."
              className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center justify-end">
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white text-slate-700 text-sm font-bold px-5 h-12 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer shadow-none"
              >
                <option value="All">គ្រប់ប្រភេទ</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="bg-white text-slate-700 text-sm font-bold px-5 h-12 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer shadow-none"
              >
                <option value="All">គ្រប់រង្វង់ប្រាក់</option>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm whitespace-nowrap cursor-pointer"
            >
              <Plus className="mr-2.5" size={20} />
              បន្ថែមការកត់ត្រា
            </Button>
          </div>
        </div>

        {/* Guest List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-amber-700 font-medium tracking-widest text-xs uppercase animate-pulse">កំពុងទាញយកទិន្នន័យ...</p>
          </div>
        ) : (
          <div className="bg-white border border-primary/20 rounded-2xl shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader className="bg-primary/5">
                   <TableRow className="hover:bg-transparent border-primary/10">
                     <TableHead className="text-primary font-black text-sm uppercase px-4 py-6 text-center w-[60px]">ល.រ</TableHead>
                     <TableHead className="text-primary font-black text-sm uppercase px-6 py-6">ឈ្មោះពេញ</TableHead>
                     <TableHead className="text-primary font-black text-sm uppercase py-6">ត្រូវជា?/ទីកន្លែង</TableHead>
                     <TableHead className="text-primary font-black text-sm uppercase py-6">មធ្យោបាយចងដៃ</TableHead>
                     <TableHead className="text-primary font-black text-sm uppercase py-6">ចំនួនទឹកប្រាក់</TableHead>
                     <TableHead className="text-primary font-black text-sm uppercase py-6 text-right px-8">សកម្មភាព</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   <AnimatePresence mode="popLayout">
                     {filteredGuests.map((guest, index) => (
                       <TableRow key={guest.id} className="hover:bg-primary/[0.02] transition-colors border-primary/5 group">
                         <TableCell className="text-slate-400 font-bold px-4 py-5 text-center font-mono">
                           {(index + 1).toString().padStart(2, '0')}
                         </TableCell>
                         <TableCell className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">{guest.name}</span>
                              {guest.note && <span className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">"{guest.note}"</span>}
                            </div>
                         </TableCell>
                         <TableCell className="py-5">
                            <div className="flex flex-col gap-1">
                               <span className="text-xs font-bold text-primary uppercase tracking-wider">{guest.category}</span>
                               {guest.location && (
                                 <div className="flex items-center gap-1 opacity-60">
                                   <MapPin size={10} />
                                   <span className="text-[10px] font-medium">{guest.location}</span>
                                 </div>
                               )}
                            </div>
                         </TableCell>
                         <TableCell className="py-5">
                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border w-fit ${getPaymentMethodStyles(guest.paymentMethod).bg}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${getPaymentMethodStyles(guest.paymentMethod).dot}`} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{guest.paymentMethod}</span>
                            </div>
                         </TableCell>
                         <TableCell className="py-5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs font-black">{guest.currency === 'USD' ? '$' : '៛'}</span>
                              <span className="text-lg font-black text-slate-900 tracking-tight">
                                {guest.amount.toLocaleString()}
                              </span>
                            </div>
                         </TableCell>
                         <TableCell className="text-right px-8 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSendThanks(guest)}
                                title="ផ្ញើសារអរគុណ"
                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all active:scale-90 cursor-pointer border border-emerald-100 shadow-sm"
                              >
                                <Send size={16} />
                              </button>
                              <button
                                onClick={() => handleEditClick(guest)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-90 cursor-pointer border border-slate-100"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteGuest(guest)}
                                disabled={deletingId === guest.id}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90 cursor-pointer border border-slate-100 disabled:opacity-50"
                              >
                                {deletingId === guest.id ? (
                                  <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                         </TableCell>
                       </TableRow>
                     ))}
                   </AnimatePresence>
                 </TableBody>
               </Table>
             </div>
          </div>
        )}

        {filteredGuests.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-primary/10 rounded-2xl shadow-sm mt-4"
          >
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-lg italic">រកមិនឃើញទិន្នន័យដែលអ្នកស្វែងរកទេ</p>
            <Button 
              onClick={() => setSearchQuery("")} 
              variant="outline" 
              className="mt-6 h-11 px-8 rounded-xl border-slate-200"
            >
              បង្ហាញទាំងអស់ឡើងវិញ
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Guest Drawer */}
      <Drawer open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) resetForm();
      }}>
        <DrawerContent className="bg-white max-w-2xl mx-auto rounded-t-2xl border-t border-slate-100">
          <DrawerHeader className="border-b border-slate-100 pb-4">
            <DrawerTitle className="text-lg font-bold text-slate-900">
              {editingGuestId ? 'កែសម្រួលការកត់ត្រា' : 'បន្ថែមការកត់ត្រាថ្មី'}
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <form id="guest-form" onSubmit={handleAddGuest} className="space-y-4 text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2.5 relative">
                  <Label className="text-base font-bold text-slate-700 ml-1">ឈ្មោះអ្នកចូលរួម *</Label>
                  <Input
                    ref={nameInputRef}
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => formData.name && handleNameChange(formData.name)}
                    className="h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 text-base focus:border-primary transition-all shadow-none rounded-xl"
                    placeholder="វាយឈ្មោះភ្ញៀវ..."
                    required
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddGuest(e); }}
                  />
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 overflow-hidden"
                    >
                      {suggestions.map((guest) => (
                        <button
                          key={guest.id}
                          type="button"
                          onClick={() => selectGuest(guest)}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="font-bold text-slate-900">{guest.fullName}</div>
                          {guest.address && (
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {guest.address}
                            </div>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-base font-bold text-slate-700 ml-1">អាសយដ្ឋាន/ទីកន្លែង</Label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 text-base focus:border-primary transition-all shadow-none rounded-xl"
                    placeholder="ឧទាហរណ៍៖ រាជធានីភ្នំពេញ"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddGuest(e); }}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-base font-bold text-slate-700 ml-1">ត្រូវជា? *</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 text-base text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-base font-bold text-slate-700 ml-1">
                      {isCustomPaymentMethod ? "មធ្យោបាយបង់ប្រាក់ថ្មី" : "មធ្យោបាយបង់ប្រាក់ *"}
                  </Label>
                  {isCustomPaymentMethod ? (
                      <div className="animate-in fade-in slide-in-from-top-1">
                          <Input 
                              value={customPaymentMethod}
                              onChange={(e) => setCustomPaymentMethod(e.target.value)}
                              placeholder="បញ្ចូលមធ្យោបាយបង់ប្រាក់..."
                              className="h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 text-base focus:border-primary transition-all shadow-none rounded-xl"
                          />
                      </div>
                  ) : (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button type="button" variant="outline" className="w-full justify-between flex items-center gap-2 h-12 px-4 bg-white border-slate-300 hover:bg-slate-50 transition-colors text-base font-normal text-slate-900 shadow-none cursor-pointer rounded-xl">
                                  <span className="truncate">{formData.paymentMethod}</span>
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto bg-white border-slate-200 text-slate-700">
                              <DropdownMenuRadioGroup value={formData.paymentMethod} onValueChange={(val) => setFormData({...formData, paymentMethod: val as any})}>
                                  {paymentMethodOptions.map((method) => (
                                      <DropdownMenuRadioItem key={method} value={method} className="py-2.5 text-sm hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                                          {method}
                                      </DropdownMenuRadioItem>
                                  ))}
                                  <DropdownMenuRadioItem value="custom" className="py-2.5 text-primary font-bold border-t border-slate-100 text-sm hover:bg-slate-50 focus:bg-slate-50 cursor-pointer" 
                                      onClick={() => setIsCustomPaymentMethod(true)}>
                                      <Plus className="w-4 h-4 mr-2" />
                                      បន្ថែមថ្មី...
                                  </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-base font-bold text-slate-700 ml-1">រូបិយប័ណ្ណ *</Label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 text-base text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer"
                    required
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-base font-bold text-slate-700 ml-1">ចំនួនទឹកប្រាក់ *</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-base">
                      {formData.currency === 'USD' ? '$' : '៛'}
                    </span>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="h-12 pl-10 pr-5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 text-lg font-black focus:border-primary transition-all shadow-none rounded-xl"
                      placeholder="0.00"
                      required
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddGuest(e); }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Label className="text-base font-bold text-slate-700 ml-1">កំណត់ចំណាំ</Label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-primary transition-all resize-none shadow-none min-h-[100px]"
                  placeholder="បន្ថែមចំណាំផ្សេងៗ..."
                  rows={3}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleAddGuest(e); }}
                />
              </div>
            </form>
          </div>

          <DrawerFooter className="border-t border-slate-50 p-6 flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1 h-11 rounded-xl border-slate-200 text-slate-400 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest shadow-none cursor-pointer"
            >
              បោះបង់
            </Button>
            <Button
              type="submit"
              form="guest-form"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-11 rounded-xl shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editingGuestId ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'កំពុងរក្សាទុក...'}
                </div>
              ) : (
                editingGuestId ? 'ធ្វើបច្ចុប្បន្នភាព' : 'រក្សាទុកទិន្នន័យ'
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .print-no { visibility: hidden !important; display: none !important; }
          
          /* Report Styling */
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .report-title {
            font-size: 28px;
            font-weight: 900;
            color: #000;
            margin-bottom: 5px;
          }
          .report-date {
            font-size: 14px;
            color: #666;
            font-style: italic;
          }
          .summary-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
          }
          .summary-table td {
            padding: 10px;
            border: 1px solid #ddd;
          }
          .summary-label {
            font-weight: bold;
            background: #f9f9f9;
            width: 30%;
          }
          .payment-table {
            width: 100%;
            border-collapse: collapse;
          }
          .payment-table th {
            background: #eee;
            padding: 12px 8px;
            border: 1px solid #000;
            font-weight: 900;
            text-align: left;
            font-size: 12px;
          }
          .payment-table td {
            padding: 10px 8px;
            border: 1px solid #000;
            font-size: 12px;
          }
        }
      `}</style>

      {/* Hidden Print Content */}
      <div className="hidden print:block print-section">
        <div className="report-header">
          <div className="report-title">របាយការណ៍កត់ត្រាចំណងដៃ</div>
          <div className="report-date">កាលបរិច្ឆេទ៖ {dateStr}</div>
        </div>

        <table className="summary-table">
            <tbody>
                <tr>
                    <td className="summary-label">ចំនួនភ្ញៀវសរុប</td>
                    <td>{filteredGuests.length} នាក់</td>
                </tr>
                <tr>
                    <td className="summary-label">សរុបដុល្លារ</td>
                    <td style={{ fontWeight: 'bold', color: '#000' }}>$ {totalUSD.toLocaleString()}</td>
                </tr>
                <tr>
                    <td className="summary-label">សរុបប្រាក់រៀល</td>
                    <td style={{ fontWeight: 'bold', color: '#000' }}>៛ {totalKHR.toLocaleString()}</td>
                </tr>
                <tr>
                    <td className="summary-label">សរុបជាដុល្លារ (រួមបញ្ចូល)</td>
                    <td style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb' }}>$ {grandTotalUSD.toLocaleString()}</td>
                </tr>
            </tbody>
        </table>

        <table className="payment-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>ល.រ</th>
              <th style={{ width: '25%' }}>ឈ្មោះភ្ញៀវ</th>
              <th style={{ width: '20%' }}>អាសយដ្ឋាន/ទំនាក់ទំនង</th>
              <th style={{ width: '15%' }}>ទឹកប្រាក់</th>
              <th style={{ width: '15%' }}>ប្រភេទ</th>
              <th style={{ width: '20%' }}>សម្គាល់</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest, idx) => (
              <tr key={guest.id}>
                <td>{idx + 1}</td>
                <td style={{ fontWeight: 'bold' }}>{guest.name}</td>
                <td>{guest.location || '-'}</td>
                <td style={{ fontWeight: 'bold' }}>
                  {guest.currency === 'USD' ? '$' : '៛'} {guest.amount.toLocaleString()}
                </td>
                <td>{guest.category}</td>
                <td>{guest.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: '40px', textAlign: 'right', fontSize: '12px' }}>
          <p>បោះពុម្ពដោយស្វ័យប្រវត្តិពីប្រព័ន្ធគ្របគ្រងមង្គលការ</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>តើអ្នកពិតជាចង់ចាកចេញមែនទេ?</AlertDialogTitle>
            <AlertDialogDescription>
              អ្នកនឹងត្រូវបានចាកចេញពីគណនី ហើយត្រឡប់ទៅកាន់ទំព័រចូលប្រើប្រាស់វិញ។
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>បោះបង់</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              ចាកចេញ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?</AlertDialogTitle>
            <AlertDialogDescription>
              ការលុបនេះនឹងដកព័ត៌មានចំណងដៃរបស់ <b>{paymentToDelete?.name}</b> ចេញពីបញ្ជីជាអចិន្ត្រៃយ៍។
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>បោះបង់</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePayment}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              លុបទិន្នន័យ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
