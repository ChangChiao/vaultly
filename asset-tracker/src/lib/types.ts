export type Category =
	| 'stock_tw'
	| 'stock_us'
	| 'stock_uk'
	| 'cash'
	| 'deposit'
	| 'fund'
	| 'forex_usd'
	| 'forex_jpy';

export type Currency = 'TWD' | 'USD' | 'JPY';

export interface Snapshot {
	id: string;
	user_id: string;
	date: string;
	created_at: string;
	updated_at: string;
}

export interface SnapshotEntry {
	id: string;
	snapshot_id: string;
	category: Category;
	original_amount: number;
	original_currency: Currency;
	exchange_rate: number;
	twd_amount: number;
	created_at: string;
}

export interface SnapshotWithEntries extends Snapshot {
	entries: SnapshotEntry[];
}

export const CATEGORY_CONFIG: Record<
	Category,
	{ label: string; currency: Currency; group: string }
> = {
	stock_tw: { label: '台股', currency: 'TWD', group: '股票' },
	stock_us: { label: '美股', currency: 'USD', group: '股票' },
	stock_uk: { label: '英股', currency: 'USD', group: '股票' },
	cash: { label: '現金', currency: 'TWD', group: '現金' },
	deposit: { label: '定存', currency: 'TWD', group: '定存' },
	fund: { label: '基金', currency: 'TWD', group: '基金' },
	forex_usd: { label: '美金', currency: 'USD', group: '外幣現金' },
	forex_jpy: { label: '日圓', currency: 'JPY', group: '外幣現金' }
};

export const CATEGORIES: Category[] = [
	'stock_tw',
	'stock_us',
	'stock_uk',
	'cash',
	'deposit',
	'fund',
	'forex_usd',
	'forex_jpy'
];
