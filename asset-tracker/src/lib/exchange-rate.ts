export interface ExchangeRates {
	USD: number;
	JPY: number;
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
	const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=TWD,JPY');

	if (!res.ok) {
		throw new Error('Failed to fetch exchange rates');
	}

	const data = await res.json();
	const usdToTwd = data.rates.TWD;
	const jpyToTwd = usdToTwd / data.rates.JPY;

	return {
		USD: usdToTwd,
		JPY: jpyToTwd
	};
}

export function convertToTwd(amount: number, currency: string, rates: ExchangeRates): number {
	if (currency === 'TWD') return amount;
	if (currency === 'USD') return amount * rates.USD;
	if (currency === 'JPY') return amount * rates.JPY;
	return amount;
}
