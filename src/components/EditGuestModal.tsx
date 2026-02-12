import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  // Reset form when guest changes
  useEffect(() => {
    if (guest) {
      setFullName(guest.fullName || "");
      setTitle(guest.title || "");
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
      const updatedGuest: Guest = {
        id: guest.id,
        fullName: fullName.trim(),
        title: title.trim(),
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
    if (guest) {
      setFullName(guest.fullName || "");
      setTitle(guest.title || "");
      setPhone(guest.phone || "");
      setEmail(guest.email || "");
      setAddress(guest.address || "");
    }
    onOpenChange(false);
  };

  if (!guest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-8 rounded-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Kantumruy Pro' }}>កែសម្រួលព័ត៌មានភ្ញៀវ</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium">
            ធ្វើបច្ចុប្បន្នភាពព័ត៌មានរបស់ភ្ញៀវឱ្យបានត្រឹមត្រូវ។
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="editTitle" className="text-base font-bold text-slate-700 ml-1">គោរមងារ</Label>
              <Input
                id="editTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="គោរមងារ"
                className="h-12 px-5 text-base rounded-xl border-slate-200 focus:border-primary transition-all"
              />
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