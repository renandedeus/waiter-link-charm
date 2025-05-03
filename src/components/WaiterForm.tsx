
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface WaiterFormProps {
  onSave: (name: string, email: string, whatsapp: string) => void;
}

export const WaiterForm = ({ onSave }: WaiterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; whatsapp?: string }>({});
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateWhatsApp = (phone: string) => {
    // Simple validation for phone number format
    return phone.length >= 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; email?: string; whatsapp?: string } = {};
    
    if (!name) {
      newErrors.name = "Waiter name is required";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!whatsapp) {
      newErrors.whatsapp = "WhatsApp number is required";
    } else if (!validateWhatsApp(whatsapp)) {
      newErrors.whatsapp = "Please enter a valid phone number";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(name, email, whatsapp);
    
    // Reset form fields
    setName('');
    setEmail('');
    setWhatsapp('');
    setErrors({});
    
    toast({
      title: "Waiter added successfully",
      description: "The waiter has been added to your list.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Waiter</CardTitle>
        <CardDescription>
          Enter the waiter's information to generate their tracking link and QR code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="waiter-name">Full Name</Label>
            <Input
              id="waiter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter waiter's full name"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="waiter-email">Email</Label>
            <Input
              id="waiter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="waiter@example.com"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="waiter-whatsapp">WhatsApp</Label>
            <Input
              id="waiter-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+5511999999999"
            />
            {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp}</p>}
          </div>
          
          <Button type="submit">Add Waiter</Button>
        </form>
      </CardContent>
    </Card>
  );
};
