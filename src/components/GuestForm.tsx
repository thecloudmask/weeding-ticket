// src/components/GuestForm.tsx
import {useState} from "react";
import {nanoid} from "nanoid";
import {db} from "../../firebase";
import {doc, setDoc} from "firebase/firestore";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { UserIcon, BadgeIcon, PhoneIcon, MailIcon, MapPinIcon, ChevronDownIcon } from "lucide-react";


  interface GuestType {
    id: string;
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    address?: string;
}
interface GuestFormProps {
    onGuestAdded?: (guest : GuestType) => void;
    open?: boolean;
    onOpenChange?: (open : boolean) => void;
    trigger?: React.ReactNode;
}

const GuestForm = ({onGuestAdded, open, onOpenChange, trigger} : GuestFormProps) => {
    const [fullName, setFullName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [guestTitle] = useState < string[] > ([
        'Sister.',
        'Brother.',
        'Friend.',
        'Bestie.',
        'Dear.',
        'Mr.',
        'Mrs.',
        'ប្អូន.',
        'ប្អូនប្រុស.',
        'ប្អូនស្រី.',
        'លោក.',
        'លោកស្រី.',
        'អ្នកស្រី.',
        'អ្នកនាង.',
        'កញ្ញា.',
        'បង.',
        'បងប្រុស.',
        'អ្នកគ្រូ.',
        'លោកគ្រូ.',
        'ពួកម៉ាក',
        'មេទ័ពធំ.',
        'សេនាប្រមុខ.',
        'ម្រាមដៃបីសាច.',
        'សុភាពបុរសក្លែងក្លាយ.',
        'ហ៊ា.',
        'ចែ.',
        'បងស្រី.',
        'អ្នកមីង.',
        'លោកពូ.',
        'អុី.',
        'ឃូ.',
        'ចឹក.',
        'ទ្រា.',
        'ចី.',
        'ឃិម.'
    ]);
    const [selectedTitle, setSelectedTitle] = useState<string>(guestTitle[0]);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setStatus("⚠️ Please enter a name.");
            return;
        }

        const id = nanoid(8); // e.g. a8F9zYkW

        try {
            setIsSubmitting(true);
            await setDoc(doc(db, "guests", id), {
                fullName: fullName.trim(),
                title: selectedTitle || null,
                phone: phone.trim() || null,
                email: email.trim() || null,
                address: address.trim() || null
            });

            const newGuest = {
                id,
                fullName: fullName.trim(),
                title: selectedTitle || null,
                phone: phone.trim() || null,
                email: email.trim() || null,
                address: address.trim() || null
            };

            if (onGuestAdded) {
                onGuestAdded(newGuest as GuestType);
            }

            const url = `${
                window.location.origin
            }/wedding/${id}`;
            setGeneratedLink(url);
            setStatus("✅ Guest added successfully!");
            setFullName("");
            setPhone("");
            setEmail("");
            setAddress("");
            // Close modal after success
            if (onOpenChange) {
                onOpenChange(false);
                resetForm();
            }
            // Keep selectedTitle as the most recently used
        } catch (error) {
            console.error(error);
            setStatus("❌ Failed to add guest.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setStatus("📋 Link copied to clipboard!");
        } catch (err) {
            setStatus("❌ Failed to copy link.");
        }
    };

    const resetForm = () => {
        setFullName("");
        setStatus("");
        setGeneratedLink("");
    };

    return (
        <Dialog open={open}
            onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger || <Button>Add New Guest</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Guest</DialogTitle>
                    <DialogDescription>
                        Add a new guest to your wedding invitation list.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}
                    className="space-y-4 py-4">
                      <div className="space-y-2 flex items-center gap-2">
                        <BadgeIcon className="w-4 h-4 text-muted-foreground" />
                        <Label>Title</Label>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full justify-between flex items-center gap-2">
                                <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                {selectedTitle}
                                <ChevronDownIcon className="w-4 h-4 ml-auto text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuRadioGroup value={selectedTitle} onValueChange={setSelectedTitle}>
                                {guestTitle.map((title) => (
                                    <DropdownMenuRadioItem key={title} value={title} className="flex items-center gap-2">
                                        <BadgeIcon className="w-4 h-4 text-muted-foreground" />
                                        {title}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                            
                            Full Name *
                        </Label>
                        <div className="relative">
                            <Input id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="ឈ្មោះពេញ"
                                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                                className="pl-9"
                            />
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                           
                            Phone Number (optional)
                        </Label>
                        <div className="relative">
                            <Input id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="លេខទូរស័ព្ទ"
                                type="number"
                                className="pl-9"
                            />
                            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            
                            Email (optional)
                        </Label>
                        <div className="relative">
                            <Input id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="អ៊ីមែល"
                                type="email"
                                className="pl-9"
                            />
                            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                           
                            Address (optional)
                        </Label>
                        <div className="relative">
                            <Input id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="អាសយដ្ឋាន"
                                className="pl-9"
                            />
                            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                {
                generatedLink && (
                    <div className="mt-4">
                        <p className="text-sm font-medium">🎉 Invitation Link:</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Input value={generatedLink}
                                readOnly/>
                            <Button type="button" variant="secondary"
                                onClick={handleCopy}>
                                Copy
                            </Button>
                        </div>
                    </div>
                )
            }

                {
                status && (
                    <div className={
                        `text-sm ${
                            status.includes("✅") || status.includes("📋") ? "text-green-600" : "text-red-600"
                        }`
                    }>
                        {status} </div>
                )
            }

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline"
                        onClick={
                            () => {
                                resetForm();
                                if (onOpenChange) 
                                    onOpenChange(false);
                                
                            }
                        }
                        disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit"
                        disabled={
                            !fullName.trim() || isSubmitting
                    }>
                        {
                        isSubmitting ? "Adding..." : "Add Guest"
                    } </Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
    );
};

export default GuestForm;
