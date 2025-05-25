
<<<<<<< HEAD

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ItineraryFormData, Itinerary, UserPreferences, TravelMode } from '../types';
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION, API_REQUEST_TIMEOUT_MS } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not found. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

function buildPrompt(formData: ItineraryFormData, preferences: UserPreferences): string {
  const startDate = new Date(formData.travelStartDate);
  const endDate = new Date(formData.travelEndDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const travelMonth = startDate.toLocaleString('default', { month: 'long' });

  let travelSpecificJsonStructure = "";
  let travelSpecificPromptInfo = "";
  let primaryTransportCostField = `"estimatedPrimaryTransportCost": "string (Estimate for primary travel mode, e.g., 'INR 2000-5000 per person')",
    "primaryTransportDescription": "string (e.g., '${formData.travelMode.charAt(0).toUpperCase() + formData.travelMode.slice(1)} Cost')"`;
  let day1TitleExample = `'Arrival & Transfer to ${formData.destination}'`;
  let day1ActivitiesExample = `[
        "string (e.g., 'Arrive at designated station/airport/bus terminal.')",
        "string (e.g., 'Take pre-booked/local transport to ${formData.destination}.')",
        "string (e.g., 'Check into hotel, relax.')"
      ]`;

  if (formData.travelMode === 'train') {
    travelSpecificJsonStructure = `
  "trainRoutes": [
    {
      "trainNameAndNumber": "string (Train Route 1: e.g., 'Tata-Jammu Tawi Express to Delhi')",
      "travelTime": "string (e.g., 'Approx 24 hours to Delhi')",
      "availabilitySuggestion": "string (e.g., 'Book 4-6 weeks prior via IRCTC. High demand for ${formData.budget} class in ${travelMonth}.')",
      "breakJourneyStation": "string | null (e.g., 'New Delhi (NDLS)')",
      "routeDescription": "string (e.g., 'Board [Train Name] from ${formData.startCity} to [Break Station]. Then take connecting transport to ${formData.destination}.')"
    },
    {
      "trainNameAndNumber": "string (Train Route 2: e.g., 'Another Express like Howrah-Kalka Mail towards Kalka (KLK) if available or suitable connection via Chandigarh')",
      "travelTime": "string (e.g., 'Approx 28-32 hours to Kalka/Chandigarh')",
      "availabilitySuggestion": "string (e.g., 'Check availability for connecting trains. Popular route for ${formData.destination}.')",
      "breakJourneyStation": "string | null (e.g., 'Kalka (KLK)' or 'Chandigarh (CDG)')",
      "routeDescription": "string (e.g., 'Alternative route option involving a different break journey point closer to ${formData.destination}.')"
    }
    // Provide 1-2 common train routes from ${formData.startCity} towards ${formData.destination}, potentially involving a break journey.
  ],
  "flightOptions": null,
  "busRoutes": null,`;
    travelSpecificPromptInfo = `Primary travel mode is TRAIN. Focus on train routes from ${formData.startCity} to a hub near ${formData.destination}.`;
    primaryTransportCostField = `"estimatedPrimaryTransportCost": "string (e.g., 'INR 1500-3000 per person for train to break journey station, depending on class and ${formData.budget} budget')",
    "primaryTransportDescription": "Train Cost"`;
    day1TitleExample = `'Arrival at Break Journey Station & Transfer to ${formData.destination}'`;
    day1ActivitiesExample = `[
        "string (e.g., 'Arrive at [Break Journey Station like Chandigarh/Kalka] by morning train.')",
        "string (e.g., 'Take a pre-booked taxi or a comfortable Volvo bus towards ${formData.destination}. Enjoy the scenic drive.')",
        "string (e.g., 'Reach ${formData.destination} by evening. Check into your hotel and relax.')",
        "string (e.g., 'Dinner at hotel or a nearby restaurant that fits a ${formData.budget} budget.')"
      ]`;

  } else if (formData.travelMode === 'flight') {
    travelSpecificJsonStructure = `
  "trainRoutes": null,
  "flightOptions": [
    {
      "flightNumberAndAirline": "string (Flight 1: e.g., 'AI 456, Air India')",
      "departureAirport": "string (Nearest major airport to ${formData.startCity}, e.g., 'Ranchi (IXR)' or 'Kolkata (CCU)')",
      "arrivalAirport": "string (Nearest airport to ${formData.destination}, e.g., 'Kullu-Manali Airport, Bhuntar (KUU)')",
      "timings": "string (e.g., 'Dep: 10:00 AM, Arr: 12:30 PM')",
      "duration": "string (e.g., '2h 30m direct')",
      "estimatedPrice": "string (Typical one-way price for ${travelMonth} for ${formData.budget} budget, e.g., 'INR 5000-8000')",
      "layovers": "string | null (e.g., null for direct)"
    },
    {
      "flightNumberAndAirline": "string (Flight 2: e.g., 'UK 800, Vistara to Chandigarh if Bhuntar is not feasible')",
      "departureAirport": "string (Nearest major airport to ${formData.startCity}, e.g., 'Ranchi (IXR)' or 'Kolkata (CCU)')",
      "arrivalAirport": "string (Alternative airport: 'Chandigarh (IXC)')",
      "timings": "string (e.g., 'Dep: 08:00 AM, Arr: 11:00 AM via Delhi')",
      "duration": "string (e.g., '3h via Delhi')",
      "estimatedPrice": "string (Typical one-way price for ${travelMonth} for ${formData.budget} budget, e.g., 'INR 6000-9000')",
      "layovers": "string | null (e.g., '1 stop at Delhi (DEL) for 1h 30m')"
    }
    // Suggest 1-2 flight options from an airport near ${formData.startCity} to an airport near ${formData.destination}.
  ],
  "busRoutes": null,`;
    travelSpecificPromptInfo = `Primary travel mode is FLIGHT. Focus on flight options from an airport near ${formData.startCity} (e.g. Ranchi IXR or Kolkata CCU) to an airport near ${formData.destination} (e.g. Kullu KUU or Chandigarh IXC).`;
    primaryTransportCostField = `"estimatedPrimaryTransportCost": "string (e.g., 'INR 5000-10000 per person for flight, for a ${formData.budget} budget, depending on booking time and airline')",
    "primaryTransportDescription": "Flight Cost"`;
     day1TitleExample = `'Arrival by Flight & Transfer to ${formData.destination}'`;
     day1ActivitiesExample = `[
        "string (e.g., 'Arrive at [Arrival Airport like Kullu/Chandigarh] by flight.')",
        "string (e.g., 'Collect baggage and find pre-booked taxi or airport shuttle to ${formData.destination}.')",
        "string (e.g., 'Journey to ${formData.destination}, check into hotel by afternoon/evening.')",
        "string (e.g., 'Evening free for leisure or short walk around the hotel area. Dinner at a place fitting a ${formData.budget} budget.')"
      ]`;
  } else if (formData.travelMode === 'bus') {
    travelSpecificJsonStructure = `
  "trainRoutes": null,
  "flightOptions": null,
  "busRoutes": [
    {
      "operator": "string (Bus Option 1: e.g., 'HRTC')",
      "busType": "string (e.g., 'Volvo AC Seater / HIMSUTA service from major hub like Delhi/Chandigarh to ${formData.destination}')",
      "departurePoint": "string (e.g., 'ISBT Kashmiri Gate, Delhi' or 'Sector 43 Bus Stand, Chandigarh')",
      "arrivalPoint": "string (e.g., '${formData.destination} Bus Stand')",
      "timings": "string (e.g., 'Dep: 8:00 PM from Delhi, Arr: 10:00 AM in ${formData.destination}')",
      "duration": "string (e.g., 'Approx 12-14 hours from Delhi/Chandigarh to ${formData.destination}')",
      "estimatedFare": "string (e.g., 'INR 1000-1800 per person from Delhi/Chandigarh for a ${formData.budget} budget')",
      "amenities": ["Charging points", "Blankets (Volvo)", "Water bottle"]
    },
    {
      "operator": "string (Bus Option 2: e.g., 'Local Private Operator for connecting journey from ${formData.startCity} to major hub')",
      "busType": "string (e.g., 'Semi-Sleeper Non-AC or AC Seater from ${formData.startCity} to Delhi/Chandigarh')",
      "departurePoint": "string (e.g., '${formData.startCity} Bus Stand')",
      "arrivalPoint": "string (e.g., 'ISBT Kashmiri Gate, Delhi' or 'Sector 17/43 Bus Stand, Chandigarh')",
      "timings": "string (e.g., 'Multiple options, often overnight')",
      "duration": "string (e.g., 'Approx 24-30 hours from ${formData.startCity} to Delhi/Chandigarh')",
      "estimatedFare": "string (e.g., 'INR 800-1500 per person for this leg, for a ${formData.budget} budget')",
      "amenities": ["Basic amenities, may vary"]
    }
    // Suggest 1-2 bus routes. Acknowledge long journey from ${formData.startCity} likely involves connection at major hub like Delhi or Chandigarh.
  ],`;
    travelSpecificPromptInfo = `Primary travel mode is BUS. Focus on bus routes, possibly connecting, from ${formData.startCity} to ${formData.destination}. Acknowledge the long journey and likely changeovers (e.g., via Delhi or Chandigarh).`;
    primaryTransportCostField = `"estimatedPrimaryTransportCost": "string (e.g., 'INR 1500-3500 per person for bus journey, for a ${formData.budget} budget, may involve multiple legs')",
    "primaryTransportDescription": "Bus Cost"`;
    day1TitleExample = `'Bus Journey & Arrival in ${formData.destination} (or en-route stop)'`;
    day1ActivitiesExample = `[
        "string (e.g., 'Board bus from ${formData.startCity} or connecting city like Delhi/Chandigarh.')",
        "string (e.g., 'Overnight journey on the bus. Ensure comfort items are packed.')",
        "string (e.g., 'Possible changeover or rest stop at a major city if it's a very long multi-leg journey.')",
        "string (e.g., 'Aim to reach ${formData.destination} or the final leg's departure point. Grab a meal that fits a ${formData.budget} budget.')"
      ]`;
  }

  return `
Generate a detailed travel itinerary based on the following user inputs. Respond with ONLY a valid JSON object.
The trip is from ${formData.startCity} to ${formData.destination} from ${formData.travelStartDate} to ${formData.travelEndDate} (${diffDays} days) during ${travelMonth}.
The selected travel mode is: ${formData.travelMode}.
The budget is ${formData.budget}. Travel type is ${formData.travelType}, with interests in ${formData.interests}.
Ensure all suggestions, especially for hotels, food, activities, and overall costs, are consistent with this ${formData.budget} budget level.
${preferences.hotelLocation ? `- Preferred Hotel Location: ${preferences.hotelLocation.replace('_', ' ')}` : ''}
${preferences.foodPreference === 'vegetarian_only' ? `- Food Preference: Vegetarian Only` : ''}
${preferences.budgetUpgrade === 'yes' ? `- Budget Upgrade: User is open to suggestions for slight budget upgrades for better experiences, but core suggestions should fit the stated ${formData.budget} budget.` : ''}

${travelSpecificPromptInfo}

JSON Structure Required (fill with plausible, specific data for the user's request, ensuring only the section for '${formData.travelMode}' is populated and others are null, and all suggestions strictly adhere to the ${formData.budget} budget):
{
  ${travelSpecificJsonStructure}
  "travelModeUsed": "${formData.travelMode}",
  "destinationName": "${formData.destination}",
  "transportToDestination": {
    "fromStationOrAirport": "string (The arrival station/airport from primary travel if not directly in ${formData.destination}, e.g., 'Chandigarh Airport (IXC)', 'Kalka Station (KLK)', or 'Manali Bus Stand' if bus drops there)",
    "mode": "string ('Taxi' or 'Local Bus' or 'Hotel Pickup' - details for transport from primary arrival point to ${formData.destination} hotel)",
    "estimatedCost": "string (Typical cost for this local transfer, e.g., 'Taxi: INR 2500-3500 from Chandigarh to Manali', 'Local auto from Manali bus stand: INR 200-400', reflecting a ${formData.budget} approach)",
    "travelTime": "string (e.g., 'Approx 7-9 hours by taxi from Chandigarh', '15-20 mins from Manali bus stand')",
    "scenicRouteDescription": "string | null (e.g., 'The journey from Chandigarh/Kalka to Manali is very scenic...')"
  },
  "hotelOptions": [
    {
      "name": "string (Hotel Option 1 Name - plausible for ${formData.destination}, ${formData.budget} budget, ${formData.travelType}, ${preferences.hotelLocation || 'any location'})",
      "approxPricePerNight": "string (e.g., '${formData.budget === 'Medium' ? 'INR 2500-4500' : formData.budget === 'Low' ? 'INR 1000-2500' : 'INR 5000-8000'}')",
      "facilities": ["Wi-Fi", "Breakfast (if typical for ${formData.budget} budget)", "Hot water", "Mountain view (if applicable and budget allows)"],
      "rating": "string (e.g., '4.0 stars' or 'Good Reviews', typical for ${formData.budget} options)",
      "distanceFromMallRoad": "string (e.g., '1 km from Mall Road' or 'Near preferred location: ${preferences.hotelLocation || 'central'}')"
    },
    {
      "name": "string (Hotel Option 2 Name - plausible, distinct from option 1, fitting ${formData.budget} budget and preferences)",
      "approxPricePerNight": "string (Similar budget range as option 1)",
      "facilities": ["Wi-Fi", "Restaurant (if common for budget)", "Parking (if applicable)"],
      "rating": "string (e.g., '4.2 stars' or 'Well-rated for value')",
      "distanceFromMallRoad": "string (e.g., 'Peaceful, 2km from Mall Road, good views if scenic preference' or 'Close to ${preferences.hotelLocation || 'main attractions'}')"
    }
    // Provide at least two distinct hotel options.
  ],
  "dayWiseItinerary": [
    {
      "day": 1,
      "title": "string (e.g., ${day1TitleExample})",
      "activities": ${day1ActivitiesExample}
    },
    {
      "day": 2,
      "title": "string (e.g., 'Exploring ${formData.destination} - Day 2: ${formData.interests.split(',')[0].trim()}')",
      "activities": [
        "string (e.g., 'Morning: Visit local attraction based on first interest: ${formData.interests.split(',')[0].trim()}. Consider options fitting ${formData.budget} budget.')",
        { "time": "Afternoon", "description": "Lunch at a ${formData.budget}-friendly place. Activity related to ${formData.interests.split(',').length > 1 ? formData.interests.split(',')[1].trim() : 'sightseeing'}." },
        "string (e.g., 'Evening: Leisure, local market exploration, or relaxing based on ${formData.travelType} preferences.')"
      ]
    }
    // Add subsequent day plans for all ${diffDays} days, tailored to interests ${formData.interests}, ${formData.travelType}, for ${travelMonth} in ${formData.destination}.
    // Ensure activities are comma-separated if multiple exist for a day, and Day objects are comma-separated in this array.
    // All activity suggestions should consider the ${formData.budget} budget.
  ],
  "foodGuide": {
    "mustTryLocalDishes": ["Siddu", "Dham (specify veg if preference: ${preferences.foodPreference === 'vegetarian_only' ? 'Vegetarian Dham' : 'Dham'})", "Trout Fish (if non-veg and fits ${formData.budget} budget)", "Madra (chickpea curry)"],
    "recommendedRestaurants": [
        "string (Suggest a type of restaurant in ${formData.destination} that fits a ${formData.budget} budget, e.g., 'Local Himachali Dhabas for Low/Medium budget')",
        "string (e.g., 'Cafes on Old Manali Road or near ${preferences.hotelLocation || 'Mall Road'} with good value for a ${formData.budget} budget')"
        ]
  },
  "weatherAdvice": {
    "expectedTemperature": "string (Typical temperature for ${formData.destination} in ${travelMonth}, e.g., 'Day 15°C - 25°C, Night 8°C - 15°C')",
    "packingSuggestions": ["Light woolens", "Comfortable walking shoes", "Rainproof jacket (especially if ${travelMonth} is prone to rain)", "Sunscreen", "Personal medication"]
  },
  "emergencyInfo": {
    "nearestHospital": "string (e.g., 'District Hospital ${formData.destination}' or 'Civil Hospital ${formData.destination}')",
    "pharmacies": ["string (e.g., 'Pharmacies on Mall Road in ${formData.destination}')", "string (e.g., 'Another pharmacy near main market')"],
    "localHelplineNumbers": ["Police: 100", "Ambulance: 108", "Tourist Helpline (if available for ${formData.destination})"]
  },
  "costSummary": {
    ${primaryTransportCostField},
    "estimatedLocalTransportCost": "string (e.g., 'Local sightseeing/transfers approx INR 2000-5000 total for a ${formData.budget} budget, excluding primary transport to destination hotel')",
    "estimatedHotelCost": "string (e.g., 'INR ${formData.budget === 'Medium' ? '10000-18000' : formData.budget === 'Low' ? '4000-10000' : '20000-32000'} for ${diffDays -1} nights, reflecting a ${formData.budget} budget for ${formData.travelType}')",
    "estimatedFoodCost": "string (e.g., 'INR ${formData.budget === 'Medium' ? '700-1200' : formData.budget === 'Low' ? '400-700' : '1200-2000'} per person per day for ${formData.budget} budget')",
    "totalApproximateCost": "string (e.g., 'INR ${formData.budget === 'Medium' ? '25000-45000' : formData.budget === 'Low' ? '15000-25000' : '40000-70000'} per person for a ${diffDays}-day trip, for a ${formData.budget} budget. Adjust based on choices.')"
  }
}
Ensure the 'dayWiseItinerary' covers all ${diffDays} days dynamically.
Hotel options should strictly reflect a ${formData.budget} budget. Provide at least two hotel options.
Interests are ${formData.interests}. Travel type is ${formData.travelType}.
The 'transportToDestination' field should detail the journey from the main arrival point (e.g. Kalka station, Chandigarh airport, Manali bus stand) to the hotel in ${formData.destination}. If the primary travel mode (e.g. Bus) drops directly in ${formData.destination}, this section can be brief, like local auto to hotel.
`;
}


export const generateItineraryAI = async (formData: ItineraryFormData, preferences: UserPreferences): Promise<Itinerary> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured. Please set the API_KEY environment variable.");
  }
  if (!formData.travelMode) {
    throw new Error("Travel mode is not specified in formData. Cannot generate itinerary.");
  }

  const prompt = buildPrompt(formData, preferences);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
      // requestOptions: { signal: controller.signal } // Not a standard field, SDK manages timeouts
    });

    clearTimeout(timeoutId);

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    try {
      const parsedItinerary: Itinerary = JSON.parse(jsonStr);

      // Validate essential fields, including destinationName
      if (!parsedItinerary.destinationName || !parsedItinerary.dayWiseItinerary || !parsedItinerary.hotelOptions || !parsedItinerary.travelModeUsed) {
          console.error("Parsed itinerary missing essential fields:", parsedItinerary);
          throw new Error("Parsed itinerary is missing essential fields (destinationName, dayWiseItinerary, hotelOptions, or travelModeUsed).");
      }
      if (parsedItinerary.travelModeUsed !== formData.travelMode) {
          console.error(`Mismatched travel mode: requested ${formData.travelMode}, got ${parsedItinerary.travelModeUsed}`);
          throw new Error(`AI responded for ${parsedItinerary.travelModeUsed} instead of requested ${formData.travelMode}.`);
      }

      // Validate travel mode specific data
      if (formData.travelMode === 'train' && (!parsedItinerary.trainRoutes || parsedItinerary.trainRoutes.length === 0)) {
        console.warn("Train travel mode selected, but no train routes provided by AI. AI Output:", parsedItinerary.trainRoutes);
        // Consider not throwing, but allowing empty if AI genuinely finds none plausible, or prompt instructs to provide 1-2.
        // For now, let's keep it strict if the prompt implies there should be options.
        // throw new Error("Train travel mode selected, but no train routes provided by AI.");
      }
      if (formData.travelMode === 'flight' && (!parsedItinerary.flightOptions || parsedItinerary.flightOptions.length === 0)) {
        console.warn("Flight travel mode selected, but no flight options provided by AI. AI Output:", parsedItinerary.flightOptions);
        // throw new Error("Flight travel mode selected, but no flight options provided by AI.");
      }
      if (formData.travelMode === 'bus' && (!parsedItinerary.busRoutes || parsedItinerary.busRoutes.length === 0)) {
         console.warn("Bus travel mode selected, but no bus routes provided by AI. AI Output:", parsedItinerary.busRoutes);
        // throw new Error("Bus travel mode selected, but no bus routes provided by AI.");
      }

      if (!Array.isArray(parsedItinerary.dayWiseItinerary)) {
        throw new Error("Invalid itinerary format: dayWiseItinerary should be an array.");
      }
      if (!Array.isArray(parsedItinerary.hotelOptions)) {
         if (typeof parsedItinerary.hotelOptions === 'object' && parsedItinerary.hotelOptions !== null) {
            // Attempt to fix if AI returns a single hotel object instead of an array of one
            parsedItinerary.hotelOptions = [parsedItinerary.hotelOptions as any];
         } else {
            console.warn("hotelOptions is not an array or a single object, setting to empty array for safety. Received:", parsedItinerary.hotelOptions);
            parsedItinerary.hotelOptions = [];
         }
      }
      // Ensure other mode arrays are null if not selected
      if (formData.travelMode !== 'train' && parsedItinerary.trainRoutes !== null) {
        console.warn("AI returned trainRoutes when not selected. Setting to null.");
        parsedItinerary.trainRoutes = null;
      }
      if (formData.travelMode !== 'flight' && parsedItinerary.flightOptions !== null) {
         console.warn("AI returned flightOptions when not selected. Setting to null.");
        parsedItinerary.flightOptions = null;
      }
      if (formData.travelMode !== 'bus' && parsedItinerary.busRoutes !== null) {
         console.warn("AI returned busRoutes when not selected. Setting to null.");
        parsedItinerary.busRoutes = null;
      }


      return parsedItinerary;
    } catch (parseError) {
      console.error("Failed to parse JSON response from AI:", parseError);
      console.error("Problematic JSON string (first 1000 chars):", jsonStr.substring(0, 1000) + "...");
      throw new Error(`Failed to parse the itinerary. The AI's response was not valid JSON. Preview: ${jsonStr.substring(0,200)}...`);
    }

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
     if (error.name === 'AbortError' || (error instanceof Error && error.message.toLowerCase().includes('timeout'))) {
        throw new Error("API request timed out. Please try again.");
    }
    if (error instanceof Error && error.message.includes("quota")) {
         throw new Error("API request failed: You may have exceeded your quota. Please check your Gemini API account.");
    }
     if (error.message && (error.message.includes("SAFETY") || (error.cause && typeof error.cause === 'string' && error.cause.includes("SAFETY")))) {
      throw new Error("The generated content was blocked due to safety concerns. Please try modifying your inputs or try again.");
    }
    throw new Error(`AI service request failed: ${error instanceof Error ? error.message : String(error)}`);
=======
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CATEGORIES_DATA, GEMINI_MODEL_TEXT } from '../constants';
import { CategorizationResult } from '../types';

// Ensure API_KEY is available. In a real app, this would be handled by the build/environment.
// For this exercise, we rely on `process.env.API_KEY` being set.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY for Gemini is not set. AI features will be limited.");
  // alert("Gemini API Key is missing. AI categorization will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); // Provide a fallback for initialization if key is missing

const generateCategorizationPrompt = (text: string): string => {
  const categoriesList = CATEGORIES_DATA.map(cat => 
    `"${cat.name}": [${cat.subcategories.map(sub => `"${sub}"`).join(", ")}]`
  ).join(",\n    ");

  return `
Analyze the following employee submission from a factory/machine shop environment.
Classify it into one of the predefined primary categories and one of its corresponding subcategories.

Employee Submission:
"${text}"

Predefined Categories and Subcategories (JSON format):
{
    ${categoriesList}
}

Respond ONLY with a JSON object in the format: {"category": "CATEGORY_NAME", "subcategory": "SUBCATEGORY_NAME"}.
If the submission doesn't clearly fit any specific subcategory but fits a category, choose the most general subcategory or the first one listed for that category.
If it doesn't fit any category, use "Uncategorized" for both.
Example response: {"category": "Safety (Machine Shop)", "subcategory": "Hazard Reporting"}
`;
};

export const categorizeSubmissionWithGemini = async (description: string): Promise<CategorizationResult> => {
  if (!apiKey) {
    // Fallback or error if API key is missing
    console.warn("Gemini API key not available. Falling back to default categorization.");
    return { category: "Uncategorized", subcategory: "Uncategorized" };
  }

  const prompt = generateCategorizationPrompt(description);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for more deterministic categorization
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedResult = JSON.parse(jsonStr) as CategorizationResult;
    
    // Validate result against known categories
    const foundCategory = CATEGORIES_DATA.find(c => c.name === parsedResult.category);
    if (foundCategory) {
        if (foundCategory.subcategories.includes(parsedResult.subcategory)) {
            return parsedResult;
        } else {
            // If subcategory is invalid but category is valid, pick first subcategory or "Uncategorized"
            console.warn(`Gemini returned invalid subcategory '${parsedResult.subcategory}' for category '${parsedResult.category}'. Defaulting subcategory.`);
            return { category: parsedResult.category, subcategory: foundCategory.subcategories[0] || "Uncategorized" };
        }
    }
    
    console.warn(`Gemini returned an unknown category: ${parsedResult.category}. Defaulting.`);
    return { category: "Uncategorized", subcategory: "Uncategorized" };

  } catch (error) {
    console.error("Error calling Gemini API for categorization:", error);
    // Fallback to a default or error state
    return { category: "Uncategorized", subcategory: "Uncategorized" };
>>>>>>> 88260e65f84fd5b0bc475028cd30d2c3bc2c24af
  }
};
