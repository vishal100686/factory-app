export enum Budget {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TravelType {
  SOLO = 'Solo',
  COUPLE = 'Couple',
  FAMILY = 'Family',
  FRIENDS = 'Friends',
  BUSINESS = 'Business',
}

export type TravelMode = 'train' | 'flight' | 'bus';

export interface ItineraryFormData {
  startCity: string;
  destination: string;
  travelStartDate: string;
  travelEndDate: string;
  budget: Budget;
  travelType: TravelType;
  interests: string; // Comma-separated string
  travelMode: TravelMode; // Now mandatory as it's added before AI call
}

export interface InitialItineraryFormData extends Omit<ItineraryFormData, 'travelMode'> {}


export interface UserPreferences {
  hotelLocation: 'bus_stand' | 'mall_road' | 'scenic_view' | null;
  foodPreference: 'vegetarian_only' | 'any' | null;
  budgetUpgrade: 'yes' | 'no' | null;
}

export interface TrainRoute {
  trainNameAndNumber: string;
  travelTime: string;
  availabilitySuggestion: string;
  breakJourneyStation: string | null;
  routeDescription?: string; 
}

export interface FlightOption {
  flightNumberAndAirline: string;
  departureAirport: string;
  arrivalAirport: string;
  timings: string; 
  duration: string;
  estimatedPrice: string;
  layovers?: string | null; 
}

export interface BusRoute {
  operator: string;
  busType: string; 
  departurePoint: string;
  arrivalPoint: string;
  timings: string;
  duration: string;
  estimatedFare: string;
  amenities?: string[];
}

export interface TransportToDestination {
  fromStationOrAirport: string; 
  mode: string; 
  estimatedCost: string;
  travelTime: string;
  scenicRouteDescription: string | null;
}

export interface HotelOption {
  name: string;
  approxPricePerNight: string;
  facilities: string[]; 
  rating: number | string; 
  distanceFromMallRoad: string;
}

export interface DayActivity {
  time?: string; 
  description: string;
}
export interface DayPlan {
  day: number;
  title: string;
  activities: (string | DayActivity)[]; 
}

export interface FoodGuide {
  mustTryLocalDishes: string[];
  recommendedRestaurants: string[];
}

export interface WeatherInfo {
  expectedTemperature: string;
  packingSuggestions: string[];
}

export interface EmergencyInfo {
  nearestHospital: string;
  pharmacies: string[];
  localHelplineNumbers: string[];
}

export interface CostSummary {
  estimatedPrimaryTransportCost: string; 
  primaryTransportDescription: string; 
  estimatedLocalTransportCost: string;
  estimatedHotelCost: string;
  estimatedFoodCost: string;
  totalApproximateCost: string;
}

export interface Itinerary {
  // Add destinationName to store the main destination of the trip
  destinationName: string; 
  trainRoutes: TrainRoute[] | null; // Null if not selected travel mode
  flightOptions: FlightOption[] | null; // Null if not selected travel mode
  busRoutes: BusRoute[] | null; // Null if not selected travel mode
  transportToDestination: TransportToDestination | null;
  hotelOptions: HotelOption[];
  dayWiseItinerary: DayPlan[];
  foodGuide: FoodGuide;
  weatherAdvice: WeatherInfo;
  emergencyInfo: EmergencyInfo;
  costSummary: CostSummary;
  travelModeUsed: TravelMode; 
}

// For Gemini API response grounding metadata
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievalQuery?: string;
}
export interface GroundingMetadata {
  groundingMetadata?: GroundingChunk[];
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
}