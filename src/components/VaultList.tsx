import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { decryptPassword, getEncryptionKey } from '@/lib/encryption';
import { Copy, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';

interface VaultItem {
  id: string;
  title: string;
  username: string | null;
  encrypted_password: string;
  url: string | null;
  notes: string | null;
  created_at: string;
}

export const VaultList = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
      setFilteredItems(data || []);
    } catch (error) {
      toast.error('Failed to load vault items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshTrigger]);

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleCopyPassword = async (item: VaultItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const encryptionKey = getEncryptionKey(user.id);
      const password = decryptPassword(item.encrypted_password, encryptionKey);

      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');

      // Auto-clear after 20 seconds
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 20000);
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.from('vault_items').delete().eq('id', id);
      if (error) throw error;

      toast.success('Item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getDecryptedPassword = (item: VaultItem): string => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return '••••••••';
      
      const encryptionKey = getEncryptionKey(userId);
      return decryptPassword(item.encrypted_password, encryptionKey);
    } catch {
      return '••••••••';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading vault...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vault items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          {searchQuery ? 'No items match your search' : 'No items in vault yet'}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.username && (
                      <p className="text-sm text-muted-foreground">{item.username}</p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {item.url}
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type={visiblePasswords.has(item.id) ? 'text' : 'password'}
                    value={visiblePasswords.has(item.id) ? getDecryptedPassword(item) : '••••••••'}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => togglePasswordVisibility(item.id)}
                  >
                    {visiblePasswords.has(item.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyPassword(item)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {item.notes && (
                  <p className="text-sm text-muted-foreground">{item.notes}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
