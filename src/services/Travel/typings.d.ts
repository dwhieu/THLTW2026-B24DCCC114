declare module Travel {
	export type DestinationType = 'beach' | 'mountain' | 'city';

	export type BudgetCategory = 'food' | 'lodging' | 'transport' | 'tickets';

	export type DestinationCosts = Record<BudgetCategory, number>;

	export interface Destination {
		id: string;
		name: string;
		location: string;
		type: DestinationType;
		description: string;
		imageUrl?: string;
		rating: number; // 0-5
		price: number; // VND (rough)
		visitDurationHours: number;
		lat: number;
		lng: number;
		costs: DestinationCosts;
	}

	export interface ItineraryStop {
		id: string;
		destinationId: string;
	}

	export interface ItineraryDay {
		id: string;
		label: string;
		date?: string; // ISO string
		stops: ItineraryStop[];
	}

	export interface Itinerary {
		id: string;
		name: string;
		days: ItineraryDay[];
		updatedAt: string;
	}

	export interface BudgetTotals {
		food: number;
		lodging: number;
		transport: number;
		tickets: number;
		total: number;
	}

	export interface ItineraryTotals {
		budget: BudgetTotals;
		totalVisitHours: number;
		totalTravelKm: number;
		totalTravelHours: number;
	}

	export interface ItineraryRecord {
		id: string;
		createdAt: string;
		itineraryName: string;
		itineraryId: string;
		totals: ItineraryTotals;
		// for popularity stats
		destinationIds: string[];
	}
}
