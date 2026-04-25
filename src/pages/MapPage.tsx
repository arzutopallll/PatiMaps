import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Phone, Clock, Star, Navigation, Loader2, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMuseums } from '../services/dataService';
import { Museum } from '../types';

const SafeImage = ({ src, alt, className }: { src?: string; alt: string; className?: string }) => {
  const [error, setError] = useState(false);

  // Default pet-related image or placeholder
  const placeholder = 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80';

  if (!src || error) {
    return (
      <img 
        src={placeholder} 
        alt="Görsel Yok" 
        className={className} 
      />
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};

// Fix typical React-Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (type: string) => {
  const isKlinik = type.toLowerCase().includes('klinik') || type.toLowerCase().includes('hastane');
  const color = isKlinik ? '#16a34a' : '#9333ea'; // Green 600 for klinik, Purple 600 for belediye

  const klinikIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`;
  
  const belediyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;

  const svgIcon = isKlinik ? klinikIcon : belediyeIcon;

  const html = `
    <div style="
      width: 40px; height: 40px; 
      background: white; border-radius: 50%;
      border: 3px solid ${color};
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.15);
      color: ${color};
    ">
      ${svgIcon}
    </div>
    <div style="
      width: 0; height: 0; 
      border-left: 8px solid transparent; 
      border-right: 8px solid transparent; 
      border-top: 10px solid ${color}; 
      margin: -2px auto 0;
    "></div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
    tooltipAnchor: [0, -50]
  });
};

// Component to dynamically fit bounds to all markers
function ChangeView({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [bounds, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState("Veriler hazırlanıyor...");

  useEffect(() => {
    let isMounted = true;
    
    const handleProgress = (msg: string) => {
      if (isMounted) setProgress(msg);
    };

    const handlePartialData = (partialMuseums: Museum[]) => {
      if (isMounted) setMuseums(partialMuseums);
    };

    fetchMuseums(handleProgress, handlePartialData).then(data => {
      if (isMounted) {
        setMuseums(data);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, []);

  let bounds: L.LatLngBounds | null = null;
  if (museums.length > 0) {
    const latLngs = museums.map(m => [m.lat!, m.lng!] as [number, number]);
    bounds = L.latLngBounds(latLngs);
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-sm">
             <MapPin size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Pati<span className="text-orange-500 dark:text-orange-400">Maps</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div 
             className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm flex items-center gap-2"
          >
            {museums.length} Mekan Listelendi
          </div>
          <button 
             onClick={() => navigate('/')}
             className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Ana Sayfa
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {loading && museums.length === 0 && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium text-gray-800 animate-pulse">{progress}</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
              (Adresler OpenStreetMap üzerinden koordinatlara çevriliyor. Veri çokluğu nedeniyle bu işlem biraz zaman alabilir.)
            </p>
          </div>
        )}
        
        {loading && museums.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium text-slate-700">{progress}</span>
          </div>
        )}

        {/* Map Container */}
        <main className="flex-1 relative bg-slate-200 z-0">
          <MapContainer 
            center={[41.0082, 28.9784]} 
            zoom={11} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {museums.map(museum => (
               <Marker 
                key={museum.id} 
                position={[museum.lat!, museum.lng!]}
                icon={createCustomIcon(museum.type || '')}
               >
                 <Tooltip direction="top" offset={[0, -30]} opacity={1} className="bg-white dark:bg-slate-800 border-none shadow-lg rounded-xl text-sm font-sans px-3 py-2 text-slate-800 dark:text-slate-100">
                   <div className="font-semibold">{museum.name}</div>
                   <div className="text-gray-500 dark:text-gray-400 text-xs">{museum.district} {museum.type ? `- ${museum.type}` : ''}</div>
                 </Tooltip>
                  <Popup className="rounded-xl overflow-hidden shadow-2xl border-0 !p-0">
                   <div className="w-[280px] font-sans bg-white dark:bg-slate-800">
                     <SafeImage src={museum.media} alt={museum.name} className="w-full h-32 object-cover" />
                     <div className="p-4 bg-white dark:bg-slate-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{museum.name}</h4>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {museum.address && (
                            <div className="flex gap-2 text-[11px]">
                              <MapPin size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600 dark:text-slate-300">{museum.address}</span>
                            </div>
                          )}
                          {museum.phone && (
                            <div className="flex gap-2 text-[11px]">
                              <Phone size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600 dark:text-slate-300">{museum.phone}</span>
                            </div>
                          )}
                          {museum.workingHours && (
                            <div className="flex gap-2 text-[11px]">
                              <Clock size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600 dark:text-slate-300">{museum.workingHours}</span>
                            </div>
                          )}
                          {museum.rating && (
                            <div className="flex gap-2 text-[11px]">
                              <Star size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600 dark:text-slate-300">Puan: <strong className="text-slate-800 dark:text-slate-100">{museum.rating}</strong></span>
                            </div>
                          )}
                        </div>

                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${museum.lat},${museum.lng}`}
                          target="_blank" rel="noreferrer"
                          className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-800 dark:bg-indigo-600 text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-slate-900 dark:hover:bg-indigo-700 transition-colors"
                        >
                          <Navigation size={14} />
                          Yol Tarifi Al
                        </a>
                     </div>
                   </div>
                 </Popup>
               </Marker>
            ))}
            {bounds && <ChangeView bounds={bounds} />}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}
