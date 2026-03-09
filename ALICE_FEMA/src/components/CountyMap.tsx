import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as topojson from 'topojson-client';
import { RegistrationSummary, ValidRegistration } from '../types';
import { formatCurrency } from '../utils';
import { Map as MapIcon, Layers, RotateCcw, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin',
  WY: 'Wyoming', PR: 'Puerto Rico', DC: 'District of Columbia', GU: 'Guam', VI: 'Virgin Islands', AS: 'American Samoa', MP: 'Northern Mariana Islands'
};

interface CountyMapProps {
  stateAbbrs: string[];
  summaries: RegistrationSummary[];
  regSample?: ValidRegistration[];
  onCountyClick?: (countyName: string) => void;
}

const STATE_FIPS_MAP: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10', DC: '11', FL: '12',
  GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20', KY: '21', LA: '22', ME: '23',
  MD: '24', MA: '25', MI: '26', MN: '27', MS: '28', MO: '29', MT: '30', NE: '31', NV: '32', NH: '33',
  NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44',
  SC: '45', SD: '46', TN: '47', TX: '48', UT: '49', VT: '50', VA: '51', WA: '53', WV: '54', WI: '55',
  WY: '56', PR: '72', GU: '66', VI: '78', AS: '60', MP: '69'
};

const MapBoundsAdjuster: React.FC<{ bounds: L.LatLngBoundsExpression | null }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  return null;
};

export const CountyMap: React.FC<CountyMapProps> = ({ stateAbbrs, summaries, regSample = [], onCountyClick }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'county' | 'zipcode'>('county');

  const mapAmounts = useMemo(() => {
    const amounts: Record<string, number> = {};
    
    // Process summaries
    summaries.forEach(s => {
      if (viewMode === 'county') {
        if (!s.county) return;
        const key = s.county
          .replace(/\s*\(County\)$/i, '')
          .replace(/\s+County$/i, '')
          .replace(/\s+Parish$/i, '')
          .replace(/\s+Borough$/i, '')
          .replace(/\s+Census Area$/i, '')
          .trim()
          .toLowerCase();
        amounts[key] = (amounts[key] || 0) + (s.ihpAmount || 0);
      } else {
        const zip = s.zipCode || s.damagedZipCode;
        if (!zip) return;
        const key = zip.toString().trim().substring(0, 5);
        amounts[key] = (amounts[key] || 0) + (s.ihpAmount || 0);
      }
    });

    // Process regSample for additional zip code coverage if in zipcode mode
    if (viewMode === 'zipcode' && regSample.length > 0) {
      regSample.forEach(r => {
        const zip = r.zipCode;
        if (!zip) return;
        const key = zip.toString().trim().substring(0, 5);
        if (!amounts[key]) {
           amounts[key] = (amounts[key] || 0) + (r.ihpAmount || 0);
        }
      });
    }

    return amounts;
  }, [summaries, regSample, viewMode]);

  const dataCoverage = useMemo(() => {
    const count = Object.keys(mapAmounts).filter(k => mapAmounts[k] > 0).length;
    return count;
  }, [mapAmounts]);

  const maxAmount = useMemo(() => Math.max(...(Object.values(mapAmounts) as number[]), 1), [mapAmounts]);

  const topCounties = useMemo(() => {
    if (viewMode !== 'county') return [];
    return Object.entries(mapAmounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));
  }, [mapAmounts, viewMode]);

  useEffect(() => {
    let ignore = false;
    const loadGeoData = async () => {
      if (stateAbbrs.length === 0) {
        setGeoData(null);
        return;
      }
      
      setIsLoading(true);
      try {
        if (viewMode === 'county') {
          const resp = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json');
          const topoData = await resp.json();
          
          if (ignore) return;

          const fipsList = stateAbbrs.map(abbr => STATE_FIPS_MAP[abbr]).filter(Boolean);
          const allCounties = topojson.feature(topoData, topoData.objects.counties) as any;
          const filteredCounties = fipsList.length > 0
            ? { 
                type: 'FeatureCollection', 
                features: allCounties.features.filter((f: any) => {
                  const id = f.id.toString().padStart(5, '0');
                  return fipsList.includes(id.substring(0, 2));
                }) 
              }
            : allCounties;
            
          setGeoData(filteredCounties);
        } else {
          const features: any[] = [];
          for (const abbr of stateAbbrs) {
            if (ignore) return;
            const stateName = STATE_NAMES[abbr];
            if (!stateName) continue;
            try {
              const fileName = `${abbr.toLowerCase()}_${stateName.toLowerCase().replace(/\s+/g, '_')}_zip_codes_geo.min.json`;
              const resp = await fetch(`https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/${fileName}`);
              if (resp.ok) {
                const data = await resp.json();
                if (!ignore) {
                  features.push(...data.features);
                }
              }
            } catch (e) {
              console.warn(`Could not load zip codes for ${stateName}`, e);
            }
          }
          if (!ignore) {
            setGeoData({ type: 'FeatureCollection', features });
          }
        }
      } catch (err) {
        if (!ignore) console.error("Map load error:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadGeoData();
    return () => { ignore = true; };
  }, [stateAbbrs, viewMode]);


  const getColor = (amount: number) => {
    const t = Math.pow(amount / maxAmount, 0.5);
    const r = Math.round(219 + (0 - 219) * t);
    const g = Math.round(234 + (68 - 234) * t);
    const b = Math.round(254 + (181 - 254) * t);
    return `rgb(${r},${g},${b})`;
  };

  const style = (feature: any) => {
    const props = feature.properties;
    let key = '';
    if (viewMode === 'county') {
      key = (props.name || '').toLowerCase();
    } else {
      // Try to find a 5-digit zip code in any property
      const zipProps = ['ZCTA5CE10', 'zip', 'ZIP', 'zipcode', 'zip_code', 'ZCTA5', 'GEOID10', 'GEOID', 'name'];
      for (const p of zipProps) {
        if (props[p]) {
          const val = props[p].toString().trim().substring(0, 5);
          if (/^\d{5}$/.test(val)) {
            key = val;
            break;
          }
        }
      }
      // Last resort: check all properties for a 5-digit string
      if (!key) {
        for (const p in props) {
          const val = props[p]?.toString().trim().substring(0, 5);
          if (/^\d{5}$/.test(val)) {
            key = val;
            break;
          }
        }
      }
    }

    const amount = mapAmounts[key] || 0;
    const isSelected = selectedCounty === key;
    return {
      fillColor: amount > 0 ? getColor(amount) : '#f1f3f5',
      weight: isSelected ? 2 : 0.8,
      color: isSelected ? '#0044B5' : '#dee2e6',
      fillOpacity: 0.9
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    let name = '';
    let key = '';

    if (viewMode === 'county') {
      name = props.name;
      key = name.toLowerCase();
    } else {
      const zipProps = ['ZCTA5CE10', 'zip', 'ZIP', 'zipcode', 'zip_code', 'ZCTA5', 'GEOID10', 'GEOID', 'name'];
      for (const p of zipProps) {
        if (props[p]) {
          const val = props[p].toString().trim().substring(0, 5);
          if (/^\d{5}$/.test(val)) {
            name = val;
            key = val;
            break;
          }
        }
      }
      if (!name) {
        for (const p in props) {
          const val = props[p]?.toString().trim().substring(0, 5);
          if (/^\d{5}$/.test(val)) {
            name = val;
            key = val;
            break;
          }
        }
      }
    }

    const amount = mapAmounts[key] || 0;
    layer.bindTooltip(
      `<div>
        <strong>${viewMode === 'county' ? `${name} County` : `Zip Code ${name}`}</strong><br/>
        ${amount > 0 ? formatCurrency(amount) : 'No data'}
      </div>`,
      { sticky: true }
    );

    layer.on({
      click: (e) => {
        if (viewMode === 'county') {
          const countyName = feature.properties.name;
          setSelectedCounty(countyName.toLowerCase());
          if (onCountyClick) {
            onCountyClick(countyName);
          }
        }
        L.DomEvent.stopPropagation(e);
      }
    });
  };

  const bounds = useMemo(() => {
    if (!geoData || geoData.features.length === 0) return null;
    const layer = L.geoJSON(geoData);
    return layer.getBounds();
  }, [geoData]);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
        <div className="p-2 bg-[#0044B5]/5 rounded-xl">
          <MapIcon className="w-5 h-5 text-[#0044B5]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider">Geographic Distribution</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">IHP Approved Assistance by {viewMode}</p>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {selectedCounty && (
            <button 
              onClick={() => {
                setSelectedCounty(null);
                if (onCountyClick) onCountyClick('');
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-[#0044B5] uppercase tracking-widest hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => {
                if (viewMode !== 'county') {
                  setViewMode('county');
                  setGeoData(null);
                }
              }}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${viewMode === 'county' ? 'bg-white text-[#0044B5] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              County
            </button>
            <button 
              onClick={() => {
                if (viewMode !== 'zipcode') {
                  setViewMode('zipcode');
                  setGeoData(null);
                }
              }}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${viewMode === 'zipcode' ? 'bg-white text-[#0044B5] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Zipcode
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 relative">
          <div style={{ height: '480px' }}>
            <MapContainer 
              center={[37.8, -96] as L.LatLngExpression} 
              zoom={4} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
              {geoData && (
                <>
                  <GeoJSON 
                    key={`${viewMode}-${stateAbbrs.join('-')}-${geoData.features.length}`}
                    data={geoData} 
                    style={style as any} 
                    onEachFeature={onEachFeature} 
                  />
                  <MapBoundsAdjuster bounds={bounds as L.LatLngBoundsExpression} />
                </>
              )}
            </MapContainer>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-[#0044B5] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0044B5]">Syncing Map Data...</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-l border-gray-100 p-6 bg-gray-50/30">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Top Impacted Areas</h3>
          <div className="space-y-4">
            {topCounties.length > 0 ? (
              topCounties.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCounty(c.name);
                    if (onCountyClick) onCountyClick(c.name.charAt(0).toUpperCase() + c.name.slice(1));
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${selectedCounty === c.name ? 'bg-white border-[#0044B5] shadow-md' : 'bg-white/50 border-transparent hover:bg-white hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-300">0{i + 1}</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 capitalize">{c.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium tracking-tight">County</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#0044B5]">{formatCurrency(c.amount)}</p>
                    <ChevronRight className={`w-3 h-3 ml-auto mt-1 ${selectedCounty === c.name ? 'text-[#0044B5]' : 'text-gray-300'}`} />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-gray-400 font-medium italic">No geographic data available for current selection.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data Coverage</span>
              <span className="text-[10px] font-black text-[#0044B5]">{dataCoverage} {viewMode === 'county' ? 'Counties' : 'Zip Codes'}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0044B5] rounded-full" 
                style={{ width: `${Math.min((dataCoverage / (geoData?.features.length || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex items-center gap-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Scale</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="w-32 h-2 rounded-full" style={{ background: 'linear-gradient(to right, #f1f3f5, #0044B5)' }}></div>
            <span>More</span>
          </div>
        </div>
        <div className="h-4 w-[1px] bg-gray-100"></div>
        <span className="text-[10px] font-bold text-[#0044B5] uppercase tracking-widest">Max Approval: {formatCurrency(maxAmount)}</span>
      </div>
    </div>
  );
};
