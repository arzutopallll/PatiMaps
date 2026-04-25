import Papa from 'papaparse';
import { Museum } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQefia9vVQVX8wtyB2OJPu21dNn3onLfOK48dkumqlW0lf8qiX2Q_hucFkLmcluomkGLYD0CeRsJxQ5/pub?output=csv';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ISTANBUL_DISTRICTS: Record<string, {lat: number, lng: number}> = {
  "Adalar": { lat: 40.8719, lng: 29.1245 },
  "Arnavutköy": { lat: 41.1837, lng: 28.7410 },
  "Ataşehir": { lat: 40.9856, lng: 29.1084 },
  "Avcılar": { lat: 40.9796, lng: 28.7215 },
  "Bağcılar": { lat: 41.0335, lng: 28.8443 },
  "Bahçelievler": { lat: 41.0003, lng: 28.8443 },
  "Bakırköy": { lat: 40.9785, lng: 28.8724 },
  "Başakşehir": { lat: 41.1068, lng: 28.7997 },
  "Bayrampaşa": { lat: 41.0345, lng: 28.9015 },
  "Beşiktaş": { lat: 41.0435, lng: 29.0069 },
  "Beykoz": { lat: 41.1278, lng: 29.0988 },
  "Beylikdüzü": { lat: 40.9922, lng: 28.6432 },
  "Beyoğlu": { lat: 41.0370, lng: 28.9748 },
  "Büyükçekmece": { lat: 41.0210, lng: 28.5873 },
  "Çatalca": { lat: 41.1437, lng: 28.4610 },
  "Çekmeköy": { lat: 41.0343, lng: 29.1772 },
  "Esenler": { lat: 41.0366, lng: 28.8797 },
  "Esenyurt": { lat: 41.0344, lng: 28.6800 },
  "Eyüpsultan": { lat: 41.0475, lng: 28.9328 },
  "Fatih": { lat: 41.0150, lng: 28.9500 },
  "Gaziosmanpaşa": { lat: 41.0573, lng: 28.9135 },
  "Güngören": { lat: 41.0253, lng: 28.8727 },
  "Kadıköy": { lat: 40.9901, lng: 29.0292 },
  "Kağıthane": { lat: 41.0805, lng: 28.9741 },
  "Kartal": { lat: 40.8906, lng: 29.1916 },
  "Küçükçekmece": { lat: 41.0000, lng: 28.7770 },
  "Maltepe": { lat: 40.9231, lng: 29.1345 },
  "Pendik": { lat: 40.8767, lng: 29.2319 },
  "Sancaktepe": { lat: 40.9902, lng: 29.2275 },
  "Sarıyer": { lat: 41.1661, lng: 29.0504 },
  "Silivri": { lat: 41.0747, lng: 28.2483 },
  "Sultanbeyli": { lat: 40.9664, lng: 29.2667 },
  "Sultangazi": { lat: 41.1092, lng: 28.8687 },
  "Şile": { lat: 41.1744, lng: 29.6125 },
  "Şişli": { lat: 41.0601, lng: 28.9876 },
  "Tuzla": { lat: 40.8153, lng: 29.3083 },
  "Ümraniye": { lat: 41.0256, lng: 29.0980 },
  "Üsküdar": { lat: 41.0242, lng: 29.0163 },
  "Zeytinburnu": { lat: 40.9890, lng: 28.9038 }
};

// Simplified address for better matching
function getCleanAddress(address: string): string {
  // Try to remove "no: 16", "kat: 2", etc to just get street name
  return address.split(',')[0].trim();
}

async function geocodeAddress(address: string, district: string): Promise<{ lat: number, lng: number } | null> {
  if (!address || !district) return null;
  const cleanAddr = getCleanAddress(address);
  const query = encodeURIComponent(`${cleanAddr}, ${district}, İstanbul`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
    
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IstanbulMekanMapApp/1.2'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error("Geocoding failed/timeout for:", address);
  }
  return null;
}

function getFallbackCoordinate(district: string) {
  const cleanDistrict = district.trim().toLowerCase().replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ğ/g, 'g');
  
  // Try to find a match
  const found = Object.keys(ISTANBUL_DISTRICTS).find(k => {
     const kClean = k.toLowerCase().replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ğ/g, 'g');
     return kClean === cleanDistrict;
  });

  let coords = found ? { ...ISTANBUL_DISTRICTS[found] } : { lat: 41.0082, lng: 28.9784 }; // default Istanbul
  
  // Add slight random offset to prevent exact overlapping markers
  coords.lat += (Math.random() - 0.5) * 0.02;
  coords.lng += (Math.random() - 0.5) * 0.02;
  
  return coords;
}

export async function fetchMuseums(
  onProgress?: (msg: string) => void,
  onPartialData?: (data: Museum[]) => void
): Promise<Museum[]> {
  if (onProgress) onProgress("Veriler yükleniyor...");
  
  const response = await fetch(`${CSV_URL}&timestamp=${new Date().getTime()}`, { cache: 'no-store' });
  const csvText = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      skipEmptyLines: true,
      complete: async (results) => {
        // results.data is an array of arrays
        const rows = results.data as string[][];
        // skip title and header (index 0 and 1)
        const dataRows = rows.slice(2);
        
        const IMAGE_OVERRIDES: Record<string, string> = {
          "Beykoz Bld. Hayvan Rehab. Mer.": "https://web-cdn.beykoz.bel.tr/uploads/news/1667/cover/9005/conversions/img-3607jpg_f2d7b880c3c07e86d2256ef90c9c45e5-thumb.jpg",
          "Beşiktaş Bld.Veteriner İşleri": "https://pbs.twimg.com/media/FPhRAtdWUAUY9LV.jpg",
          "Küçükçekmece Bld. Hayvan Rehab. Merk.": "https://kucukcekmece.istanbul/Content/piclib/bigsize/icerikler/31653/k56a1393-51522-0674758.jpg",
          "Küçükçekmece Bld. Rehab. Merk.": "https://kucukcekmece.istanbul/Content/piclib/bigsize/icerikler/31653/k56a1393-51522-0674758.jpg",
          "Sancakpati Veteriner Kliniği": "https://avatars.mds.yandex.net/get-altay/19534558/2a0000019c1e3bab581bb37ff0f11e2f2523/L_height",
          "Ümraniye Bld. Hayvan Bakımevi": "https://img.piri.net/piri/upload/3/2023/10/18/d96b29f8-s95lrj4yyddumgbcm6ot.jpeg",
          "Şişli Veteriner Kliniği": "https://sisliveteriner.net/wp-content/uploads/2019/10/logo_header.png",
          "Fatih Bld. Hayvan Sağlığı Merkezi": "https://www.fatih.bel.tr/webfiles/fotograf/foto/70941-70941_sahiplendirme-faaliyetleri_20260303-115244-fatihbel_fotogaleri_900x530.jpg",
          "Zeytinburnu Bld. Tedavi Birimi": "https://web-cdnprod.aa.com.tr/uploads/Contents/2021/08/19/thumbs_b_c_e218b83804e3b1e7543381b0a3b39a1b.jpg?v=103315",
          // The Google user content image for Fatih was returning a 400 error. Adding a reliable fallback or clear the broken one.
          "Fatih Veteriner Kliniği": "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=600&auto=format&fit=crop"
        };
        
        const NAME_OVERRIDES: Record<string, string> = {
          "Küçükçekmece Bld. Rehab. Merk.": "Küçükçekmece Bld. Hayvan Rehab. Merk."
        };

        const museums: Museum[] = dataRows.map((row, index) => {
          let rawName = row[0]?.trim() || '';
          rawName = NAME_OVERRIDES[rawName] || rawName;
          
          let mediaUrl = IMAGE_OVERRIDES[rawName] || row[16]?.trim() || '';
          if (!mediaUrl && row.length > 0) {
            const lastCol = row[row.length - 1];
            if (lastCol && lastCol.trim().startsWith('http')) {
              mediaUrl = lastCol.trim();
            }
          }
          
          return {
            id: `museum-${index}`,
            name: rawName,
            district: row[3]?.trim() || '',
            type: row[4]?.trim() || '',
            address: row[6]?.trim() || '',
            phone: row[11]?.trim() || '',
            workingHours: row[13]?.trim() || '',
            rating: row[14]?.trim() || '',
            media: IMAGE_OVERRIDES[rawName] || mediaUrl,
          };
        }).filter(m => m.name !== '');

        // Now handle geocoding with localStorage cache
        const cachedStr = localStorage.getItem('geocoded_locations_v3');
        let cache: Record<string, {lat: number, lng: number}> = cachedStr ? JSON.parse(cachedStr) : {};
        
        const completedMuseums: Museum[] = [];
        const pendingMuseums: { m: Museum, cacheKey: string }[] = [];

        // First pass: resolve cached ones instantly
        for (const m of museums) {
          const cacheKey = `${m.address}-${m.district}`;
          if (cache[cacheKey]) {
            m.lat = cache[cacheKey].lat;
            m.lng = cache[cacheKey].lng;
            completedMuseums.push(m);
          } else {
            pendingMuseums.push({ m, cacheKey });
          }
        }

        // Emit cached data immediately
        if (onPartialData && completedMuseums.length > 0) {
          onPartialData([...completedMuseums]);
        }
        
        // Second pass: geocode pending ones progressively
        for (let i = 0; i < pendingMuseums.length; i++) {
          const { m, cacheKey } = pendingMuseums[i];
          if (onProgress) onProgress(`Koordinatlar bulunuyor (${completedMuseums.length + 1}/${museums.length})...`);
          
          let coords = await geocodeAddress(m.address, m.district);
          
          // If the specific address failed, fallback to random point in district immediately
          if (!coords) {
             coords = getFallbackCoordinate(m.district);
          }

          m.lat = coords.lat;
          m.lng = coords.lng;
          cache[cacheKey] = coords;
          
          completedMuseums.push(m);
          
          // Save cache incrementally and update UI
          localStorage.setItem('geocoded_locations_v3', JSON.stringify(cache));
          if (onPartialData) {
            onPartialData([...completedMuseums]);
          }
          
          // Limit to 1 request per second as per Nominatim policy (only if we actually made a network request)
          await sleep(1000); 
        }
        
        console.log("MAPPED:", completedMuseums.length, "Total:", museums.length);
        if (onProgress) onProgress("Hazır!");
        resolve(completedMuseums);
      }
    });
  });
}
