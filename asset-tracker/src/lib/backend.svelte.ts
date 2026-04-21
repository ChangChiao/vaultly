import { browser } from '$app/environment';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

export type BackendStatus = 'idle' | 'checking' | 'retrying' | 'ready' | 'failed';

interface BackendState {
	get status(): BackendStatus;
	get message(): string;
	get attempt(): number;
	get isPending(): boolean;
}

interface WarmupOptions {
	force?: boolean;
	allowFailure?: boolean;
}

interface RunOptions {
	retries?: number;
	skipWarmup?: boolean;
}

const RETRY_DELAYS = [2000, 4000, 8000];
const REQUEST_TIMEOUT_MS = 10000;

let status = $state<BackendStatus>('idle');
let message = $state('');
let attempt = $state(0);
let activeWarmup: Promise<void> | null = null;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(signalTimeoutMs: number) {
	const controller = new AbortController();
	const timer = window.setTimeout(() => controller.abort(), signalTimeoutMs);

	return {
		signal: controller.signal,
		cleanup: () => window.clearTimeout(timer)
	};
}

function isRetryableError(error: unknown) {
	const raw = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

	return (
		raw.includes('failed to fetch') ||
		raw.includes('network') ||
		raw.includes('timed out') ||
		raw.includes('timeout') ||
		raw.includes('503') ||
		raw.includes('502') ||
		raw.includes('500') ||
		raw.includes('504')
	);
}

function toUserMessage(error: unknown) {
	const raw = error instanceof Error ? error.message : String(error);

	if (isRetryableError(error)) {
		return '服務正在喚醒中，請稍候再試。';
	}

	if (raw.toLowerCase().includes('invalid login credentials')) {
		return 'Email 或密碼不正確。';
	}

	return raw || '目前無法連線到服務。';
}

async function pingSupabase() {
	if (!browser) return;

	const { signal, cleanup } = withTimeout(REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(`${PUBLIC_SUPABASE_URL}/rest/v1/`, {
			method: 'GET',
			headers: {
				apikey: PUBLIC_SUPABASE_ANON_KEY,
				Authorization: `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
			},
			signal
		});

		if (response.status >= 500) {
			throw new Error(`Supabase warmup failed with status ${response.status}`);
		}
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new Error('Supabase warmup timed out');
		}

		throw error;
	} finally {
		cleanup();
	}
}

export function getBackendState(): BackendState {
	return {
		get status() {
			return status;
		},
		get message() {
			return message;
		},
		get attempt() {
			return attempt;
		},
		get isPending() {
			return status === 'checking' || status === 'retrying';
		}
	};
}

export async function warmupSupabase(options: WarmupOptions = {}) {
	const { force = false, allowFailure = false } = options;

	if (!browser) return;
	if (!force && status === 'ready') return;
	if (!force && activeWarmup) return activeWarmup;

	const runner = (async () => {
		for (let index = 0; index <= RETRY_DELAYS.length; index += 1) {
			attempt = index + 1;
			status = index === 0 ? 'checking' : 'retrying';
			message =
				index === 0
					? '正在連線到資料服務，首次載入可能需要幾十秒。'
					: `資料服務正在喚醒，重新連線中（第 ${index + 1} 次）。`;

			try {
				await pingSupabase();
				status = 'ready';
				message = '';
				attempt = 0;
				return;
			} catch (error) {
				if (index === RETRY_DELAYS.length) {
					status = 'failed';
					message = toUserMessage(error);
					throw error;
				}

				await sleep(RETRY_DELAYS[index]);
			}
		}
	})();

	activeWarmup = runner.finally(() => {
		activeWarmup = null;
	});

	if (allowFailure) {
		try {
			await activeWarmup;
		} catch {
			return;
		}
		return;
	}

	return activeWarmup;
}

export async function runWithBackendRecovery<T>(
	operation: () => PromiseLike<T>,
	options: RunOptions = {}
) {
	const { retries = 2, skipWarmup = false } = options;

	if (!browser) {
		return operation();
	}

	if (!skipWarmup) {
		await warmupSupabase({ allowFailure: true });
	}

	for (let index = 0; index <= retries; index += 1) {
		try {
			const result = await operation();
			status = 'ready';
			message = '';
			attempt = 0;
			return result;
		} catch (error) {
			if (!isRetryableError(error)) {
				throw new Error(toUserMessage(error));
			}

			if (index === retries) {
				status = 'failed';
				message = toUserMessage(error);
				throw new Error(message);
			}

			status = 'retrying';
			attempt = index + 1;
			message = `資料服務正在喚醒，正在重試（第 ${index + 1} 次）。`;

			await sleep(RETRY_DELAYS[Math.min(index, RETRY_DELAYS.length - 1)]);
			await warmupSupabase({ force: true, allowFailure: true });
		}
	}

	throw new Error('目前無法連線到服務。');
}
