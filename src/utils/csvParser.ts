//csvParser.ts

import Papa from "papaparse";
import type { WiFiData } from "@/type/wifi";

export const parseWiFiCSV = async (file: File): Promise<WiFiData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const data = results.data as WiFiData[];
        const validData = data.filter(
          (row) =>
            (row.latitude || row.LATITUDE) &&
            (row.longitude || row.LONGITUDE) &&
            !isNaN(row.latitude || row.LATITUDE) &&
            !isNaN(row.longitude || row.LONGITUDE) &&
            (row.latitude || row.LATITUDE) !== 0 &&
            (row.longitude || row.LONGITUDE) !== 0
        );
        resolve(validData);
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
};

export const loadCSVFromPath = async (path: string): Promise<WiFiData[]> => {
  try {
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const data = results.data as any[];
          
          // Normalize column names (handle both uppercase and lowercase)
          const normalizedData = data.map(row => ({
            ...row,
            latitude: row.latitude || row.LATITUDE,
            longitude: row.longitude || row.LONGITUDE,
            SSID: row.SSID || row.ssid,
            BSSID: row.BSSID || row.bssid,
            AUTHENTICATION: row.AUTHENTICATION || row.authentication,
            ENCRYPTION: row.ENCRYPTION || row.encryption,
            CHANNEL: row.CHANNEL || row.channel,
            'RADIO TYPE': row['RADIO TYPE'] || row['radio type'] || row.radioType,
            frequency: row.frequency || row.FREQUENCY,
            signal: row.signal || row.SIGNAL,
            MANUFACTURER: row.MANUFACTURER || row.manufacturer,
          }));
          
          const validData = normalizedData.filter(
            (row) =>
              row.latitude &&
              row.longitude &&
              !isNaN(row.latitude) &&
              !isNaN(row.longitude) &&
              row.latitude !== 0 &&
              row.longitude !== 0
          );
          
          console.log(`Parsed ${data.length} rows, ${validData.length} valid entries`);
          resolve(validData as WiFiData[]);
        },
        error: (error: Error) => {
          reject(new Error(`Parse error: ${error.message}`));
        },
      });
    });
  } catch (error) {
    throw new Error(`Failed to load CSV from ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};