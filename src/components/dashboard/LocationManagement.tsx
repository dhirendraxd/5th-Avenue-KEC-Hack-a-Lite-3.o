import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Location, mockLocations } from '@/lib/mockData';
import { MapPin, Plus, Edit2, Trash2, Package, Star } from 'lucide-react';

const LocationManagement = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const handleAddLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newLocation: Location = {
      id: `loc${Date.now()}`,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      isDefault: false,
      equipmentCount: 0,
    };

    setLocations([...locations, newLocation]);
    setIsAddingLocation(false);
    toast({
      title: 'Location Added',
      description: `${newLocation.name} has been added to your locations.`,
    });
  };

  const handleSetDefault = (locationId: string) => {
    setLocations(
      locations.map((loc) => ({
        ...loc,
        isDefault: loc.id === locationId,
      }))
    );
    toast({
      title: 'Default Location Updated',
      description: 'Your default pickup location has been changed.',
    });
  };

  const handleDeleteLocation = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    if (location?.isDefault) {
      toast({
        title: 'Cannot Delete',
        description: 'You cannot delete the default location.',
        variant: 'destructive',
      });
      return;
    }
    setLocations(locations.filter((l) => l.id !== locationId));
    toast({
      title: 'Location Removed',
      description: 'The location has been removed.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Business Locations</h2>
          <p className="text-sm text-muted-foreground">
            Manage your equipment pickup and storage locations
          </p>
        </div>
        <Dialog open={isAddingLocation} onOpenChange={setIsAddingLocation}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Add a new pickup or storage location for your equipment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Main Warehouse"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Industrial Blvd"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="City" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" placeholder="CA" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP</Label>
                  <Input id="zipCode" name="zipCode" placeholder="94107" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingLocation(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Location</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id} className={location.isDefault ? 'border-primary' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {location.name}
                      {location.isDefault && (
                        <Badge className="bg-primary/10 text-primary border-0 gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p>{location.address}</p>
                <p>
                  {location.city}, {location.state} {location.zipCode}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  {location.equipmentCount} equipment items
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
                {!location.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(location.id)}
                    className="gap-1"
                  >
                    <Star className="h-3 w-3" />
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingLocation(location)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {!location.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocationManagement;
