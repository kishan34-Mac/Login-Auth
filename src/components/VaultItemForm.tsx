import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { encryptPassword, getEncryptionKey } from '@/lib/encryption';
import { toast } from 'sonner';
import { z } from 'zod';

const vaultItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  username: z.string().max(255).optional(),
  password: z.string().min(1, 'Password is required').max(500),
  url: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

interface VaultItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialPassword?: string;
}

export const VaultItemForm = ({ open, onOpenChange, onSuccess, initialPassword }: VaultItemFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: initialPassword || '',
    url: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      vaultItemSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const encryptionKey = getEncryptionKey(user.id);
      const encryptedPassword = encryptPassword(formData.password, encryptionKey);

      const { error } = await supabase.from('vault_items').insert({
        user_id: user.id,
        title: formData.title,
        username: formData.username || null,
        encrypted_password: encryptedPassword,
        url: formData.url || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success('Item saved to vault');
      setFormData({ title: '', username: '', password: '', url: '', notes: '' });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Vault</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Gmail Account"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username or email"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save to Vault'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
