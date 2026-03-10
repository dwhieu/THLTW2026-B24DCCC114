export function loadFromStorage<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch (e) {
		return fallback;
	}
}

export function saveToStorage<T>(key: string, value: T): void {
	localStorage.setItem(key, JSON.stringify(value));
}

export function createId(prefix = ''): string {
	return `${prefix}${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
