import React, { useEffect, useMemo, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  type WiFiData,
  getSignalStrength,
  getSecurityLevel,
} from "@/type/wifi";
import { LOCATION_ICONS } from "@/constants/location_icon";

interface WiFiMarkersProps {
  data: WiFiData[];
}

// Shared icon instances
const iconInstances = {
  green: null as L.Icon | null,
  yellow: null as L.Icon | null,
  red: null as L.Icon | null,
};

const getOrCreateIcon = (color: "green" | "yellow" | "red"): L.Icon => {
  if (!iconInstances[color]) {
    iconInstances[color] = L.icon({
      iconUrl: LOCATION_ICONS[color],
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      className: "wifi-location-marker",
    });
  }
  return iconInstances[color]!;
};

const getIconForSignal = (signal: number): L.Icon => {
  const signalValue = typeof signal === "number" ? signal : parseFloat(signal);

  if (isNaN(signalValue) || signalValue < -70) {
    return getOrCreateIcon("red");
  } else if (signalValue >= -50) {
    return getOrCreateIcon("green");
  } else {
    return getOrCreateIcon("yellow");
  }
};

const createSingleWiFiPopup = (wifi: WiFiData): string => {
  const security = getSecurityLevel(wifi.AUTHENTICATION);
  const signalStrength = getSignalStrength(wifi.signal);

  const getSignalBadgeClass = (signal: number) => {
    if (signal >= -50) return "bg-green-500";
    if (signal >= -60) return "bg-blue-500";
    if (signal >= -70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSecurityBadgeClass = (auth: string) => {
    if (auth.includes("WPA3")) return "bg-green-500";
    if (auth.includes("WPA2")) return "bg-blue-500";
    return "bg-red-500";
  };

  const signalBadgeClass = getSignalBadgeClass(wifi.signal);
  const securityBadgeClass = getSecurityBadgeClass(wifi.AUTHENTICATION);

  const tableRows = [
    {
      property: "Network Name (SSID)",
      value: wifi.SSID || "🔒 Hidden Network",
      icon: true,
    },
    { property: "MAC Address (BSSID)", value: wifi.BSSID, icon: false },
    {
      property: "Signal Strength",
      value: `${wifi.signal} dBm`,
      badge: signalStrength,
      badgeClass: signalBadgeClass,
      icon: true,
    },
    {
      property: "Security",
      value: wifi.AUTHENTICATION,
      badge: security.level,
      badgeClass: securityBadgeClass,
      icon: true,
    },
    { property: "Encryption", value: wifi.ENCRYPTION || "N/A", icon: false },
    {
      property: "Channel / Frequency",
      value: `Ch ${wifi.CHANNEL} (${wifi.frequency} MHz)`,
      icon: true,
    },
    { property: "Radio Type", value: wifi["RADIO TYPE"], icon: false },
    {
      property: "Location",
      value: `${wifi.latitude.toFixed(6)}°N, ${wifi.longitude.toFixed(6)}°E`,
      icon: false,
    },
  ];

  return `
    <div class="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4">
      <div class="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
        <div class="p-1.5 sm:p-2 lg:p-3 bg-blue-100 rounded-lg flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">WiFi Network Details</h2>
          <p class="text-xs sm:text-sm lg:text-base text-gray-500 hidden sm:block">Complete information about detected network</p>
        </div>
      </div>

      <div class="border rounded-lg overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[280px]">
            <thead>
              <tr class="bg-gray-50 border-b">
                <th class="text-left py-2 px-2 sm:px-3 lg:py-3 lg:px-4 font-semibold text-xs sm:text-sm lg:text-base text-gray-700">Property</th>
                <th class="text-left py-2 px-2 sm:px-3 lg:py-3 lg:px-4 font-semibold text-xs sm:text-sm lg:text-base text-gray-700">Value</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows
      .map(
        (row) => `
              <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="py-2 px-2 sm:px-3 lg:py-3 lg:px-4 font-medium text-xs sm:text-sm lg:text-base text-gray-900">
                  <div class="flex items-center gap-1 sm:gap-2 lg:gap-3">
                    ${row.icon
            ? `<span class="text-gray-500 flex-shrink-0">${getIcon(
              row.property
            )}</span>`
            : ""
          }
                    <span class="truncate">${row.property}</span>
                  </div>
                </td>
                <td class="py-2 px-2 sm:px-3 lg:py-3 lg:px-4 text-xs sm:text-sm lg:text-base text-gray-700">
                  <div class="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-wrap">
                    <span class="break-all">${row.value}</span>
                    ${row.badge
            ? `<span class="inline-flex items-center px-1.5 sm:px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full text-[10px] sm:text-xs lg:text-sm font-medium text-white ${row.badgeClass} whitespace-nowrap">${row.badge}</span>`
            : ""
          }
                  </div>
                </td>
              </tr>
            `
      )
      .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

function getIcon(property: string): string {
  const icons: Record<string, string> = {
    "Network Name (SSID)":
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>',
    "Signal Strength":
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
    Security:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>',
    "Channel / Frequency":
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
  };
  return icons[property] || "";
}

export const WiFiMarkers: React.FC<WiFiMarkersProps> = ({ data }) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const expandedLayerRef = useRef<L.LayerGroup | null>(null);
  const activeClusterRef = useRef<L.MarkerCluster | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cluster options - always keep clustering, never show all markers
  const clusterOptions = useMemo(
    () => ({
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 25,
      maxClusterRadius: (zoom: number) => {
        // Smaller radius at higher zoom for more precise groups
        if (zoom <= 10) return 120;
        if (zoom <= 13) return 80;
        if (zoom <= 15) return 60;
        if (zoom <= 17) return 40;
        return 25;
      },
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false, // We handle clicks manually
      disableClusteringAtZoom: 25, // Never auto-expand (25 is beyond max zoom)
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: false,
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        const count = cluster.getChildCount();
        let size = 40;
        let color = "#3b82f6";

        if (count > 1000) {
          size = 70;
          color = "#dc2626";
        } else if (count > 500) {
          size = 60;
          color = "#ea580c";
        } else if (count > 100) {
          size = 50;
          color = "#f59e0b";
        } else if (count > 50) {
          size = 45;
          color = "#10b981";
        }

        return L.divIcon({
          html: `<div style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.floor(
            size / 2.5
          )}px;border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);cursor:pointer">${count}</div>`,
          className: "marker-cluster-wifi",
          iconSize: L.point(size, size),
        });
      },
    }),
    []
  );

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    // Debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Clean up existing layers
      if (expandedLayerRef.current) {
        map.removeLayer(expandedLayerRef.current);
        expandedLayerRef.current = null;
        activeClusterRef.current = null;
      }

      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current.clearLayers();
      }

      // Create new cluster group
      const clusterGroup = L.markerClusterGroup(clusterOptions);
      clusterGroupRef.current = clusterGroup;

      // Handle cluster click - expand THIS cluster only
      clusterGroup.on("clusterclick", (event: any) => {
        event.originalEvent.stopPropagation();

        const cluster = event.layer;
        const childMarkers = cluster.getAllChildMarkers();
        const clusterSize = childMarkers.length;

        // If cluster is too large (>500), zoom in instead of expanding
        const MAX_EXPAND_SIZE = 500;
        if (clusterSize > MAX_EXPAND_SIZE) {
          // Zoom to cluster bounds instead of expanding
          const bounds = cluster.getBounds();
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: map.getZoom() + 2
          });
          return;
        }

        // If clicking the same cluster, collapse it
        if (activeClusterRef.current === cluster && expandedLayerRef.current) {
          map.removeLayer(expandedLayerRef.current);
          expandedLayerRef.current = null;
          activeClusterRef.current = null;

          // Show the cluster icon again
          const clusterIcon = cluster.getElement();
          if (clusterIcon) {
            clusterIcon.style.display = "";
          }
          return;
        }

        // Remove previous expanded layer and show previous cluster
        if (expandedLayerRef.current) {
          map.removeLayer(expandedLayerRef.current);

          // Show the previous cluster icon
          if (activeClusterRef.current) {
            const prevClusterIcon = activeClusterRef.current.getElement();
            if (prevClusterIcon) {
              prevClusterIcon.style.display = "";
            }
          }
        }

        // Hide the clicked cluster icon
        const clusterIcon = cluster.getElement();
        if (clusterIcon) {
          clusterIcon.style.display = "none";
        }

        // Create new layer group for expanded markers
        const expandedLayer = L.layerGroup();
        expandedLayerRef.current = expandedLayer;
        activeClusterRef.current = cluster;

        // Add expanded markers to map first (empty)
        expandedLayer.addTo(map);

        // Group markers by location to handle overlapping markers
        const locationGroups = new Map<string, any[]>();
        childMarkers.forEach((marker: any) => {
          const wifi = marker._wifiData;
          if (wifi) {
            const key = `${wifi.latitude.toFixed(6)},${wifi.longitude.toFixed(6)}`;
            if (!locationGroups.has(key)) {
              locationGroups.set(key, []);
            }
            locationGroups.get(key)!.push(wifi);
          }
        });

        // Process markers in batches to avoid freezing
        const allWifiData: any[] = [];
        locationGroups.forEach((wifis, locationKey) => {
          const [lat, lng] = locationKey.split(',').map(Number);

          if (wifis.length === 1) {
            // Single marker at this location
            allWifiData.push({ wifi: wifis[0], lat, lng });
          } else {
            // Multiple markers at same location - spread them in a circle
            const radius = 0.0001; // Small offset in degrees (~11 meters)
            const angleStep = (2 * Math.PI) / wifis.length;

            wifis.forEach((wifi, index) => {
              const angle = angleStep * index;
              const offsetLat = lat + (radius * Math.cos(angle));
              const offsetLng = lng + (radius * Math.sin(angle));
              allWifiData.push({ wifi, lat: offsetLat, lng: offsetLng });
            });
          }
        });

        // Now process all markers in batches
        const BATCH_SIZE = 50;
        let currentIndex = 0;

        const processBatch = () => {
          const endIndex = Math.min(currentIndex + BATCH_SIZE, allWifiData.length);

          for (let i = currentIndex; i < endIndex; i++) {
            const { wifi, lat, lng } = allWifiData[i];
            const individualMarker = L.marker([lat, lng], {
              icon: getIconForSignal(wifi.signal),
              zIndexOffset: 1000, // Show on top of clusters
            });

            // Bind popup
            individualMarker.bindPopup(createSingleWiFiPopup(wifi), {
              maxWidth: 900,
              minWidth: 280,
              className: "wifi-custom-popup",
              autoPan: true,
              autoPanPadding: [10, 10],
            });

            expandedLayer.addLayer(individualMarker);
          }

          currentIndex = endIndex;

          // Continue processing if there are more markers
          if (currentIndex < allWifiData.length) {
            requestAnimationFrame(processBatch);
          }
        };

        // Start processing
        processBatch();
      });

      // Click on map (not on marker/cluster) to collapse expanded view
      map.on("click", () => {
        if (expandedLayerRef.current) {
          map.removeLayer(expandedLayerRef.current);
          expandedLayerRef.current = null;

          // Show the cluster icon again
          if (activeClusterRef.current) {
            const clusterIcon = activeClusterRef.current.getElement();
            if (clusterIcon) {
              clusterIcon.style.display = "";
            }
          }

          activeClusterRef.current = null;
        }
      });

      // Collapse expanded markers on zoom change
      map.on("zoomstart", () => {
        if (expandedLayerRef.current) {
          map.removeLayer(expandedLayerRef.current);
          expandedLayerRef.current = null;

          // Show the cluster icon again
          if (activeClusterRef.current) {
            const clusterIcon = activeClusterRef.current.getElement();
            if (clusterIcon) {
              clusterIcon.style.display = "";
            }
          }

          activeClusterRef.current = null;
        }
      });

      // Process markers in chunks
      const processChunk = (startIndex: number) => {
        const chunkSize = 500;
        const endIndex = Math.min(startIndex + chunkSize, data.length);
        const markers: L.Marker[] = [];

        for (let i = startIndex; i < endIndex; i++) {
          const wifi = data[i];

          if (
            !wifi ||
            typeof wifi.latitude !== "number" ||
            typeof wifi.longitude !== "number" ||
            isNaN(wifi.latitude) ||
            isNaN(wifi.longitude)
          ) {
            continue;
          }

          try {
            // Create invisible marker (will only be visible when cluster is clicked)
            const marker = L.marker([wifi.latitude, wifi.longitude], {
              icon: getIconForSignal(wifi.signal),
              opacity: 0, // Hidden until expanded
            });

            // Store wifi data
            (marker as any)._wifiData = wifi;

            markers.push(marker);
          } catch (error) {
            console.error("Error creating marker:", error);
          }
        }

        if (markers.length > 0) {
          clusterGroup.addLayers(markers);
        }

        if (endIndex < data.length) {
          if ("requestIdleCallback" in window) {
            requestIdleCallback(() => processChunk(endIndex), { timeout: 100 });
          } else {
            setTimeout(() => processChunk(endIndex), 0);
          }
        }
      };

      // Add cluster to map and start processing
      map.addLayer(clusterGroup);
      processChunk(0);
    }, 150);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      map.off("click");
      map.off("zoomstart");

      if (expandedLayerRef.current) {
        map.removeLayer(expandedLayerRef.current);
        expandedLayerRef.current = null;
      }

      if (clusterGroupRef.current && map.hasLayer(clusterGroupRef.current)) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current.clearLayers();
        clusterGroupRef.current = null;
      }
    };
  }, [map, data, clusterOptions]);

  return null;
};
