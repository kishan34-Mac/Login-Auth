import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw } from 'lucide-react';
import { generatePassword, PasswordOptions } from '@/lib/passwordGenerator';
import { toast } from 'sonner';

export const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeLookAlikes: false,
  });

  const handleGenerate = () => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
    } catch (error) {
      toast.error('Please select at least one character type');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied to clipboard');
    
    // Auto-clear after 20 seconds
    setTimeout(() => {
      navigator.clipboard.writeText('');
    }, 20000);
  };

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Password Generator</h2>
        <p className="text-sm text-muted-foreground">
          Generate strong, secure passwords
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={password}
            readOnly
            placeholder="Generated password will appear here"
            className="font-mono"
          />
          <Button onClick={handleCopy} disabled={!password} size="icon" variant="outline">
            <Copy className="h-4 w-4" />
          </Button>
          <Button onClick={handleGenerate} size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Length: {options.length}</Label>
            </div>
            <Slider
              value={[options.length]}
              onValueChange={(value) => setOptions({ ...options, length: value[0] })}
              min={8}
              max={64}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeUppercase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
              <Switch
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeLowercase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="numbers">Numbers (0-9)</Label>
              <Switch
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeNumbers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="symbols">Symbols (!@#$%...)</Label>
              <Switch
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeSymbols: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lookAlikes">Exclude Look-alikes (il1Lo0O)</Label>
              <Switch
                id="lookAlikes"
                checked={options.excludeLookAlikes}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, excludeLookAlikes: checked })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
