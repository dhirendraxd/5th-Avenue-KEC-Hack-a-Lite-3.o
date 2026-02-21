import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConditionPhoto } from "@/lib/conditionLogStore";
import { Camera, X, ImagePlus, ZoomIn, AlertTriangle } from "lucide-react";

interface PhotoUploadGridProps {
  photos: ConditionPhoto[];
  onPhotosChange: (photos: ConditionPhoto[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
  type: 'pickup' | 'return';
}

const PhotoUploadGrid = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  disabled = false,
  type,
}: PhotoUploadGridProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<ConditionPhoto | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: ConditionPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: event.target?.result as string,
          caption: "",
          timestamp: new Date(),
          type: type,
        };
        onPhotosChange([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    onPhotosChange(photos.filter((p) => p.id !== photoId));
  };

  const handleUpdateCaption = (photoId: string, caption: string) => {
    onPhotosChange(
      photos.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
  };

  const handleMarkAsDamage = (photoId: string) => {
    onPhotosChange(
      photos.map((p) =>
        p.id === photoId ? { ...p, type: p.type === 'damage' ? type : 'damage' } : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">Condition Photos</h4>
          <p className="text-sm text-muted-foreground">
            Document equipment condition with photos ({photos.length}/{maxPhotos})
          </p>
        </div>
        {!disabled && photos.length < maxPhotos && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Add Photo
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {photos.length === 0 ? (
        <Card
          className={`border-dashed p-8 text-center ${
            disabled ? "opacity-50" : "cursor-pointer hover:bg-muted/50"
          }`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click or drag photos to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Take photos of all angles and any existing wear
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                <img
                  src={photo.url}
                  alt={photo.caption || "Equipment photo"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Damage badge */}
              {photo.type === 'damage' && (
                <Badge
                  variant="destructive"
                  className="absolute top-2 left-2 text-xs gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Damage
                </Badge>
              )}

              {/* Action buttons overlay */}
              {!disabled && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemovePhoto(photo.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Caption input */}
              {!disabled && (
                <Input
                  placeholder="Add caption..."
                  value={photo.caption}
                  onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                  className="mt-2 text-xs h-8"
                />
              )}

              {/* Mark as damage button */}
              {!disabled && photo.type !== 'damage' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1 text-xs text-warning hover:text-warning"
                  onClick={() => handleMarkAsDamage(photo.id)}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Mark as damage
                </Button>
              )}

              {disabled && photo.caption && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}

          {/* Add more button */}
          {!disabled && photos.length < maxPhotos && (
            <div
              className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add more</span>
            </div>
          )}
        </div>
      )}

      {/* Photo preview dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="space-y-4">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption || "Equipment photo"}
                className="w-full rounded-lg"
                loading="lazy"
              />
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Add caption..."
                  value={previewPhoto.caption}
                  onChange={(e) => {
                    handleUpdateCaption(previewPhoto.id, e.target.value);
                    setPreviewPhoto({ ...previewPhoto, caption: e.target.value });
                  }}
                />
                <Button
                  variant={previewPhoto.type === 'damage' ? "destructive" : "outline"}
                  size="sm"
                  className="ml-2 gap-1"
                  onClick={() => {
                    handleMarkAsDamage(previewPhoto.id);
                    setPreviewPhoto({
                      ...previewPhoto,
                      type: previewPhoto.type === 'damage' ? type : 'damage',
                    });
                  }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  {previewPhoto.type === 'damage' ? "Marked as damage" : "Mark as damage"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoUploadGrid;
