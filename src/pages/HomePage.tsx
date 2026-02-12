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
import { LogOut, Wallet } from "lucide-react";
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
        <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Wedding Guest Management</h1>
                    <p className="text-muted-foreground">Manage your wedding guest list</p>
                </div>
                <Button 
                    onClick={() => navigate('/guest-payment')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                >
                    <Wallet className="mr-2" size={20} />
                    Guest Payment Tracker
                </Button>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    Guests List ({guests.length})
                    {searchQuery && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                            • Showing {filteredGuests.length} result{filteredGuests.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </h2>
                <div className="flex gap-2">
                    <GuestForm 
                        onGuestAdded={handleGuestAdded}
                        open={isModalOpen}
                        onOpenChange={setIsModalOpen}
                    />
                    <Button onClick={fetchGuestsData} variant="outline">
                        Refresh Data
                    </Button>
                </div>
            </div>

            <div className="mb-4">
                <Input 
                    placeholder="Search guests by name..." 
                    className="max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Found {filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''}
                    </p>
                )}
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
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-medium">Guest ID</TableHead>
                                <TableHead className="font-medium">Title</TableHead>
                                <TableHead className="font-medium">Full Name</TableHead>
                                <TableHead className="font-medium">Address</TableHead>
                                <TableHead className="font-medium">Phone</TableHead>
                                <TableHead className="font-medium">Email</TableHead>
                                <TableHead className="font-medium text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
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
        <TableRow key={guest.id}>
        <TableCell className="font-mono text-sm">{guest.id}</TableCell>
        <TableCell className="font-medium">{guest.title ? guest.title : "No data"}</TableCell>
        <TableCell className="font-medium">{guest.fullName}</TableCell>
        <TableCell className="font-medium">{guest.address ? guest.address : "No data"}</TableCell>
        <TableCell className="font-medium">{guest.phone}</TableCell>
        <TableCell className="font-medium">{guest.email}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              className="transition-all duration-200 active:scale-95 hover:bg-green-500 hover:text-white"
            >
              Copy Link
            </Button>
                         <Button 
               onClick={() => handleEdit(guest)}
               variant="outline" 
               size="sm"
             >
               Edit
             </Button>
             <Button 
               onClick={() => handleDelete(guest.id)}
               variant="destructive" 
               size="sm"
             >
               Delete
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
    );
}

