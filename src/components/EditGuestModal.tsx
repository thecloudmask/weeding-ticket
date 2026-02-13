import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, Plus } from "lucide-react";

interface Guest {
  id: string;
  fullName: string;
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface EditGuestModalProps {
  guest: Guest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedGuest: Guest) => void;
}

const EditGuestModal = ({ guest, open, onOpenChange, onUpdate }: EditGuestModalProps) => {
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guestTitle] = useState<string[]>([
    'Sister.', 'Brother.', 'Friend.', 'Bestie.', 'Dear.', 'Mr.', 'Mrs.',
    'ប្អូន.', 'ប្អូនប្រុស.', 'ប្អូនស្រី.', 'លោក.', 'លោកស្រី.', 'អ្នកស្រី.', 'អ្នកនាង.', 'កញ្ញា.',
    'បង.', 'បងប្រុស.', 'អ្នកគ្រូ.', 'លោកគ្រូ.', 'ពួកម៉ាក', 'មេទ័ពធំ.', 'សេនាប្រមុខ.',
    'ម្រាមដៃបីសាច.', 'សុភាពបុរសក្លែងក្លាយ.', 'ហ៊ា.', 'ចែ.', 'បងស្រី.', 'អ្នកមីង.', 'លោកពូ.',
    'អុី.', 'ឃូ.', 'ចឹក.', 'ទ្រា.', 'ចី.', 'ឃិម.'
  ]);

  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  // Reset form when guest changes
  useEffect(() => {
    if (guest) {
      setFullName(guest.fullName || "");
      
      const currentTitle = guest.title || "";
      if (currentTitle && !guestTitle.includes(currentTitle)) {
        setIsCustomTitle(true);
        setCustomTitle(currentTitle);
        setTitle("custom");
      } else {
        setIsCustomTitle(false);
        setTitle(currentTitle || guestTitle[0]);
      }

      setPhone(guest.phone || "");
      setEmail(guest.email || "");
      setAddress(guest.address || "");
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guest || !fullName.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const finalTitle = isCustomTitle ? customTitle.trim() : title;
      const updatedGuest: Guest = {
        id: guest.id,
        fullName: fullName.trim(),
        title: finalTitle,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim()
      };
      
      onUpdate(updatedGuest);
    } catch (err) {
      console.error("Error updating guest:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!guest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-8 rounded-2xl bg-white">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Kantumruy Pro' }}>កែសម្រួលព័ត៌មានភ្ញៀវ</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium font-sans">
            ធ្វើបច្ចុប្បន្នភាពព័ត៌មានរបស់ភ្ញៀវឱ្យបានត្រឹមត្រូវ។
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label className="text-base font-bold text-slate-700 ml-1">
                {isCustomTitle ? "គោរមងារថ្មី" : "គោរមងារ"}
              </Label>
              {isCustomTitle ? (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="វាយបញ្ចូលគោរមងារ..."
                    className="h-12 px-5 text-base rounded-xl border-slate-200 focus:border-primary transition-all flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsCustomTitle(false)}
                    className="h-12 text-xs text-primary hover:bg-primary/5 font-bold cursor-pointer"
                  >
                    បញ្ជី
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between flex items-center gap-2 h-12 px-5 bg-white border-slate-200 hover:bg-slate-50 transition-colors text-base font-medium text-slate-700 shadow-none cursor-pointer rounded-xl">
                      <span className="truncate">{title || "ជ្រើសរើស"}</span>
                      <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[280px] h-[350px] overflow-y-auto bg-white border-slate-200 text-slate-700">
                    <DropdownMenuRadioGroup value={title} onValueChange={setTitle}>
                      {guestTitle.map((t) => (
                        <DropdownMenuRadioItem key={t} value={t} className="py-2.5 text-sm hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                          {t}
                        </DropdownMenuRadioItem>
                      ) )}
                      <DropdownMenuRadioItem 
                        value="custom" 
                        className="py-2.5 text-primary font-bold border-t border-slate-100 text-sm hover:bg-slate-50 focus:bg-slate-50 cursor-pointer" 
                        onClick={() => setIsCustomTitle(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        បន្ថែមថ្មី...
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="editFullName" className="text-base font-bold text-slate-700 ml-1">ឈ្មោះពេញ *</Label>
              <Input
                id="editFullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="បញ្ចូលឈ្មោះពេញ"
                className="h-12 px-5 text-base rounded-xl border-slate-200 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="editPhone" className="text-base font-bold text-slate-700 ml-1">លេខទូរស័ព្ទ</Label>
              <Input
                id="editPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="លេខទូរស័ព្ទ"
                className="h-12 px-5 text-base rounded-xl border-slate-200 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="editEmail" className="text-base font-bold text-slate-700 ml-1">អ៊ីមែល</Label>
              <Input
                id="editEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="អ៊ីមែល"
                className="h-12 px-5 text-base rounded-xl border-slate-200 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="editAddress" className="text-base font-bold text-slate-700 ml-1">អាសយដ្ឋាន</Label>
            <Input
              id="editAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="អាសយដ្ឋាន"
              className="h-12 px-5 text-base rounded-xl border-slate-200 focus:border-primary transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-12 px-8 rounded-xl font-bold text-base cursor-pointer"
            >
              បោះបង់
            </Button>
            <Button
              type="submit"
              disabled={!fullName.trim() || isSubmitting}
              className="h-12 px-8 rounded-xl font-black text-base transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? "កំពុងធ្វើបច្ចុប្បន្នភាព..." : "ធ្វើបច្ចុប្បន្នភាព"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGuestModal; 