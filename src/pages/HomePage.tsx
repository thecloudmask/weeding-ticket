import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
import { LogOut, Wallet, Search, RefreshCw, Copy, Trash2, Pencil } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
interface Guest {
    id: string;
    fullName: string;
    title?:string;
    email?:string;
    phone?:string;
    address?:string;
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
    
    const fetchGuestsData = async () => {
        try {
            setFetching(true);
            const guestsCollection = collection(db, "guests");
            const guestsSnapshot = await getDocs(guestsCollection);
            
            const guestsData: Guest[] = guestsSnapshot.docs.map(doc => ({
                id: doc.id,
                fullName: doc.data().fullName,
                title: doc.data().title
            }));
            
            setGuests(guestsData);
            setFilteredGuests(guestsData);
            setError(null);
        } catch (err) {
            console.error("Error fetching guests:", err);
            setError("Failed to fetch guests data");
        } finally {
            setFetching(false);
        }
    };

    const handleGuestAdded = (newGuest: Guest) => {
        setGuests(prev => [...prev, newGuest]);
    };
    
    // Filter guests based on search query
    const filterGuests = (query: string) => {
        if (!query.trim()) {
            setFilteredGuests(guests);
            return;
        }
        
        const filtered = guests.filter(guest =>
            guest.fullName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredGuests(filtered);
    };

    // Update filtered guests when guests or search query changes
    useEffect(() => {
        filterGuests(searchQuery);
    }, [guests, searchQuery]);

    const handleEdit = (guest: Guest) => {
        setEditingGuest(guest);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (guestId: string) => {
        if (!confirm("Are you sure you want to delete this guest?")) {
            return;
        }

        try {
            await deleteDoc(doc(db, "guests", guestId));
            
            // Update local state
            setGuests(prev => prev.filter(guest => guest.id !== guestId));
            
            toast.success("✅ Guest deleted successfully!");
        } catch (err) {
            console.error("Error deleting guest:", err);
            toast.error("❌ Failed to delete guest");
        }
    };

    const handleUpdateGuest = async (updatedGuest: Guest) => {
        try {
            await updateDoc(doc(db, "guests", updatedGuest.id), {
                fullName: updatedGuest.fullName
            });
            
            // Update local state
            setGuests(prev => prev.map(guest => 
                guest.id === updatedGuest.id ? updatedGuest : guest
            ));
            
            setEditingGuest(null);
            setIsEditModalOpen(false);
            toast.success("✅ Guest updated successfully!");
        } catch (err) {
            console.error("Error updating guest:", err);
            toast.error("❌ Failed to update guest");
        }
    };

    useEffect(() => {
        fetchGuestsData();
    }, []);
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
            toast.success("✅ Logged out successfully!");
        } catch (err) {
            console.error("Error logging out:", err);
            toast.error("❌ Failed to log out");
        }
    };
    
    if (error) return (
        <div className="container mx-auto p-6">
            <div className="text-center py-10">
                <p className="text-destructive">Error: {error}</p>
                <Button onClick={fetchGuestsData} className="mt-4">
                    Try Again
                </Button>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-amber-500/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-amber-200/10 blur-[100px] rounded-full" />
            </div>

            <style>{`
                .satin-gold-text {
                    color: #8A6E2F;
                    filter: drop-shadow(0 1px 0px rgba(255,255,255,0.8));
                }
                .khmer-table-row:hover {
                    background: rgba(191, 149, 63, 0.03);
                }
                .premium-border {
                    border: 1px solid rgba(191, 149, 63, 0.1);
                }
                .premium-button {
                    background: linear-gradient(to bottom, #BF953F, #8A6E2F);
                    color: white;
                    border: 1px solid rgba(191, 149, 63, 0.2);
                    box-shadow: 0 2px 10px rgba(138, 110, 47, 0.15);
                }
                .premium-button:hover {
                    background: linear-gradient(to bottom, #8A6E2F, #725A26);
                    transform: translateY(-1px);
                }
            `}</style>

            <div className="container mx-auto relative z-10">
                <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-amber-500/10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3 satin-gold-text tracking-tight" style={{ fontFamily: 'Taprom' }}>
                            គ្រប់គ្រងភ្ញៀវ <span className="text-amber-800/20 font-light mx-2">|</span> Guest Management
                        </h1>
                        <p className="text-amber-800/40 font-bold tracking-[0.2em] uppercase text-[9px] ml-1">Royal Wedding Administration Portal</p>
                    </div>
                    <Button 
                        onClick={() => navigate('/guest-payment')}
                        className="premium-button font-bold px-10 h-14 rounded-2xl transition-all active:scale-95"
                    >
                        <Wallet className="mr-3" size={22} />
                        Payment Ledger
                    </Button>
                </div>

                <div className="mb-10 flex flex-col lg:flex-row gap-6 items-center">
                    <div className="flex-1 w-full">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-800/30 group-focus-within:text-amber-600 transition-colors" size={20} />
                            <Input 
                                placeholder="Search by name..." 
                                className="bg-white border-amber-100 text-slate-800 pl-14 h-14 rounded-2xl focus-visible:ring-amber-200 transition-all shadow-sm text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full lg:w-auto">
                        <GuestForm 
                            onGuestAdded={handleGuestAdded}
                            open={isModalOpen}
                            onOpenChange={setIsModalOpen}
                            trigger={
                                <Button className="premium-button flex-1 lg:flex-none h-14 px-8 rounded-2xl font-bold text-base">
                                    Add New Guest
                                </Button>
                            }
                        />
                        <Button 
                            onClick={fetchGuestsData} 
                            variant="outline"
                            className="h-14 w-14 border-amber-200 text-amber-800 hover:bg-amber-50 rounded-2xl transition-all shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw size={22} />
                        </Button>
                    </div>
                </div>

            {filteredGuests.length === 0 ? (
                <div className="text-center py-10">
                    {searchQuery ? (
                        <>
                            <p className="text-muted-foreground">No guests found matching "{searchQuery}"</p>
                            <Button 
                                onClick={() => setSearchQuery("")} 
                                variant="outline" 
                                className="mt-4"
                            >
                                Clear Search
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-muted-foreground">No guests found</p>
                            <Button onClick={fetchGuestsData} className="mt-4">
                                Load Guests
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white premium-border rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-50" />
                    <Table>
                        <TableHeader className="bg-amber-50/50">
                            <TableRow className="border-amber-100 hover:bg-transparent">
                                <TableHead className="text-amber-800/40 font-black uppercase tracking-[0.2em] text-[10px] py-6 px-6">Identity</TableHead>
                                <TableHead className="text-amber-800/40 font-black uppercase tracking-[0.2em] text-[10px] py-6">Title</TableHead>
                                <TableHead className="text-amber-800/40 font-black uppercase tracking-[0.2em] text-[10px] py-6">Full Name</TableHead>
                                <TableHead className="text-amber-800/40 font-black uppercase tracking-[0.2em] text-[10px] py-6">City / Locale</TableHead>
                                <TableHead className="text-amber-800/40 font-black uppercase tracking-[0.2em] text-[10px] py-6">Contact</TableHead>
                                <TableHead className="text-amber-800/40 font-black uppercase tracking-[0.2em] text-[10px] py-6 text-right px-8">Management</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white/50">
                        {filteredGuests.map((guest) => {
    const inviteUrl = `${window.location.origin}/wedding/${guest.id}`;

    const handleCopy = async () => {
      try {
        // Use fallback method for environments where clipboard API might not be available (like IP addresses)
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(inviteUrl);
          toast.success("✅ Invite link copied to clipboard!");
        } else {
          // Fallback method using document.execCommand
          const textArea = document.createElement("textarea");
          textArea.value = inviteUrl;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            toast.success("✅ Invite link copied to clipboard!");
          } else {
            throw new Error("Fallback copy method failed");
          }
        }
      } catch (err) {
        toast.error("❌ Failed to copy link.");
        console.error("Copy failed:", err);
      }
    };

    return (
        <TableRow key={guest.id} className="border-amber-50 khmer-table-row transition-colors">
            <TableCell className="font-mono text-xs text-amber-800/20 px-6">
                {guest.id}
            </TableCell>
            <TableCell className="text-slate-500 font-medium italic text-xs">{guest.title || "-"}</TableCell>
            <TableCell className="text-slate-800 font-bold tracking-wide" style={{ fontFamily: 'Taprom' }}>{guest.fullName}</TableCell>
            <TableCell className="text-amber-700/50 text-[10px] font-bold uppercase tracking-widest">{guest.address || "-"}</TableCell>
            <TableCell>
                <div className="text-slate-600 text-[11px] font-bold">{guest.phone}</div>
                <div className="text-amber-800/30 text-[10px] truncate max-w-[120px]">{guest.email}</div>
            </TableCell>
            <TableCell className="text-right px-8 py-4">
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="sm"
                        className="h-8 border border-amber-200 text-amber-700 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                    >
                        <Copy size={13} className="mr-2" />
                        Copy
                    </Button>
                    <Button 
                        onClick={() => handleEdit(guest)}
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-amber-800/30 hover:text-amber-600 hover:bg-amber-50"
                    >
                        <Pencil size={13} />
                    </Button>
                    <Button 
                        onClick={() => handleDelete(guest.id)}
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={13} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
  })}
</TableBody>
                    </Table>
                </div>
            )}

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
                        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be signed out of your account and redirected to the login page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        </div>
    );
}

