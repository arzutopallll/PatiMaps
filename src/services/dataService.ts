import Papa from 'papaparse';
import { Museum } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1q-oA61Ba4fYMvkT5EycxhQPZjmMIoA-F2OaAZiyTdl4/export?format=csv';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address: string, district: string): Promise<{ lat: number, lng: number } | null> {
  // To improve Nominatim success, sometimes cleaning detailed address helps, but we'll try the full one and fallback to district.
  const query = encodeURIComponent(`${address}, ${district}, İstanbul`);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IstanbulMekanMapApp/1.0' // Nominatim requires a User-Agent
      }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error("Geocoding failed for:", address);
  }
  return null;
}

export async function fetchMuseums(onProgress?: (msg: string) => void): Promise<Museum[]> {
  if (onProgress) onProgress("Veri indiriliyor...");
  
  const response = await fetch(CSV_URL);
  const csvText = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      skipEmptyLines: true,
      complete: async (results) => {
        // results.data is an array of arrays
        const rows = results.data as string[][];
        // skip title and header (index 0 and 1)
        const dataRows = rows.slice(2);
        
        const museums: Museum[] = dataRows.map((row, index) => {
          return {
            id: `museum-${index}`,
            name: row[0]?.trim() || '',
            district: row[3]?.trim() || '',
            type: row[4]?.trim() || '',
            address: row[6]?.trim() || '',
            phone: row[11]?.trim() || '',
            workingHours: row[13]?.trim() || '',
            rating: row[14]?.trim() || '',
            media: row[16]?.trim() || '',
          };
        }).filter(m => m.name !== '' && m.address !== '');

        // Now handle geocoding with localStorage cache
        const cachedStr = localStorage.getItem('geocoded_locations');
        let cache: Record<string, {lat: number, lng: number}> = cachedStr ? JSON.parse(cachedStr) : {};
        
        for (let i = 0; i < museums.length; i++) {
          const m = museums[i];
          const cacheKey = `${m.address}-${m.district}`;
          
          if (cache[cacheKey]) {
            m.lat = cache[cacheKey].lat;
            m.lng = cache[cacheKey].lng;
          } else {
            if (onProgress) onProgress(`Koordinatlar bulunuyor (${i + 1}/${museums.length})... Lütfen bekleyin.`);
            const coords = await geocodeAddress(m.address, m.district);
            
            // If the specific address failed, fallback to just district + Istanbul
            if (!coords && m.district) {
               const fallbackCoords = await geocodeAddress(m.district, m.district);
               if (fallbackCoords) {
                 m.lat = fallbackCoords.lat;
                 m.lng = fallbackCoords.lng;
                 cache[cacheKey] = fallbackCoords;
               }
            } else if (coords) {
              m.lat = coords.lat;
              m.lng = coords.lng;
              cache[cacheKey] = coords;
            }
            
            // Limit to 1 request per second as per Nominatim policy
            await sleep(1100); 
          }
        }
        
        localStorage.setItem('geocoded_locations', JSON.stringify(cache));
        
        // Return only mapped items
        const mappedMuseums = museums.filter(m => m.lat !== undefined && m.lng !== undefined);
        resolve(mappedMuseums);
      }
    });
  });
}
