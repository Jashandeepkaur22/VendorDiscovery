import React, { useState, useEffect } from "react";
import VendorForm from "./components/VendorForm";
import ShortlistTable from "./components/ShortlistTable";
import HistoryPanel from "./components/HistoryPanel";
import { Sparkles, Activity } from "lucide-react";

function App() {
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("vendorShortlists");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (newItem) => {
    const newHistory = [newItem, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("vendorShortlists", JSON.stringify(newHistory));
  };

  const handleSearch = async (data) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {

      console.log(import.meta.env.VITE_API_URL)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/shortlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch shortlist");
      }

      const resData = await response.json();

      setResults(resData.shortlist);

      saveToHistory({
        ...data,
        results: resData.shortlist,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setResults(item.results);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-700">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">
              Vendor Shortlist Builder
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <Activity className="w-4 h-4 text-green-500" />
            <span>AI Powered Discovery</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-xl transform -skew-y-1 z-0"></div>
              <div className="relative z-10">
                <VendorForm onSubmit={handleSearch} isLoading={isLoading} />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm">
                <span className="font-semibold block mb-1">
                  Error processing request:
                </span>
                {error}
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <ShortlistTable results={results} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <HistoryPanel history={history} onLoadHistory={loadFromHistory} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
