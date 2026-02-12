import { useState, useEffect } from 'react';
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
  Filter,
  X,
  Banknote,
  // Wallet,
  Search,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  Trophy,
  History,
  MapPin
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '../components/ui/drawer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

export default function GuestPaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [guests, setGuests] = useState<GuestPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterCurrency, setFilterCurrency] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleLogout = async () => {
    try {
      if (confirm("Are you sure you want to logout?")) {
        await signOut(auth);
        toast.success("✅ Logged out successfully!");
      }
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("❌ Failed to log out");
    }
  };

  // Fetch guests from Firestore
  useEffect(() => {
    if (user) {
      fetchGuests();
    }
  }, [user]);

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
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const guestData = {
        name: formData.name,
        location: formData.location || null,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        note: formData.note || null,
        updatedAt: Timestamp.now(),
      };

      if (editingGuestId) {
        await updateDoc(doc(db, 'guestPayments', editingGuestId), guestData);
        toast.success(`Updated: ${guestData.name}`, {
          description: `Amount: ${guestData.currency === 'USD' ? '$' : '៛'}${guestData.amount.toLocaleString()}`,
          icon: <CheckCircle2 className="text-blue-500" size={20} />,
        });
        setShowAddModal(false);
      } else {
        await addDoc(collection(db, 'guestPayments'), {
          ...guestData,
          createdAt: Timestamp.now(),
        });
        toast.success(`Added: ${guestData.name}`, {
          description: `Received ${guestData.currency === 'USD' ? '$' : '៛'}${guestData.amount.toLocaleString()} via ${guestData.paymentMethod}`,
          duration: 5000,
          icon: <CheckCircle2 className="text-green-500" size={20} />,
        });
      }

      resetForm();
      fetchGuests();
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error(editingGuestId ? 'Failed to update guest' : 'Failed to add guest');
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
    setEditingGuestId(guest.id);
    setShowAddModal(true);
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      await deleteDoc(doc(db, 'guestPayments', id));
      toast.success('Guest deleted successfully');
      fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Failed to delete guest');
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

  const grandTotalUSD = totalUSD + convertToUSD(totalKHR, 'KHR');

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/20 blur-[120px] rounded-full" />
      </div>

      <style>{`
        .golden-metallic-text {
          background: linear-gradient(to bottom, #BF953F 0%, #8A6E2F 22%, #BF953F 50%, #8A6E2F 78%, #BF953F 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
        }
        .premium-border {
          border: 1px solid rgba(191, 149, 63, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .light-premium-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(191, 149, 63, 0.15);
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 golden-metallic-text" style={{ fontFamily: 'Taprom' }}>
              បតីទាន - Guest Payment Tracker
            </h1>
            <p className="text-amber-800/60 font-medium tracking-wide uppercase text-[10px]">Royal Wedding Collection Portfolio</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="bg-white/80 border-amber-200 text-amber-900 hover:bg-amber-50 hover:text-amber-700 backdrop-blur-md rounded-xl transition-all shadow-sm"
            >
              <LayoutDashboard className="mr-2" size={18} />
              Guest Management
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 backdrop-blur-md rounded-xl shadow-sm transition-all"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white premium-border rounded-2xl p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-amber-800/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Guests</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-800">{filteredGuests.length}</h3>
                  <span className="text-[10px] text-amber-800/40 font-medium tracking-tighter uppercase">Recorded</span>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white premium-border rounded-2xl p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-amber-800/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total USD</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  <span className="text-amber-600 text-xl font-medium mr-1">$</span>
                  {totalUSD.toLocaleString()}
                </h3>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white premium-border rounded-2xl p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-amber-800/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total KHR</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  <span className="text-amber-600 text-xl font-medium mr-1">៛</span>
                  {totalKHR.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <Banknote className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 relative overflow-hidden border-2 border-amber-200 group shadow-[0_10px_30px_rgba(191,149,63,0.1)] hover:translate-y-[-4px] transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-amber-700 text-[10px] font-black uppercase tracking-widest mb-1">Grand Total</p>
                <h3 className="text-3xl font-bold text-amber-900 group-hover:scale-105 transition-all">
                  <span className="text-xl font-medium mr-1">$</span>
                  {grandTotalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl border border-amber-200">
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 premium-border backdrop-blur-md rounded-2xl p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800/30" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection ledger..."
                className="w-full bg-white text-slate-800 rounded-xl pl-12 pr-4 py-4 border border-amber-100 placeholder-amber-800/20 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-800/30 hover:text-amber-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-amber-50/50 px-4 py-2 rounded-lg border border-amber-100">
                <Filter size={16} className="text-amber-600/60" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-amber-900 text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-amber-50/50 px-4 py-2 rounded-lg border border-amber-100">
                <History size={16} className="text-amber-600/60" />
                <select
                  value={filterCurrency}
                  onChange={(e) => setFilterCurrency(e.target.value)}
                  className="bg-transparent text-amber-900 text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All">All Currencies</option>
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-[#BF953F] to-[#FCF6BA] hover:from-[#8A6E2F] hover:to-[#BF953F] text-amber-900 font-bold px-8 h-12 rounded-xl shadow-[0_4px_15px_rgba(191,149,63,0.15)] transition-all active:scale-95"
            >
              <Plus className="mr-2" size={20} />
              Add Collection Record
            </Button>
          </div>
        </motion.div>

        {/* Guest List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-amber-700 font-medium tracking-widest text-xs uppercase animate-pulse">Consulting Ledger...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredGuests.map((guest, index) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white premium-border rounded-2xl p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-b-4 border-b-amber-500/20"
                >
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                          #{filteredGuests.length - index}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors" style={{ fontFamily: 'Taprom' }}>{guest.name}</h3>
                      </div>
                      {guest.location && (
                        <p className="text-amber-700/50 text-[10px] font-bold uppercase tracking-widest ml-10 flex items-center gap-1.5">
                          <MapPin size={12} /> {guest.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(guest)}
                        className="p-2 text-amber-700/30 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg inline-block mb-5">
                    {guest.category}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-amber-900/20">
                      <span>Via {guest.paymentMethod}</span>
                      <History size={12} className="opacity-30" />
                    </div>
                    <div className="flex justify-between items-center bg-[#FDFBF7] p-3 rounded-xl border border-amber-100/50">
                      <span className="text-amber-800/30 text-[9px] font-black uppercase tracking-[0.1em]">Amount Received</span>
                      <span className="text-2xl font-bold text-slate-800">
                        <span className="text-amber-600 text-base font-medium mr-1.5">{guest.currency === 'USD' ? '$' : '៛'}</span>
                        {guest.amount.toLocaleString()}
                      </span>
                    </div>
                    {guest.note && (
                      <div className="bg-amber-50/30 border-l-2 border-amber-200 p-2.5 rounded-r-lg">
                        <p className="text-amber-800/60 text-[11px] italic leading-relaxed font-medium">“{guest.note}”</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredGuests.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Users className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-xl">No guests found</p>
            <p className="text-gray-400 mt-2">Add your first guest to get started!</p>
          </motion.div>
        )}
      </div>

      {/* Add Guest Drawer */}
      <Drawer open={showAddModal} onOpenChange={setShowAddModal}>
        <DrawerContent className="bg-slate-900 border-white/10 text-white max-w-2xl mx-auto">
          <DrawerHeader className="border-b border-white/5 pb-4">
            <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {editingGuestId ? 'Edit Guest' : 'Add New Guest'}
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <form id="guest-form" onSubmit={handleAddGuest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Guest name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Location (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [&>option]:bg-slate-900"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [&>option]:bg-slate-900"
                    required
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Currency *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [&>option]:bg-slate-900"
                    required
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      {formData.currency === 'USD' ? '$' : '៛'}
                    </span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Note</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </form>
          </div>

          <DrawerFooter className="border-t border-white/5 p-6 flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="guest-form"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 rounded-xl shadow-lg shadow-purple-500/20"
            >
              {editingGuestId ? 'Update Guest' : 'Add Guest'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
