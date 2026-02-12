import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Guest {
  id: string;
  fullName: string;
}

interface EditGuestModalProps {
  guest: Guest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedGuest: Guest) => void;
}

const EditGuestModal = ({ guest, open, onOpenChange, onUpdate }: EditGuestModalProps) => {
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when guest changes
  useEffect(() => {
    if (guest) {
      setFullName(guest.fullName);
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
        fullName: fullName.trim()
      };
      
      onUpdate(updatedGuest);
    } catch (err) {
      console.error("Error updating guest:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFullName(guest?.fullName || "");
    onOpenChange(false);
  };

  if (!guest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Guest</DialogTitle>
          <DialogDescription>
            Update the guest's information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editFullName">Full Name *</Label>
            <Input
              id="editFullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter guest's full name"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fullName.trim() || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Guest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGuestModal; 