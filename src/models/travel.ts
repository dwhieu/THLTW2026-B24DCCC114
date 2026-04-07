import { useState } from 'react';
import { calcItineraryTotals } from '@/services/Travel/calc';
import {
	loadDestinations,
	loadItinerary,
	loadRecords,
	loadTotalBudget,
	saveDestinations,
	saveItinerary,
	saveRecords,
	saveTotalBudget,
} from '@/services/Travel';

function createId(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default () => {
	const [bootstrapped, setBootstrapped] = useState(false);
	const [destinations, setDestinations] = useState<Travel.Destination[]>([]);
	const [itinerary, setItinerary] = useState<Travel.Itinerary | undefined>(undefined);
	const [totalBudget, setTotalBudget] = useState<number>(0);
	const [records, setRecords] = useState<Travel.ItineraryRecord[]>([]);

	const bootstrap = () => {
		if (bootstrapped) return;
		const ds = loadDestinations();
		const it = loadItinerary();
		const tb = loadTotalBudget();
		const rc = loadRecords();

		setDestinations(ds);
		setItinerary(it);
		setTotalBudget(tb);
		setRecords(rc);
		setBootstrapped(true);
	};

	const persistDestinations = (next: Travel.Destination[]) => {
		setDestinations(next);
		saveDestinations(next);
	};

	const persistItinerary = (next: Travel.Itinerary) => {
		setItinerary(next);
		saveItinerary(next);
	};

	const persistRecords = (next: Travel.ItineraryRecord[]) => {
		setRecords(next);
		saveRecords(next);
	};

	const updateTotalBudget = (next: number) => {
		setTotalBudget(next);
		saveTotalBudget(next);
	};

	// Destinations CRUD
	const addDestination = (payload: Omit<Travel.Destination, 'id'>) => {
		const next: Travel.Destination = { ...payload, id: createId('dest') };
		persistDestinations([next, ...destinations]);
		return next;
	};

	const updateDestination = (id: string, patch: Partial<Omit<Travel.Destination, 'id'>>) => {
		const next = destinations.map((d) => (d.id === id ? { ...d, ...patch } : d));
		persistDestinations(next);
	};

	const deleteDestination = (id: string) => {
		persistDestinations(destinations.filter((d) => d.id !== id));
		if (!itinerary) return;
		const nextItinerary: Travel.Itinerary = {
			...itinerary,
			days: itinerary.days.map((day) => ({
				...day,
				stops: day.stops.filter((s) => s.destinationId !== id),
			})),
			updatedAt: new Date().toISOString(),
		};
		persistItinerary(nextItinerary);
	};

	// Itinerary editing
	const ensureItinerary = () => {
		if (itinerary) return itinerary;
		const fallback = loadItinerary();
		setItinerary(fallback);
		return fallback;
	};

	const renameItinerary = (name: string) => {
		const current = ensureItinerary();
		persistItinerary({ ...current, name, updatedAt: new Date().toISOString() });
	};

	const addDay = () => {
		const current = ensureItinerary();
		const dayIndex = current.days.length + 1;
		const nextDay: Travel.ItineraryDay = { id: createId('day'), label: `Ngày ${dayIndex}`, stops: [] };
		persistItinerary({ ...current, days: [...current.days, nextDay], updatedAt: new Date().toISOString() });
	};

	const removeDay = (dayId: string) => {
		const current = ensureItinerary();
		const nextDays = current.days.filter((d) => d.id !== dayId);
		persistItinerary({
			...current,
			days: nextDays.length ? nextDays : current.days,
			updatedAt: new Date().toISOString(),
		});
	};

	const addDestinationToDay = (dayId: string, destinationId: string) => {
		const current = ensureItinerary();
		const nextDays = current.days.map((d) => {
			if (d.id !== dayId) return d;
			return { ...d, stops: [...d.stops, { id: createId('stop'), destinationId }] };
		});
		persistItinerary({ ...current, days: nextDays, updatedAt: new Date().toISOString() });
	};

	const removeStop = (dayId: string, stopId: string) => {
		const current = ensureItinerary();
		const nextDays = current.days.map((d) => {
			if (d.id !== dayId) return d;
			return { ...d, stops: d.stops.filter((s) => s.id !== stopId) };
		});
		persistItinerary({ ...current, days: nextDays, updatedAt: new Date().toISOString() });
	};

	const moveStop = (dayId: string, fromIndex: number, toIndex: number) => {
		const current = ensureItinerary();
		const nextDays = current.days.map((d) => {
			if (d.id !== dayId) return d;
			const stops = [...d.stops];
			if (fromIndex < 0 || fromIndex >= stops.length) return d;
			if (toIndex < 0 || toIndex >= stops.length) return d;
			const [item] = stops.splice(fromIndex, 1);
			stops.splice(toIndex, 0, item);
			return { ...d, stops };
		});
		persistItinerary({ ...current, days: nextDays, updatedAt: new Date().toISOString() });
	};

	const getTotals = () => {
		if (!itinerary) return undefined;
		return calcItineraryTotals(itinerary, destinations);
	};

	const saveItineraryRecord = () => {
		if (!itinerary) return;
		const totals = calcItineraryTotals(itinerary, destinations);
		const destinationIds = itinerary.days.flatMap((d) => d.stops.map((s) => s.destinationId));
		const next: Travel.ItineraryRecord = {
			id: createId('record'),
			createdAt: new Date().toISOString(),
			itineraryName: itinerary.name,
			itineraryId: itinerary.id,
			totals,
			destinationIds,
		};
		persistRecords([next, ...records]);
	};

	return {
		bootstrapped,
		bootstrap,

		destinations,
		addDestination,
		updateDestination,
		deleteDestination,

		itinerary,
		renameItinerary,
		addDay,
		removeDay,
		addDestinationToDay,
		removeStop,
		moveStop,
		getTotals,
		saveItineraryRecord,

		totalBudget,
		updateTotalBudget,

		records,
	};
};
