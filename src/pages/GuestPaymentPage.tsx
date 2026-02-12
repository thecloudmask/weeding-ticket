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
  getCategoryColor
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
  Wallet,
  Search,
  LogOut,
  LayoutDashboard,
  CheckCircle2
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Guest Payment Tracker
            </h1>
            <p className="text-gray-300">Track wedding guest contributions with ease</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LayoutDashboard className="mr-2" size={20} />
              Guest Management
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-500/80 hover:bg-red-600 text-white shadow-lg"
            >
              <LogOut className="mr-2" size={20} />
              Logout
            </Button>
          </div>
        </motion.div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Guests</p>
                <h3 className="text-3xl font-bold text-white">{filteredGuests.length}</h3>
              </div>
              <Users className="w-12 h-12 text-indigo-100 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total USD</p>
                <h3 className="text-3xl font-bold text-white">${totalUSD.toLocaleString()}</h3>
              </div>
              <DollarSign className="w-12 h-12 text-green-100 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total KHR</p>
                <h3 className="text-3xl font-bold text-white">
                  ៛{totalKHR.toLocaleString()}
                </h3>
              </div>
              <Banknote className="w-12 h-12 text-blue-100 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Grand Total</p>
                <h3 className="text-3xl font-bold text-white">
                  ${grandTotalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </h3>
              </div>
              <Wallet className="w-12 h-12 text-purple-100 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-xl"
        >
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full bg-white/20 text-white rounded-lg pl-12 pr-4 py-3 border border-white/30 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filters and Add Button */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <Filter className="text-white" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white/20 text-white rounded-lg px-4 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="bg-white/20 text-white rounded-lg px-4 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Currencies</option>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            >
              <Plus className="mr-2" size={20} />
              Add Guest
            </Button>
          </div>
        </motion.div>

        {/* Guest List */}
        {loading ? (
          <div className="text-center text-white text-xl py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredGuests.map((guest, index) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono bg-white/20 text-white/70 px-2 py-0.5 rounded">
                          #{filteredGuests.length - index}
                        </span>
                        <h3 className="text-xl font-bold text-white">{guest.name}</h3>
                      </div>
                      {guest.location && (
                        <p className="text-gray-300 text-sm">{guest.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(guest)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className={`${getCategoryColor(guest.category)} text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3`}>
                    {guest.category}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Payment:</span>
                      <span className="text-white font-medium">{guest.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Amount:</span>
                      <span className="text-2xl font-bold text-white">
                        {guest.currency === 'USD' ? '$' : '៛'}
                        {guest.amount.toLocaleString()}
                      </span>
                    </div>
                    {guest.note && (
                      <p className="text-gray-400 text-xs italic mt-2">{guest.note}</p>
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
