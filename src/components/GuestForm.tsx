// src/components/GuestForm.tsx
import {useState, useRef} from "react";
import {nanoid} from "nanoid";
import {db} from "../../firebase";
import {doc, setDoc} from "firebase/firestore";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";


  interface GuestType {
    id: string;
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: 'attending' | 'declined' | 'pending' | 'viewed';
}
interface GuestFormProps {
    onGuestAdded?: (guest : GuestType) => void;
    open?: boolean;
    onOpenChange?: (open : boolean) => void;
    trigger?: React.ReactNode;
    mode?: 'drawer' | 'inline';
}

const GuestForm = ({onGuestAdded, open, onOpenChange, trigger, mode = 'drawer'} : GuestFormProps) => {
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
    const [isCustomTitle, setIsCustomTitle] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);
    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setStatus("⚠️ Please enter a name.");
            return;
        }

        const id = nanoid(8); // e.g. a8F9zYkW

        try {
            setIsSubmitting(true);
            const finalTitle = isCustomTitle ? customTitle.trim() : selectedTitle;
            
            await setDoc(doc(db, "guests", id), {
                fullName: fullName.trim(),
                title: finalTitle || null,
                phone: phone.trim() || null,
                email: email.trim() || null,
                address: address.trim() || null,
                status: 'pending'
            });

            const newGuest = {
                id,
                fullName: fullName.trim(),
                title: finalTitle || null,
                phone: phone.trim() || null,
                email: email.trim() || null,
                address: address.trim() || null,
                status: 'pending'
            };

            if (onGuestAdded) {
                onGuestAdded(newGuest as GuestType);
            }

            const url = `${
                window.location.origin
            }/wedding/${id}`;
            setGeneratedLink(url);
            setStatus("✅ បន្ថែមភ្ញៀវបានជោគជ័យ!");
            
            // Clear inputs for next entry (Batch mode)
            setFullName("");
            setPhone("");
            setEmail("");
            setAddress("");
            setIsCustomTitle(false);
            setCustomTitle("");
            // Auto focus back to name input for fast entry
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);
            // Don't close drawer automatically as requested before
        } catch (error) {
            console.error(error);
            setStatus("❌ បរាជ័យក្នុងការបន្ថែមភ្ញៀវ។");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setStatus("📋 ចម្លងតំណភ្ជាប់រួចរាល់!");
        } catch (err) {
            setStatus("❌ មិនអាចចម្លងតំណភ្ជាប់បានទេ។");
        }
    };

    const renderFormContent = () => (
        <form onSubmit={handleSubmit}
            className={mode === 'inline' ? "space-y-5 p-6 bg-white border border-primary/20 rounded-2xl shadow-sm" : "space-y-6 px-8 pb-12 text-slate-900"}>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-base font-bold text-slate-700 ml-1">
                        {isCustomTitle ? "គោរមងារថ្មី" : "គោរមងារ"}
                    </Label>
                    {isCustomTitle ? (
                        <div className="animate-in fade-in slide-in-from-top-1">
                            <Input 
                                id="customTitle"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                placeholder="ឧទាហរណ៍៖ លោកគ្រូ"
                                className="h-12 px-5 bg-white border-slate-300 text-base focus:border-primary shadow-none rounded-xl"
                            />
                        </div>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="w-full justify-between flex items-center gap-2 h-12 px-5 bg-white border-slate-300 hover:bg-slate-50 transition-colors text-base font-medium text-slate-700 shadow-none cursor-pointer rounded-xl">
                                    <span className="truncate">{selectedTitle || "ជ្រើសរើស"}</span>
                                    <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[280px] h-[350px] overflow-y-auto bg-white border-slate-200 text-slate-700">
                                <DropdownMenuRadioGroup value={selectedTitle} onValueChange={setSelectedTitle}>
                                    {guestTitle.map((title) => (
                                        <DropdownMenuRadioItem key={title} value={title} className="py-2.5 text-sm hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                                            {title}
                                        </DropdownMenuRadioItem>
                                    ))}
                                    <DropdownMenuRadioItem value="custom" className="py-2.5 text-primary font-bold border-t border-slate-100 text-sm hover:bg-slate-50 focus:bg-slate-50 cursor-pointer" 
                                        onClick={() => setIsCustomTitle(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        បន្ថែមថ្មី...
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-bold text-slate-700 ml-1">ឈ្មោះពេញ *</Label>
                    <Input id="fullName"
                        ref={nameInputRef}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="វាយឈ្មោះនៅទីនេះ..."
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                        className="h-12 px-5 bg-white border-slate-300 text-base focus:border-primary shadow-none rounded-xl"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-bold text-slate-700 ml-1">លេខទូរស័ព្ទ</Label>
                    <Input id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="០១២ ៣៤៥ ៦៧៨"
                        type="number"
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                        className="h-12 px-5 bg-white border-slate-300 text-base focus:border-primary shadow-none rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-bold text-slate-700 ml-1">អ៊ីមែល</Label>
                    <Input id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        type="email"
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                        className="h-12 px-5 bg-white border-slate-300 text-base focus:border-primary shadow-none rounded-xl"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-bold text-slate-700 ml-1">អាសយដ្ឋាន</Label>
                <Input id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="បញ្ចូលអាសយដ្ឋាន..."
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                    className="h-12 px-5 bg-white border-slate-300 text-base focus:border-primary shadow-none rounded-xl"
                />
            </div>

            <div className="pt-2">
                {generatedLink && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg animate-in fade-in zoom-in-95">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase mb-2 tracking-wider">តំណភ្ជាប់លិខិតអញ្ជើញ៖</p>
                        <div className="flex items-center gap-2">
                            <Input value={generatedLink} readOnly className="h-9 text-xs bg-white border-emerald-200 text-emerald-800" />
                            <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="h-9 px-3 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-none cursor-pointer">
                                ចម្លង
                            </Button>
                        </div>
                    </div>
                )}

                {status && (
                    <div className={cn("text-xs font-bold text-center mb-4 p-2 rounded-lg", status.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                        {status}
                    </div>
                )}

                <Button 
                    type="submit" 
                    disabled={!fullName.trim() || isSubmitting}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            កំពុងរក្សាទុក...
                        </div>
                    ) : "បន្ថែមភ្ញៀវថ្មី"}
                </Button>
            </div>
        </form>
    );

    if (mode === 'inline') {
        return renderFormContent();
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                {trigger || <Button className="cursor-pointer">បន្ថែមភ្ញៀវថ្មី</Button>}
            </DrawerTrigger>
            <DrawerContent className="bg-white max-w-xl mx-auto rounded-t-2xl border-t border-slate-100">
                <DrawerHeader className="text-left py-6 border-b border-slate-100 mb-4">
                    <DrawerTitle className="text-lg font-bold text-slate-900">បន្ថែមភ្ញៀវថ្មី</DrawerTitle>
                    <DrawerDescription className="text-slate-500">
                        បំពេញព័ត៌មានខាងក្រោមដើម្បីបន្ថែមភ្ញៀវទៅក្នុងបញ្ជី។
                    </DrawerDescription>
                </DrawerHeader>
                {renderFormContent()}
            </DrawerContent>
        </Drawer>
    );
};

export default GuestForm;
