export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
	const R = 6371; // km
	const dLat = deg2rad(b.lat - a.lat);
	const dLng = deg2rad(b.lng - a.lng);
	const sa = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) * Math.sin(dLng / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
	return R * c;
}

function deg2rad(deg: number) {
	return (deg * Math.PI) / 180;
}

export function calcItineraryTotals(
	itinerary: Travel.Itinerary,
	destinations: Travel.Destination[],
): Travel.ItineraryTotals {
	const destMap = new Map(destinations.map((d) => [d.id, d] as const));

	let totalVisitHours = 0;
	let totalTravelKm = 0;
	let totalTravelHours = 0;
	const budget: Travel.BudgetTotals = { food: 0, lodging: 0, transport: 0, tickets: 0, total: 0 };

	const avgSpeedKmh = 55;

	for (const day of itinerary.days) {
		const dayDests = day.stops.map((s) => destMap.get(s.destinationId)).filter(Boolean) as Travel.Destination[];
		for (const d of dayDests) {
			totalVisitHours += d.visitDurationHours;
			budget.food += d.costs.food;
			budget.lodging += d.costs.lodging;
			budget.transport += d.costs.transport;
			budget.tickets += d.costs.tickets;
		}

		for (let i = 0; i < dayDests.length - 1; i += 1) {
			const from = dayDests[i];
			const to = dayDests[i + 1];
			const km = haversineKm({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
			totalTravelKm += km;
			totalTravelHours += km / avgSpeedKmh;
		}
	}

	budget.total = budget.food + budget.lodging + budget.transport + budget.tickets;

	return {
		budget,
		totalVisitHours,
		totalTravelKm,
		totalTravelHours,
	};
}
