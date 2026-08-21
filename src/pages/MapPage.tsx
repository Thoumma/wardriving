import { useState } from "react";
import MapAside from "@/layouts/map_layout/MapAside";
import MapNav from "@/layouts/map_layout/MapNav";
import MapComponent from "@/components/MapComponent"; // Adjust path as needed
import type { LocationPosition } from "@/utils/locationUtils";

export default function MapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationPosition | null>(
    null
  );
  const [authFilter, setAuthFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLocationUpdate = (location: LocationPosition | null) => {
    setUserLocation(location);
  };

  const handleFilterChange = (filter: string) => {
    setAuthFilter(filter);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Debug
  console.log("user location:", userLocation);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex justify-center items-center">
        <MapNav
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          currentFilter={authFilter}
          searchQuery={searchQuery}
        />
      </div>

      {/* Right sidebar */}
      <div className={`absolute top-12 right-0 z-[1000] h-[calc(100%-3rem)] transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-84 shadow-lg' : 'w-0'
        }`}>
        <MapAside isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* Map content */}
      <MapComponent
        userLocation={userLocation}
        onLocationUpdate={handleLocationUpdate}
        center={[17.9757, 102.6369]}
        zoom={7}
        minZoom={5}
        maxZoom={18}
        className="h-full w-full"
        showLocationButton={true}
        locationButtonPosition="bottomleft"
        zoomControlPosition="bottomleft"
        authFilter={authFilter}
        searchQuery={searchQuery}
      />
    </div>
  );
}
