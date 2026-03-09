import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, List, MapPin, Calendar, ExternalLink, BarChart3, Database } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { StatsRow } from './components/StatsRow';
import { Charts } from './components/Charts';
import { CountyMap } from './components/CountyMap';
import { CountyBreakoutTable } from './components/CountyBreakoutTable';
import { SocioeconomicAnalysis } from './components/SocioeconomicAnalysis';
import { HouseholdDemographics } from './components/HouseholdDemographics';
import { RegistrationTable } from './components/RegistrationTable';
import { femaService } from './services/femaService';
import { DisasterDeclaration, RegistrationSummary, ValidRegistration } from './types';
import { formatCurrency } from './utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [disasters, setDisasters] = useState<DisasterDeclaration[]>([]);
  const [selectedDisasters, setSelectedDisasters] = useState<DisasterDeclaration[]>([]);
  const [summaries, setSummaries] = useState<RegistrationSummary[]>([]);
  const [regSample, setRegSample] = useState<ValidRegistration[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [filters, setFilters] = useState({
    query: '',
    year: '',
    state: '',
    county: ''
  });
  const [counties, setCounties] = useState<string[]>([]);

  const fetchDisasterList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const data = await femaService.fetchDisasters(filters);
      setDisasters(data);
    } catch (err) {
      console.error("Error fetching disasters:", err);
    } finally {
      setIsLoadingList(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchDisasterList, 400);
    return () => clearTimeout(timer);
  }, [fetchDisasterList]);

  useEffect(() => {
    if (filters.state) {
      femaService.fetchCountiesForState(filters.state).then(setCounties);
    } else {
      setCounties([]);
      setFilters(prev => ({ ...prev, county: '' }));
    }
  }, [filters.state]);

  const handleSelectDisaster = async (disaster: DisasterDeclaration) => {
    setSelectedDisasters(prev => {
      const exists = prev.find(d => d.disasterNumber === disaster.disasterNumber);
      if (exists) {
        return prev.filter(d => d.disasterNumber !== disaster.disasterNumber);
      }
      return [...prev, disaster];
    });
  };

  const clearSelected = () => setSelectedDisasters([]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (selectedDisasters.length === 0) {
        setSummaries([]);
        setRegSample([]);
        return;
      }

      setIsLoadingDetails(true);
      try {
        const results = await Promise.all(selectedDisasters.map(d => 
          Promise.all([
            femaService.fetchRegistrationSummaries(d.disasterNumber, filters.county),
            femaService.fetchRegistrationSample(d.disasterNumber, filters.county)
          ])
        ));

        const allSummaries = results.flatMap(r => r[0]);
        const allSamples = results.flatMap(r => r[1]);

        setSummaries(allSummaries);
        setRegSample(allSamples);
      } catch (err) {
        console.error("Error loading details:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedDisasters, filters.county]);

  const totals = useMemo(() => {
    const perDisaster = summaries.reduce((acc: Record<number, { totalValidRegistrations: number; ihpAmount: number }>, s) => {
      if (!acc[s.disasterNumber]) {
        acc[s.disasterNumber] = { totalValidRegistrations: 0, ihpAmount: 0 };
      }
      acc[s.disasterNumber].totalValidRegistrations += (s.totalValidRegistrations || 0);
      acc[s.disasterNumber].ihpAmount += (s.ihpAmount || 0);
      return acc;
    }, {});

    const baseTotals = (Object.values(perDisaster) as { totalValidRegistrations: number; ihpAmount: number }[]).reduce((acc, d) => {
      acc.totalValidRegistrations += d.totalValidRegistrations;
      acc.ihpAmount += d.ihpAmount;
      return acc;
    }, { totalValidRegistrations: 0, ihpAmount: 0 });

    // Calculate totalApprovedRegs by summing per-disaster estimates
    let totalApprovedRegs = 0;
    (Object.keys(perDisaster) as unknown as number[]).forEach(dn => {
      const disasterRegs = regSample.filter(r => r.disasterNumber === Number(dn));
      const approvedSample = disasterRegs.filter(r => r.ihpEligible || r.ihpAmount > 0).length;
      const totalSample = disasterRegs.length;
      
      if (totalSample > 0) {
        totalApprovedRegs += Math.round((approvedSample / totalSample) * perDisaster[Number(dn)].totalValidRegistrations);
      }
    });

    return {
      ...baseTotals,
      totalApprovedRegs,
      perDisaster
    };
  }, [summaries, regSample]);

  const years = Array.from({ length: 26 }, (_, i) => (new Date().getFullYear() - i).toString());
  const states = ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"];

  const stateAbbrs = useMemo(() => [...new Set(selectedDisasters.map(d => d.state))], [selectedDisasters]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="bg-white border-b-4 border-b-[#0044B5] px-6 py-4 flex flex-col md:flex-row items-center justify-between mb-8 rounded-t-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="flex flex-col">
              <h1 className="text-3xl leading-none font-bold text-[#0044B5] uppercase tracking-tighter">
                United For <span className="text-[#FFBA00]">ALICE</span>
              </h1>
              <div className="h-1 bg-gradient-to-r from-[#0044B5] to-[#FFBA00] rounded-full mt-1"></div>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 mx-4 hidden md:block"></div>
            <div className="flex flex-col">
              <h2 className="font-bold text-gray-500 uppercase tracking-widest text-xs hidden lg:block">
                FEMA Assistance Insights
              </h2>
              <p className="text-[8px] text-gray-400 uppercase tracking-tighter hidden lg:block">
                Powered by OpenFEMA API
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search disasters..."
                className="bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:border-[#0044B5] outline-none transition-all w-48 lg:w-64"
                value={filters.query}
                onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#0044B5]"
                value={filters.year}
                onChange={(e) => setFilters(f => ({ ...f, year: e.target.value }))}
              >
                <option value="">Year (All)</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#0044B5]"
                value={filters.state}
                onChange={(e) => setFilters(f => ({ ...f, state: e.target.value, county: '' }))}
              >
                <option value="">State (All)</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#0044B5] disabled:opacity-50"
                value={filters.county}
                onChange={(e) => setFilters(f => ({ ...f, county: e.target.value }))}
                disabled={!filters.state}
              >
                <option value="">County (All)</option>
                {counties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar
            disasters={disasters}
            selectedIds={selectedDisasters.map(d => d.id)}
            onSelect={handleSelectDisaster}
            isLoading={isLoadingList}
          />

          <div className="lg:col-span-3 space-y-8">
            {selectedDisasters.length === 0 && !isLoadingDetails && (
              <div className="h-full bg-white border border-gray-200 border-dashed border-2 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-[#0044B5]/5 rounded-3xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-10 w-10 text-[#0044B5]/50" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Explore</h3>
                <p className="text-gray-500 max-w-sm">Select one or more disaster declarations from the list to analyze aggregated socioeconomic and assistance statistics.</p>
              </div>
            )}

            {isLoadingDetails && (
              <div className="h-[65vh] bg-white border border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm">
                <div className="relative mb-8">
                  <div className="h-20 w-20 border-4 border-gray-200 rounded-full border-t-[#0044B5] animate-spin"></div>
                  <Database className="absolute inset-0 m-auto h-8 w-8 text-[#0044B5] p-1" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800">Processing Datasets</h4>
                <p className="text-gray-500 mt-2">Connecting to OpenFEMA API Gateway...</p>
              </div>
            )}

            {selectedDisasters.length > 0 && !isLoadingDetails && (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* Results Header & Clear All */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0044B5]/5 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-[#0044B5]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Analysis Results</h2>
                  </div>
                  <button 
                    onClick={clearSelected}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                  >
                    Clear All Selections
                  </button>
                </div>

                {/* Overview Section */}
                <section className="space-y-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-8 bg-[#0044B5] rounded-full"></div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">01. Overview</h3>
                  </div>
                  
                  <StatsRow
                    totalRegs={totals.totalValidRegistrations}
                    totalApprovedRegs={totals.totalApprovedRegs}
                    totalApprovedAmount={totals.ihpAmount}
                    avgAssistance={totals.ihpAmount / (totals.totalApprovedRegs || 1)}
                  />
                  
                  <Charts regs={regSample} fullTotals={totals} />
                  
                  <div className="bg-white border-l-8 border-l-[#0044B5] p-8 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-[#0044B5]/10 text-[#0044B5] text-[10px] font-bold rounded-full mb-3 uppercase tracking-widest">
                        {selectedDisasters.length === 1 ? 'Selected Disaster Report' : `${selectedDisasters.length} Disasters Aggregated`}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedDisasters.length === 1 
                          ? selectedDisasters[0].declarationTitle 
                          : `Aggregated Analysis: ${selectedDisasters.map(d => d.disasterNumber).join(', ')}`}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#0044B5]" />
                          {selectedDisasters.length === 1 
                            ? selectedDisasters[0].state 
                            : [...new Set(selectedDisasters.map(d => d.state))].join(', ')}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#0044B5]" />
                          {selectedDisasters.length === 1 
                            ? new Date(selectedDisasters[0].declarationDate).toDateString()
                            : `Multiple Dates`}
                        </span>
                      </div>
                    </div>
                    {selectedDisasters.length === 1 && (
                      <a
                        href={`https://www.fema.gov/disaster/${selectedDisasters[0].disasterNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0044B5] text-white px-8 py-4 rounded-lg font-bold flex items-center gap-2 uppercase text-xs tracking-widest hover:bg-[#005191] transition-all"
                      >
                        FEMA Official Details
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </section>

                {/* Geographic Section */}
                <section className="space-y-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-8 bg-[#FFBA00] rounded-full"></div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">02. Geographic Distribution</h3>
                  </div>
                  <CountyMap 
                    stateAbbrs={stateAbbrs} 
                    summaries={summaries} 
                    regSample={regSample}
                  />
                  <CountyBreakoutTable 
                    summaries={summaries} 
                    regSample={regSample} 
                  />
                </section>

                {/* ALICE Section */}
                <section className="space-y-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-8 bg-[#0044B5] rounded-full"></div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">03. Socioeconomic & ALICE Analysis</h3>
                  </div>
                  <SocioeconomicAnalysis regs={regSample} fullTotals={totals} />
                  <HouseholdDemographics regs={regSample} fullTotals={totals} />
                  <RegistrationTable regs={regSample} />
                </section>

                {selectedDisasters.length > 0 && summaries.length === 0 && !isLoadingDetails && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    No registration summary data found for the selected disaster(s). This may happen if the disaster is very recent or if data hasn't been published to the summary dataset yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">
            Data Source: OpenFEMA API Gateway
          </p>
          <p className="text-[10px] text-gray-400 max-w-2xl mx-auto leading-relaxed">
            This dashboard uses public data from FEMA's Individual Assistance datasets. Socioeconomic classifications (ALICE) are estimated based on reported gross income and household size using United For ALICE methodology. All figures are estimates based on available samples and official summary totals.
          </p>
        </footer>
      </div>
    </div>
  );
}
