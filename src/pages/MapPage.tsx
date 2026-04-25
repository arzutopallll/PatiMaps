import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Phone, Clock, Star, Navigation, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMuseums } from '../services/dataService';
import { Museum } from '../types';

// Fix typical React-Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (type: string) => {
  const isKlinik = type.toLowerCase().includes('klinik') || type.toLowerCase().includes('hastane');
  const color = isKlinik ? '#10b981' : '#8b5cf6'; // Emerald 500 for klinik, Violet 500 for others

  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`;

  const html = `
    <div style="
      width: 30px; height: 30px; 
      background: white; border-radius: 50%;
      border: 2px solid ${color};
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      color: ${color};
    ">
      ${svgIcon}
    </div>
    <div style="
      width: 0; height: 0; 
      border-left: 6px solid transparent; 
      border-right: 6px solid transparent; 
      border-top: 8px solid ${color}; 
      margin: -2px auto 0;
    "></div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -36],
    tooltipAnchor: [0, -36]
  });
};

// Component to dynamically fit bounds to all markers
function ChangeView({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
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
    fetchMuseums((msg) => {
      if (isMounted) setProgress(msg);
    }).then(data => {
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
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
             <MapPin size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Pati<span className="text-indigo-600">Maps</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={() => navigate('/')}
             className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Ana Sayfa
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium text-gray-800 animate-pulse">{progress}</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
              (Adresler OpenStreetMap üzerinden koordinatlara çevriliyor. Veri çokluğu nedeniyle bu işlem biraz zaman alabilir.)
            </p>
          </div>
        )}

        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 hidden md:flex">
           <div className="p-4 border-b border-slate-100 bg-slate-50/50">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kayıtlı Noktalar ({museums.length})</h2>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">İstanbul</span>
             </div>
             <div className="text-[10px] text-slate-400 italic">Açık kaynaklı harita verileri</div>
           </div>
           <div className="flex-1 overflow-y-auto">
             <div className="divide-y divide-slate-100">
               {museums.map(museum => (
                 <div key={museum.id} className="p-4 hover:bg-slate-50 transition-colors">
                   <h3 className="font-semibold text-sm text-slate-800">{museum.name}</h3>
                   <p className="text-xs text-slate-500 mb-1">{museum.district}</p>
                   {museum.type && (
                     <div className="flex gap-2">
                       <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">{museum.type}</span>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>
        </aside>

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
                 <Tooltip direction="top" offset={[0, -30]} opacity={1} className="bg-white border-none shadow-lg rounded-xl text-sm font-sans px-3 py-2">
                   <div className="font-semibold">{museum.name}</div>
                   <div className="text-gray-500 text-xs">{museum.district} {museum.type ? `- ${museum.type}` : ''}</div>
                 </Tooltip>
                  <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                   <div className="w-[280px] font-sans">
                     {museum.media && (
                       <img src={museum.media} alt={museum.name} className="w-full h-32 object-cover" />
                     )}
                     <div className="p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">{museum.name}</h4>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {museum.address && (
                            <div className="flex gap-2 text-[11px]">
                              <MapPin size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600">{museum.address}</span>
                            </div>
                          )}
                          {museum.phone && (
                            <div className="flex gap-2 text-[11px]">
                              <Phone size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600">{museum.phone}</span>
                            </div>
                          )}
                          {museum.workingHours && (
                            <div className="flex gap-2 text-[11px]">
                              <Clock size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600">{museum.workingHours}</span>
                            </div>
                          )}
                          {museum.rating && (
                            <div className="flex gap-2 text-[11px]">
                              <Star size={14} className="shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-slate-600">Puan: <strong className="text-slate-800">{museum.rating}</strong></span>
                            </div>
                          )}
                        </div>

                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${museum.lat},${museum.lng}`}
                          target="_blank" rel="noreferrer"
                          className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-800 text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-slate-900 transition-colors"
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
