import { browser } from '$app/environment';

interface CacheEnvelope<T> {
	data: T;
	savedAt: number;
}

export function readCache<T>(key: string, maxAgeMs?: number): T | null {
	if (!browser) return null;

	const raw = localStorage.getItem(key);
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw) as CacheEnvelope<T>;
		if (maxAgeMs && Date.now() - parsed.savedAt > maxAgeMs) {
			localStorage.removeItem(key);
			return null;
		}
		return parsed.data;
	} catch {
		localStorage.removeItem(key);
		return null;
	}
}

export function writeCache<T>(key: string, data: T) {
	if (!browser) return;

	const payload: CacheEnvelope<T> = {
		data,
		savedAt: Date.now()
	};
	localStorage.setItem(key, JSON.stringify(payload));
}

export function removeCache(key: string) {
	if (!browser) return;
	localStorage.removeItem(key);
}

export function clearUserCaches(userId: string) {
	if (!browser) return;

	const prefixes = [
		`latest-snapshot:${userId}`,
		`snapshots:${userId}`,
		`reports:${userId}`
	];

	for (const prefix of prefixes) {
		localStorage.removeItem(prefix);
	}
}
