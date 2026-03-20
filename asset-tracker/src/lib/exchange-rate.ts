export interface ExchangeRates {
	USD: number;
	JPY: number;
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
	const res = await fetch('https://open.er-api.com/v6/latest/USD');

	if (!res.ok) {
		throw new Error('Failed to fetch exchange rates');
	}

	const data = await res.json();
	const usdToTwd = data.rates.TWD;
	const jpyRate = data.rates.JPY;

	if (!usdToTwd || !jpyRate) {
		throw new Error('Missing TWD or JPY rate in response');
	}

	return {
		USD: usdToTwd,
		JPY: usdToTwd / jpyRate
	};
}

export function convertToTwd(amount: number, currency: string, rates: ExchangeRates): number {
	if (currency === 'TWD') return amount;
	if (currency === 'USD') return amount * rates.USD;
	if (currency === 'JPY') return amount * rates.JPY;
	return amount;
}
