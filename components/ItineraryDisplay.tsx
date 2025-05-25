import React from 'react';
import { Itinerary, TrainRoute, FlightOption, BusRoute, HotelOption, DayPlan, DayActivity } from '../types';
import SectionCard from './SectionCard';
import { TrainIcon, BusIcon, HotelIcon, CalendarDaysIcon, FoodIcon, SunIcon, InformationCircleIcon, CurrencyDollarIcon, MapPinIcon, StarIcon, CheckCircleIcon, ClockIcon, PaperAirplaneIcon } from './icons/DisplayIcons';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {

  const renderDayActivities = (activities: (string | DayActivity)[]) => {
    return activities.map((activity, index) => {
      if (typeof activity === 'string') {
        return <li key={index} className="flex items-start space-x-2"><CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" /><span>{activity}</span></li>;
      }
      return (
        <li key={index} className="flex items-start space-x-2">
          {activity.time ? <ClockIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" /> : <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />}
          <span>{activity.time && <strong className="font-medium">{activity.time}: </strong>}{activity.description}</span>
        </li>
      );
    });
  };


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Your Personalized Itinerary</h2>
      
      <SectionCard title={`Primary Travel: ${itinerary.travelModeUsed.charAt(0).toUpperCase() + itinerary.travelModeUsed.slice(1)}`} 
        icon={
          itinerary.travelModeUsed === 'train' ? <TrainIcon className="h-6 w-6" /> :
          itinerary.travelModeUsed === 'flight' ? <PaperAirplaneIcon className="h-6 w-6" /> :
          <BusIcon className="h-6 w-6" />
        }
      >
        {/* Train Routes */}
        {itinerary.travelModeUsed === 'train' && itinerary.trainRoutes && itinerary.trainRoutes.length > 0 && (
            itinerary.trainRoutes.map((route: TrainRoute, index: number) => (
              <div key={index} className="p-4 border-b border-slate-200 last:border-b-0 bg-sky-50 rounded-lg mb-3">
                <h4 className="font-semibold text-lg text-indigo-600">{route.trainNameAndNumber}</h4>
                <p className="text-sm text-slate-600"><strong>Route:</strong> {route.routeDescription || 'Details not available'}</p>
                <p className="text-sm text-slate-600"><strong>Travel Time:</strong> {route.travelTime}</p>
                <p className="text-sm text-slate-600"><strong>Availability:</strong> {route.availabilitySuggestion}</p>
                {route.breakJourneyStation && <p className="text-sm text-slate-600"><strong>Break Journey at:</strong> {route.breakJourneyStation}</p>}
              </div>
            ))
        )}

        {/* Flight Options */}
        {itinerary.travelModeUsed === 'flight' && itinerary.flightOptions && itinerary.flightOptions.length > 0 && (
            itinerary.flightOptions.map((flight: FlightOption, index: number) => (
              <div key={index} className="p-4 border-b border-slate-200 last:border-b-0 bg-sky-50 rounded-lg mb-3">
                <h4 className="font-semibold text-lg text-indigo-600">{flight.flightNumberAndAirline}</h4>
                <p className="text-sm text-slate-600"><strong>From:</strong> {flight.departureAirport} <strong>To:</strong> {flight.arrivalAirport}</p>
                <p className="text-sm text-slate-600"><strong>Timings:</strong> {flight.timings}</p>
                <p className="text-sm text-slate-600"><strong>Duration:</strong> {flight.duration}</p>
                <p className="text-sm text-slate-600"><strong>Est. Price:</strong> {flight.estimatedPrice}</p>
                {flight.layovers && <p className="text-sm text-slate-600"><strong>Layovers:</strong> {flight.layovers}</p>}
              </div>
            ))
        )}

        {/* Bus Routes */}
        {itinerary.travelModeUsed === 'bus' && itinerary.busRoutes && itinerary.busRoutes.length > 0 && (
            itinerary.busRoutes.map((bus: BusRoute, index: number) => (
              <div key={index} className="p-4 border-b border-slate-200 last:border-b-0 bg-sky-50 rounded-lg mb-3">
                <h4 className="font-semibold text-lg text-indigo-600">{bus.operator} - {bus.busType}</h4>
                <p className="text-sm text-slate-600"><strong>From:</strong> {bus.departurePoint} <strong>To:</strong> {bus.arrivalPoint}</p>
                <p className="text-sm text-slate-600"><strong>Timings:</strong> {bus.timings}</p>
                <p className="text-sm text-slate-600"><strong>Duration:</strong> {bus.duration}</p>
                <p className="text-sm text-slate-600"><strong>Est. Fare:</strong> {bus.estimatedFare}</p>
                {bus.amenities && bus.amenities.length > 0 && <p className="text-sm text-slate-600"><strong>Amenities:</strong> {bus.amenities.join(', ')}</p>}
              </div>
            ))
        )}
      </SectionCard>


      {/* Transport to Destination */}
      {itinerary.transportToDestination && (
        // Fix: Use itinerary.destinationName which is now part of the Itinerary type
         <SectionCard title={`Local Transfer to ${itinerary.destinationName || 'Destination'}`} icon={<BusIcon className="h-6 w-6" />}>
          <div className="p-4 bg-sky-50 rounded-lg">
            <p className="text-sm text-slate-600"><strong>From:</strong> {itinerary.transportToDestination.fromStationOrAirport}</p>
            <p className="text-sm text-slate-600"><strong>Mode:</strong> {itinerary.transportToDestination.mode}</p>
            <p className="text-sm text-slate-600"><strong>Est. Cost:</strong> {itinerary.transportToDestination.estimatedCost}</p>
            <p className="text-sm text-slate-600"><strong>Travel Time:</strong> {itinerary.transportToDestination.travelTime}</p>
            {itinerary.transportToDestination.scenicRouteDescription && <p className="text-sm text-slate-600 mt-2"><strong>Route Note:</strong> {itinerary.transportToDestination.scenicRouteDescription}</p>}
          </div>
        </SectionCard>
      )}

      {/* Hotel Options */}
       {itinerary.hotelOptions && itinerary.hotelOptions.length > 0 && (
        <SectionCard title="Hotel Options" icon={<HotelIcon className="h-6 w-6" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itinerary.hotelOptions.map((hotel: HotelOption, index: number) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"> {/* Hotel cards remain white for now, or could be bg-sky-50 too */}
                <h4 className="font-semibold text-lg text-indigo-600">{hotel.name}</h4>
                <p className="text-sm text-slate-700"><strong>Price:</strong> {hotel.approxPricePerNight}</p>
                {hotel.rating && <p className="text-sm text-slate-700 flex items-center"><strong>Rating:</strong> {hotel.rating} <StarIcon className="h-4 w-4 text-amber-400 ml-1" /></p>}
                <p className="text-sm text-slate-700 flex items-center"><MapPinIcon className="h-4 w-4 text-slate-500 mr-1"/> {hotel.distanceFromMallRoad}</p>
                {hotel.facilities && hotel.facilities.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm text-slate-700">Facilities:</strong>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {hotel.facilities.map((facility, i) => <li key={i}>{facility}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Day-wise Itinerary */}
      {itinerary.dayWiseItinerary && itinerary.dayWiseItinerary.length > 0 && (
        <SectionCard title="Day-wise Itinerary" icon={<CalendarDaysIcon className="h-6 w-6" />}>
          {itinerary.dayWiseItinerary.map((day: DayPlan, index: number) => (
            <div key={index} className="p-4 border-b border-slate-200 last:border-b-0 mb-3 bg-sky-50 rounded-lg">
              <h4 className="font-semibold text-xl text-indigo-600 mb-2">Day {day.day}: {day.title}</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {renderDayActivities(day.activities)}
              </ul>
            </div>
          ))}
        </SectionCard>
      )}

      {/* Food Guide */}
      {itinerary.foodGuide && (
        <SectionCard title="Food Guide" icon={<FoodIcon className="h-6 w-6" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-sky-50 rounded-lg">
              <h5 className="font-semibold text-md text-indigo-600 mb-2">Must-Try Local Dishes</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {itinerary.foodGuide.mustTryLocalDishes.map((dish, i) => <li key={i}>{dish}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-sky-50 rounded-lg">
              <h5 className="font-semibold text-md text-indigo-600 mb-2">Recommended Restaurants</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {itinerary.foodGuide.recommendedRestaurants.map((place, i) => <li key={i}>{place}</li>)}
              </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Weather Advice */}
      {itinerary.weatherAdvice && (
        <SectionCard title="Weather Advice" icon={<SunIcon className="h-6 w-6" />}>
          <div className="p-4 bg-sky-50 rounded-lg">
            <p className="text-sm text-slate-700"><strong>Expected Temp:</strong> {itinerary.weatherAdvice.expectedTemperature}</p>
            <div className="mt-2">
              <strong className="text-sm text-slate-700">Packing Suggestions:</strong>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                {itinerary.weatherAdvice.packingSuggestions.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Emergency Info */}
      {itinerary.emergencyInfo && (
        <SectionCard title="Emergency Info" icon={<InformationCircleIcon className="h-6 w-6" />}>
          <div className="p-4 bg-sky-50 rounded-lg">
            <p className="text-sm text-slate-700"><strong>Nearest Hospital:</strong> {itinerary.emergencyInfo.nearestHospital}</p>
             <div className="mt-2">
                <strong className="text-sm text-slate-700">Pharmacies:</strong>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {itinerary.emergencyInfo.pharmacies.map((pharmacy, i) => <li key={i}>{pharmacy}</li>)}
                </ul>
            </div>
            <div className="mt-2">
                <strong className="text-sm text-slate-700">Local Helplines:</strong>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {itinerary.emergencyInfo.localHelplineNumbers.map((num, i) => <li key={i}>{num}</li>)}
                </ul>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Cost Summary */}
      {itinerary.costSummary && (
        <SectionCard title="Cost Summary (Approximate)" icon={<CurrencyDollarIcon className="h-6 w-6" />}>
          <div className="p-4 bg-sky-50 rounded-lg space-y-2 text-sm text-slate-700">
            <p><strong>{itinerary.costSummary.primaryTransportDescription || 'Primary Transport Cost'}:</strong> {itinerary.costSummary.estimatedPrimaryTransportCost}</p>
            <p><strong>Local Transport (to destination & sightseeing):</strong> {itinerary.costSummary.estimatedLocalTransportCost}</p>
            <p><strong>Hotel Cost:</strong> {itinerary.costSummary.estimatedHotelCost}</p>
            <p><strong>Food Cost:</strong> {itinerary.costSummary.estimatedFoodCost}</p>
            <p className="font-semibold text-md text-indigo-700 mt-3"><strong>Total Approx. Cost:</strong> {itinerary.costSummary.totalApproximateCost}</p>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default ItineraryDisplay;