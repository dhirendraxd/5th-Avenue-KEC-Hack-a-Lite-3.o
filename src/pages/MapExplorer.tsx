import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { pois, type POI } from "@/data/mockData";
import { Filter, Mountain, Landmark, Waves, Footprints, Home, UtensilsCrossed, MapPin, Star, Eye } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const typeIcons: Record<POI["type"], React.ElementType> = {
  mountain: Mountain, temple: Landmark, lake: Waves, trek: Footprints, homestay: Home, restaurant: UtensilsCrossed,
};

const typeColors: Record<POI["type"], string> = {
  mountain: "#0D9488", temple: "#D97706", lake: "#0EA5E9", trek: "#16A34A", homestay: "#8B5CF6", restaurant: "#EF4444",
};

const crowdColors = { low: "#16A34A", medium: "#D97706", high: "#EF4444" };

const MapExplorer = () => {
  const [typeFilter, setTypeFilter] = useState<POI["type"] | "all">("all");
  const [budgetFilter, setBudgetFilter] = useState<POI["budget"] | "all">("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  const filtered = useMemo(() => {
    return pois.filter((p) => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (budgetFilter !== "all" && p.budget !== budgetFilter) return false;
      return true;
    });
  }, [typeFilter, budgetFilter]);

  const types: { key: POI["type"] | "all"; label: string; Icon: React.ElementType }[] = [
    { key: "all", label: "All", Icon: MapPin },
    { key: "mountain", label: "Mountains", Icon: Mountain },
    { key: "temple", label: "Temples", Icon: Landmark },
    { key: "lake", label: "Lakes", Icon: Waves },
    { key: "trek", label: "Treks", Icon: Footprints },
    { key: "homestay", label: "Homestays", Icon: Home },
    { key: "restaurant", label: "Food", Icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Filters */}
      <div className="bg-card border-b border-border py-4">
        <div className="container">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {types.map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Budget:</span>
            {(["all", "low", "medium", "high"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBudgetFilter(b)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  budgetFilter === b
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {b === "all" ? "All" : b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showHeatmap ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Crowd Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* Map + Detail panel */}
      <div className="flex" style={{ height: "calc(100vh - 180px)" }}>
        <div className="flex-1 relative">
          <MapContainer
            center={[28.3949, 84.1240]}
            zoom={7}
            className="w-full h-full z-0"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((poi) => (
              <Marker key={poi.id} position={[poi.lat, poi.lng]} eventHandlers={{ click: () => setSelectedPoi(poi) }}>
                <Popup>
                  <div className="font-sans">
                    <strong>{poi.name}</strong>
                    <p className="text-xs mt-1">{poi.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {showHeatmap && filtered.map((poi) => (
              <CircleMarker
                key={`heat-${poi.id}`}
                center={[poi.lat, poi.lng]}
                radius={poi.crowd === "high" ? 30 : poi.crowd === "medium" ? 20 : 12}
                pathOptions={{
                  color: crowdColors[poi.crowd],
                  fillColor: crowdColors[poi.crowd],
                  fillOpacity: 0.25,
                  weight: 1,
                }}
              />
            ))}
          </MapContainer>

          {/* GPS indicator */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-border flex items-center gap-2 z-[1000]">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-foreground">Your Location: Kathmandu</span>
          </div>
        </div>

        {/* Detail panel */}
        {selectedPoi && (
          <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: typeColors[selectedPoi.type] + "20", color: typeColors[selectedPoi.type] }}>
                {(() => { const Icon = typeIcons[selectedPoi.type]; return <Icon className="w-5 h-5" />; })()}
              </div>
              <button onClick={() => setSelectedPoi(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-1">{selectedPoi.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize" style={{ backgroundColor: typeColors[selectedPoi.type] + "15", color: typeColors[selectedPoi.type] }}>
                {selectedPoi.type}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="text-xs font-medium">{selectedPoi.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedPoi.description}</p>
            {selectedPoi.elevation && (
              <div className="flex items-center gap-2 text-sm mb-2">
                <Mountain className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{selectedPoi.elevation}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium capitalize text-foreground">{selectedPoi.budget}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mb-6">
              <span className="text-muted-foreground">Crowd:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: crowdColors[selectedPoi.crowd] + "15", color: crowdColors[selectedPoi.crowd] }}>
                {selectedPoi.crowd}
              </span>
            </div>

            {/* AR info mock */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
              <p className="text-xs font-semibold text-primary mb-1">📱 AR Info Available</p>
              <p className="text-xs text-muted-foreground">Point your camera to see historical overlays, mountain names, and cultural context.</p>
            </div>

            <Button variant="hero" className="w-full" size="lg">
              Add to Trip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapExplorer;
