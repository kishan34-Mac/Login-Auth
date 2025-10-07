import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { VaultItemForm } from '@/components/VaultItemForm';
import { VaultList } from '@/components/VaultList';
import { LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('userId', session.user.id);
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('userId', session.user.id);
      } else {
        setUser(null);
        localStorage.removeItem('userId');
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Secure Vault</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <PasswordGenerator />
            <Button
              onClick={() => setDialogOpen(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Vault
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Vault</h2>
            <VaultList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>

      <VaultItemForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        initialPassword={generatedPassword}
      />
    </div>
  );
};

export default Index;
