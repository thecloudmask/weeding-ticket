import { collection, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import GuestForm from "@/components/GuestForm";
import EditGuestModal from "@/components/EditGuestModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { LogOut, Wallet, Search, RefreshCw, Copy, Trash2, Pencil, Users, UserCheck, CheckCircle2, UserX, History, Eye, EyeOff, Quote } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
interface Guest {
    id: string;
    fullName: string;
    title?:string;
    email?:string;
    phone?:string;
    address?:string;
    status?: 'attending' | 'declined' | 'pending' | 'viewed';
    declineReason?: string;
    wishes?: string;
}

export default function HomePage() {
    const navigate = useNavigate();
    const [guests, setGuests] = useState<Guest[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
    const [paidNames, setPaidNames] = useState<Set<string>>(new Set());
    const [showSummary, setShowSummary] = useState(true);
    
    useEffect(() => {
        setFetching(true);
        // Subscribe to guests collection
        const unsubscribeGuests = onSnapshot(collection(db, "guests"), 
            (snapshot) => {
                const guestsData: Guest[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Guest));
                setGuests(guestsData);
                setFetching(false);
            },
            (err) => {
                console.error("Error fetching guests:", err);
                setError("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
                setFetching(false);
            }
        );

        // Subscribe to payments collection
        const unsubscribePayments = onSnapshot(collection(db, "guestPayments"), 
            (snapshot) => {
                const names = new Set(snapshot.docs.map(doc => doc.data().name));
                setPaidNames(names);
            },
            (err) => console.error("Error syncing payments:", err)
        );

        return () => {
            unsubscribeGuests();
            unsubscribePayments();
        };
    }, []);

    const handleGuestAdded = (newGuest: Guest) => {
        setGuests(prev => [...prev, newGuest]);
    };
    
    // Filter guests based on search query and unpaid status
    const filterGuests = (query: string) => {
        let filtered = guests;
        
        if (query.trim()) {
            filtered = filtered.filter(guest =>
                guest.fullName.toLowerCase().includes(query.toLowerCase())
            );
        }


        
        setFilteredGuests(filtered);
    };

    // Update filtered guests when guests, search query or filter changes
    useEffect(() => {
        filterGuests(searchQuery);
    }, [guests, searchQuery, paidNames]);

    const handleEdit = (guest: Guest) => {
        setEditingGuest(guest);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (guest: Guest) => {
        setGuestToDelete(guest);
    };

    const confirmDelete = async () => {
        if (!guestToDelete) return;

        try {
            setDeletingId(guestToDelete.id);
            await deleteDoc(doc(db, "guests", guestToDelete.id));
            
            // Update local state
            setGuests(prev => prev.filter(g => g.id !== guestToDelete.id));
            
            toast.success("✅ លុបភ្ញៀវបានជោគជ័យ!");
        } catch (err) {
            console.error("Error deleting guest:", err);
            toast.error("❌ មិនអាចលុបភ្ញៀវបានទេ។");
        } finally {
            setDeletingId(null);
            setGuestToDelete(null);
        }
    };

    const handleUpdateGuest = async (updatedGuest: Guest) => {
        try {
            await updateDoc(doc(db, "guests", updatedGuest.id), {
                fullName: updatedGuest.fullName,
                title: updatedGuest.title || "",
                phone: updatedGuest.phone || "",
                email: updatedGuest.email || "",
                address: updatedGuest.address || ""
            });
            
            // Update local state
            setGuests(prev => prev.map(guest => 
                guest.id === updatedGuest.id ? updatedGuest : guest
            ));
            
            setEditingGuest(null);
            setIsEditModalOpen(false);
            toast.success("✅ កែសម្រួលបានជោគជ័យ!");
        } catch (err) {
            console.error("Error updating guest:", err);
            toast.error("❌ មិនអាចកែសម្រួលបានទេ។");
        }
    };


    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    
    if (fetching) return (
        <div className="container mx-auto p-6">
            <div className="text-center py-10">
                <p>Loading guests...</p>
            </div>
        </div>
    );

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("✅ ចាកចេញបានជោគជ័យ!");
        } catch (err) {
            console.error("Error logging out:", err);
            toast.error("❌ មិនអាចចាកចេញបានទេ។");
        }
    };
    
    if (error) return (
        <div className="container mx-auto p-6">
            <div className="text-center py-10">
                <p className="text-destructive">Error: {error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                    Try Again
                </Button>
            </div>
        </div>
    );
    
    return (
    <div className="min-h-screen bg-slate-50/50 p-2 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-5">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            គ្រប់គ្រងបញ្ជីភ្ញៀវ
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium italic">គ្រប់គ្រងបញ្ជីឈ្មោះភ្ញៀវអញ្ជើញអាពាហ៍ពិពាហ៍</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => setShowSummary(!showSummary)}
                            variant="outline"
                            className={!showSummary ? `bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 h-11 rounded-xl transition-all shadow-sm border-slate-200 text-sm cursor-pointer` : `bg-red-500 hover:bg-red-500 text-white hover:text-white font-bold px-4 h-11 rounded-xl transition-all shadow-sm border-slate-200 text-sm cursor-pointer`}
                        >
                            {showSummary ? <EyeOff className="mr-2" size={18} /> : <Eye className="mr-2" size={18} />}
                            {showSummary ? "លាក់ CARD" : "បង្ហាញ CARD"}
                        </Button>
                        <Button 
                            onClick={() => navigate('/guest-payment')}
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11 rounded-xl transition-all shadow-md text-sm cursor-pointer"
                        >
                            <Wallet className="mr-2.5" size={20} />
                            តាមដានចំណងដៃ
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {showSummary && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                            animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Guests Card */}
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 min-h-[140px] border border-primary/10 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">ភ្ញៀវសរុប</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">{guests.length}</span>
                                    <span className="text-slate-400 text-sm font-semibold">នាក់</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs text-slate-400 font-medium italic">
                            បញ្ជីភ្ញៀវដែលបានបន្ថែមរួច
                        </div>
                    </div>

                    {/* Search Results Card */}
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 min-h-[140px] border border-secondary/10 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">លទ្ធផលស្វែងរក</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">{filteredGuests.length}</span>
                                    <span className="text-slate-400 text-sm font-semibold">នាក់</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center shadow-inner">
                                <UserCheck className="w-8 h-8 text-secondary" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs text-slate-400 font-medium italic">
                            ផ្អែកតាមការស្វែងរកបច្ចុប្បន្ន
                        </div>
                    </div>

                    {/* Attending Card */}
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 min-h-[140px] border border-emerald-100 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">នឹងចូលរួម</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-emerald-600 tracking-tight">{guests.filter(g => g.status === 'attending').length}</span>
                                    <span className="text-slate-400 text-sm font-semibold">នាក់</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                                <UserCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* Declined Card */}
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 min-h-[140px] border border-red-100 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">មិនអាចមកបាន</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-red-600 tracking-tight">{guests.filter(g => g.status === 'declined').length}</span>
                                    <span className="text-slate-400 text-sm font-semibold">នាក់</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                                <UserX className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Card */}
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 min-h-[140px] border border-slate-200 shadow-sm transition-all hover:shadow-md group flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">មិនទាន់ឆ្លើយតប</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-400 tracking-tight">{guests.filter(g => !g.status || g.status === 'pending' || g.status === 'viewed').length}</span>
                                    <span className="text-slate-400 text-sm font-semibold">នាក់</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
                                <History className="w-8 h-8 text-slate-400" />
                            </div>
                        </div>
                    </div>
                    </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-primary/10 shadow-sm">
                    <div className="relative w-full md:max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            placeholder="ស្វែងរកតាមឈ្មោះ..." 
                            className="pl-12 h-12 bg-slate-50/50 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-none text-base placeholder:text-slate-400 transition-all rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Button 
                            onClick={() => window.location.reload()} 
                            variant="outline"
                            className="flex-1 md:flex-none h-12 px-5 border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2.5 font-bold text-sm transition-all rounded-xl shadow-sm cursor-pointer"
                        >
                            <RefreshCw size={18} className={fetching ? "animate-spin" : ""} />
                            ផ្ទុកឡើងវិញ
                        </Button>
                        <GuestForm 
                            onGuestAdded={handleGuestAdded}
                            open={isModalOpen}
                            onOpenChange={setIsModalOpen}
                            mode="drawer"
                            trigger={
                                <Button 
                                    onClick={() => setEditingGuest(null)}
                                    className="flex-1 md:flex-none lg:hidden h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm cursor-pointer"
                                >
                                    បន្ថែមភ្ញៀវថ្មី
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start relative px-4 md:px-0">
                    {/* Sticky Sidebar Form for Desktop */}
                    <div className="hidden lg:block w-[450px] sticky top-6">
                        <div className="mb-6">
                            <h4 className="text-sm font-extrabold text-slate-600 px-1 mb-4">បញ្ចូលភ្ញៀវថ្មី</h4>
                            <GuestForm 
                                onGuestAdded={handleGuestAdded}
                                mode="inline"
                            />
                        </div>
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                បញ្ចូលព័ត៌មានភ្ញៀវឱ្យបានគ្រប់ជ្រុងជ្រោយ រួចចុច "បន្ថែមភ្ញៀវថ្មី" ដើម្បីរក្សាទុក និងបង្កើតតំណភ្ជាប់ចែករំលែក។
                            </p>
                        </div>
                    </div>

                    {/* Wider Data Table */}
                    <div className="flex-1 w-full order-last lg:order-none">
                        {fetching && guests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-primary/10 rounded-2xl shadow-sm">
                                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                                <p className="text-primary font-medium tracking-widest text-xs uppercase animate-pulse">កំពុងទាញយកទិន្នន័យ...</p>
                            </div>
                        ) : filteredGuests.length === 0 ? (
                            <div className="text-center py-20 bg-white border border-primary/10 rounded-2xl shadow-sm">
                                {searchQuery ? (
                                    <>
                                        <p className="text-muted-foreground">រកមិនឃើញភ្ញៀវដែលត្រូវនឹង "{searchQuery}"</p>
                                        <Button 
                                            onClick={() => setSearchQuery("")} 
                                            variant="outline" 
                                            className="mt-6 h-11 px-8 rounded-xl"
                                        >
                                            សម្អាតការស្វែងរក
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-muted-foreground text-lg italic">មិនទាន់មានបញ្ជីភ្ញៀវនៅឡើយទេ</p>
                                        <Button onClick={() => window.location.reload()} className="mt-6 h-11 px-8 rounded-xl">
                                            ផ្ទុកទិន្នន័យឡើងវិញ
                                        </Button>
                                    </>
                                )}
                            </div>
                        ) : (
                        <div className="bg-white border border-primary/20 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-primary/5">
                                        <TableRow className="hover:bg-transparent border-primary/10">
                                            <TableHead className="text-primary font-black text-sm uppercase px-4 py-6 text-center w-[80px]">ល.រ</TableHead>
                                            <TableHead className="text-primary font-black text-sm uppercase px-4 py-6 w-[120px]">ID</TableHead>
                                            <TableHead className="text-primary font-black text-sm uppercase px-8 py-6">គោរមងារ</TableHead>
                                            <TableHead className="text-primary font-black text-sm uppercase py-6">ឈ្មោះពេញ</TableHead>
                                            <TableHead className="text-primary font-black text-sm uppercase py-6">ព័ត៌មានទំនាក់ទំនង</TableHead>
                                            <TableHead className="text-primary font-black text-sm uppercase py-6 text-right px-8">សកម្មភាព</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {filteredGuests.map((guest, index) => {
                                        const inviteUrl = `${window.location.origin}/wedding/${guest.id}`;

                                        const handleCopy = async () => {
                                            try {
                                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                                    await navigator.clipboard.writeText(inviteUrl);
                                                    toast.success("✅ ចម្លងតំណភ្ជាប់រួចរាល់!");
                                                } else {
                                                    const textArea = document.createElement("textarea");
                                                    textArea.value = inviteUrl;
                                                    document.body.appendChild(textArea);
                                                    textArea.select();
                                                    document.execCommand('copy');
                                                    document.body.removeChild(textArea);
                                                    toast.success("✅ ចម្លងតំណភ្ជាប់រួចរាល់!");
                                                }
                                            } catch (err) {
                                                toast.error("❌ មិនអាចចម្លងតំណភ្ជាប់បានទេ។");
                                            }
                                        };

                                        // Function to copy ID
                                        const handleCopyID = async () => {
                                            try {
                                                await navigator.clipboard.writeText(guest.id);
                                                toast.success("✅ ចម្លង ID រួចរាល់!");
                                            } catch (err) {
                                                toast.error("❌ មិនអាចចម្លង ID បានទេ។");
                                            }
                                        };

                                        return (
                                            <TableRow key={guest.id} className="hover:bg-primary/[0.02] transition-colors border-primary/5 group">
                                                <TableCell className="text-slate-400 font-bold px-4 py-6 text-center font-mono">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </TableCell>
                                                <TableCell className="px-4 py-6">
                                                    <div 
                                                        onClick={handleCopyID}
                                                        className="flex items-center gap-2 cursor-pointer w-fit group/id opacity-60 hover:opacity-100 transition-all"
                                                        title="ចុចដើម្បីចម្លង ID"
                                                    >
                                                        <span className="font-mono text-[11px] text-slate-500 font-bold group-hover/id:text-primary transition-colors select-all">
                                                            #{guest.id.substring(0, 8)}...
                                                        </span>
                                                        <Copy size={12} className="text-slate-400 group-hover/id:text-primary scale-0 group-hover/id:scale-100 transition-all duration-200" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-semibold px-8 py-6">{guest.title || "-"}</TableCell>
                                                <TableCell className="py-6">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{guest.fullName}</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {paidNames.has(guest.fullName) && (
                                                                <div className="flex items-center gap-1 font-bold text-emerald-600 text-[10px] uppercase border border-emerald-200 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                                                                    <CheckCircle2 size={10} strokeWidth={3} />
                                                                    បង់ប្រាក់រួច
                                                                </div>
                                                            )}
                                                            {guest.status === 'attending' ? (
                                                                <div className="flex flex-col gap-2 items-start">
                                                                    <div className="flex items-center gap-1 font-bold text-blue-600 text-[10px] uppercase border border-blue-200 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
                                                                        <UserCheck size={10} strokeWidth={3} />
                                                                        នឹងចូលរួម
                                                                    </div>
                                                                    {guest.wishes && (
                                                                        <div className="flex gap-2 items-center bg-amber-50 border border-amber-100 p-1.5 rounded-lg max-w-[200px] cursor-help" title={guest.wishes}>
                                                                            <Quote size={12} className="text-amber-400 shrink-0" />
                                                                            <span className="text-[11px] text-slate-600 font-medium italic truncate">
                                                                                "{guest.wishes}"
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : guest.status === 'declined' ? (
                                                                <div className="flex flex-col gap-1 items-start">
                                                                    <div className="flex items-center gap-1 font-bold text-red-500 text-[10px] uppercase border border-red-200 bg-red-50 px-2.5 py-1 rounded-lg w-fit">
                                                                        <UserX size={10} strokeWidth={3} />
                                                                        មិនអាចមកបាន
                                                                    </div>
                                                                    {guest.declineReason && (
                                                                        <span className="text-[11px] text-slate-500 font-medium italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100 max-w-[150px] truncate cursor-help" title={guest.declineReason}>
                                                                            មូលហេតុ: "{guest.declineReason}"
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : guest.status === 'viewed' ? (
                                                                <div className="flex items-center gap-1 font-bold text-amber-600 text-[10px] uppercase border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                                                                    <Eye size={10} strokeWidth={3} />
                                                                    បានឃើញ
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 font-bold text-slate-400 text-[10px] uppercase border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-lg w-fit">
                                                                    <History size={10} strokeWidth={3} />
                                                                    មិនទាន់ឆ្លើយតប
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="text-slate-700 text-base font-bold">{guest.phone || "-"}</div>
                                                    {guest.address && <div className="text-slate-400 text-xs mt-1 font-medium">{guest.address}</div>}
                                                </TableCell>
                                                <TableCell className="text-right px-8 py-6">
                                                    <div className="flex justify-end gap-3">
                                                        <Button
                                                            onClick={handleCopy}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-11 w-11 border border-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm cursor-pointer"
                                                            title="Copy Link"
                                                        >
                                                            <Copy size={18} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleEdit(guest)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-11 w-11 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-xl transition-all shadow-sm cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={18} />
                                                        </Button>
                                                         <Button
                                                            onClick={() => handleDelete(guest)}
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={deletingId === guest.id}
                                                            className="h-11 w-11 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-100 rounded-xl transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            {deletingId === guest.id ? (
                                                                <RefreshCw size={18} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={18} />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        )}
                    </div>
                </div>

            {/* Edit Guest Modal */}
            <EditGuestModal
                guest={editingGuest}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onUpdate={handleUpdateGuest}
            />



            {/* Floating Logout Button */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
                        size="lg"
                    >
                        <LogOut className="w-6 h-6" />
                    </Button>
                </AlertDialogTrigger>
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
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            ចាកចេញ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Guest Delete Confirmation Modal */}
            <AlertDialog open={!!guestToDelete} onOpenChange={(open) => !open && setGuestToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>តើអ្នកពិតជាចង់លុបទិន្នន័យភ្ញៀវនេះមែនទេ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ការលុបនេះនឹងដកឈ្មោះ <b>{guestToDelete?.fullName}</b> ចេញពីបញ្ជីជាអចិន្ត្រៃយ៍ ហើយមិនអាចទាញយកមកវិញបានទេ។
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            លុបភី្ញៀវ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    );
};
