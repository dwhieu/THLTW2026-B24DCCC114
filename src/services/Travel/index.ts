import { defaultDestinations, defaultItinerary, defaultTotalBudget } from './defaultData';
import { readJson, writeJson } from './storage';

const KEYS = {
	destinations: 'travel.destinations',
	itinerary: 'travel.itinerary',
	totalBudget: 'travel.totalBudget',
	records: 'travel.itineraryRecords',
};

export function loadDestinations(): Travel.Destination[] {
	const data = readJson<Travel.Destination[]>(KEYS.destinations, []);
	return data.length ? data : defaultDestinations;
}

export function saveDestinations(destinations: Travel.Destination[]) {
	writeJson(KEYS.destinations, destinations);
}

export function loadItinerary(): Travel.Itinerary {
	return readJson<Travel.Itinerary>(KEYS.itinerary, defaultItinerary);
}

export function saveItinerary(itinerary: Travel.Itinerary) {
	writeJson(KEYS.itinerary, itinerary);
}

export function loadTotalBudget(): number {
	return readJson<number>(KEYS.totalBudget, defaultTotalBudget);
}

export function saveTotalBudget(totalBudget: number) {
	writeJson(KEYS.totalBudget, totalBudget);
}

export function loadRecords(): Travel.ItineraryRecord[] {
	return readJson<Travel.ItineraryRecord[]>(KEYS.records, []);
}

export function saveRecords(records: Travel.ItineraryRecord[]) {
	writeJson(KEYS.records, records);
}
