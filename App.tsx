<<<<<<< HEAD
import React, { useState, useCallback, useEffect } from 'react';
import { ItineraryFormData, Itinerary, UserPreferences, TravelMode, InitialItineraryFormData } from './types';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import PreferenceForm from './components/PreferenceForm';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import TravelModeSelector from './components/TravelModeSelector';
import PostItineraryActions from './components/PostItineraryActions';
import { generateItineraryAI } from './services/geminiService';
import { AppTitleIcon } from './components/icons/AppTitleIcon';

const App: React.FC = () => {
  const [initialFormData, setInitialFormData] = useState<InitialItineraryFormData | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    hotelLocation: null,
    foodPreference: null,
    budgetUpgrade: null,
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreferenceForm, setShowPreferenceForm] = useState<boolean>(false);
  const [showTravelModeSelection, setShowTravelModeSelection] = useState<boolean>(false);
  const [showPostItineraryActions, setShowPostItineraryActions] = useState<boolean>(false);
  const [showGoodbyeMessage, setShowGoodbyeMessage] = useState<boolean>(false);

  const resetToInitialState = useCallback(() => {
    setInitialFormData(null);
    setItinerary(null);
    setUserPreferences({ hotelLocation: null, foodPreference: null, budgetUpgrade: null });
    setError(null);
    setShowTravelModeSelection(false);
    setShowPreferenceForm(false);
    setShowPostItineraryActions(false);
    setShowGoodbyeMessage(false);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (showGoodbyeMessage) {
      const timer = setTimeout(() => {
        resetToInitialState();
      }, 3000); // Show goodbye message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showGoodbyeMessage, resetToInitialState]);

  const handleInitialFormSubmit = useCallback((data: InitialItineraryFormData) => {
    resetToInitialState(); // Ensure clean state before starting
    setInitialFormData(data);
    setShowTravelModeSelection(true); 
  }, [resetToInitialState]);

  const handleTravelModeSelect = useCallback(async (selectedMode: TravelMode) => {
    if (!initialFormData) {
      setError("Initial form data is missing. Please fill the main form first.");
      setShowTravelModeSelection(false);
      return;
    }
    
    const completeFormData: ItineraryFormData = { ...initialFormData, travelMode: selectedMode };
    
    setShowTravelModeSelection(false);
    setIsLoading(true);
    setError(null);
    setItinerary(null); 

    try {
      const generatedItinerary = await generateItineraryAI(completeFormData, userPreferences);
      setItinerary(generatedItinerary);
      setShowPostItineraryActions(true); // Show actions after itinerary generation
      setShowPreferenceForm(false); // Preferences only on explicit refine
    } catch (err) {
      console.error("Error generating itinerary with travel mode:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please ensure your API key is set up correctly and try again.");
      // Optionally reset to form if generation fails badly
      // setInitialFormData(null); 
    } finally {
      setIsLoading(false);
    }
  }, [initialFormData, userPreferences]);


  const handlePreferenceSubmit = useCallback(async (preferences: UserPreferences) => {
    if (!initialFormData || !itinerary || !itinerary.travelModeUsed) {
      setError("Original form data or travel mode is missing. Cannot refine.");
      return;
    }
    
    const completeFormData: ItineraryFormData = { ...initialFormData, travelMode: itinerary.travelModeUsed };

    setUserPreferences(preferences); 
    setError(null);
    setIsLoading(true);
    setShowPreferenceForm(false); // Hide preference form while loading refined
    
    try {
      const refinedItinerary = await generateItineraryAI(completeFormData, preferences); 
      setItinerary(refinedItinerary);
      setShowPostItineraryActions(true); // Show actions again after refinement
    } catch (err) {
      console.error("Error refining itinerary:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while refining itinerary.");
    } finally {
      setIsLoading(false);
    }
  }, [initialFormData, itinerary]);

  const handleRefineRequested = () => {
    setShowPostItineraryActions(false);
    setShowPreferenceForm(true);
  };

  const handlePlanNewTrip = () => {
    resetToInitialState();
  };

  const handleClosePlan = () => {
    setItinerary(null);
    setShowPostItineraryActions(false);
    setShowPreferenceForm(false);
    setShowGoodbyeMessage(true); 
    // useEffect will handle full reset after timeout
  };


  const renderContent = () => {
    if (showGoodbyeMessage) {
      return (
        <div className="bg-sky-100 p-6 sm:p-8 rounded-xl shadow-2xl text-center">
          <h2 className="text-2xl font-semibold text-indigo-700">Thank you for using the Travel Planner!</h2>
          <p className="mt-2 text-slate-600">We hope you have a wonderful trip!</p>
        </div>
      );
    }

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;

    if (itinerary) {
      return (
        <div className="bg-sky-100 p-6 sm:p-8 rounded-xl shadow-2xl">
          <ItineraryDisplay itinerary={itinerary} />
          {showPostItineraryActions && (
            <PostItineraryActions 
              onRefine={handleRefineRequested}
              onPlanNew={handlePlanNewTrip}
              onClose={handleClosePlan}
            />
          )}
          {showPreferenceForm && (
            <div className="mt-8 border-t border-slate-300 pt-6">
               <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Refine Your Itinerary</h2>
              <PreferenceForm currentPreferences={userPreferences} onSubmit={handlePreferenceSubmit} isLoading={isLoading} />
            </div>
          )}
        </div>
      );
    }

    if (showTravelModeSelection && initialFormData) {
      return (
        <div className="bg-sky-100 p-6 sm:p-8 rounded-xl shadow-2xl mb-8">
          <TravelModeSelector onSelectMode={handleTravelModeSelect} isLoading={isLoading} />
        </div>
      );
    }

    return (
       <div className="bg-sky-100 p-6 sm:p-8 rounded-xl shadow-2xl mb-8">
        <ItineraryForm onSubmit={handleInitialFormSubmit} isLoading={isLoading} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 sm:p-6 md:p-8 text-slate-800">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <AppTitleIcon className="h-12 w-12 text-white" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white shadow-sm">Travel Itinerary Planner</h1>
        </div>
        <p className="text-lg text-purple-200">Plan your next adventure with AI-powered insights!</p>
      </header>

      <main className="max-w-4xl mx-auto">
        {renderContent()}
      </main>
      <footer className="text-center mt-12 text-purple-200 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Travel Planner. All rights reserved.</p>
         <p className="mt-1 text-xs">Note: Information like train/flight schedules and prices are illustrative. Always verify with official sources.</p>
      </footer>
    </div>
=======

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ReportsPage from './pages/ReportsPage'; // New Import
import { Toaster } from './components/ui/Toaster'; // Simple toast component

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} /> {/* New Route */}
          </Routes>
        </main>
        <footer className="bg-brand-dark text-white text-center p-4">
          © ${new Date().getFullYear()} FactoryPulse. All rights reserved.
        </footer>
        <Toaster />
      </div>
    </HashRouter>
>>>>>>> 88260e65f84fd5b0bc475028cd30d2c3bc2c24af
  );
};

export default App;