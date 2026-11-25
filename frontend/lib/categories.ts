export type CategoryName =
	| 'Social Events'
	| 'Academic'
	| 'Sports'
	| 'Free food'
	| 'Career'
	| 'Arts and Theater'
	| 'Housing & Sales'
	| 'Other';

export const CATEGORIES: { name: CategoryName; color: string; bg: string }[] = [
	{ name: 'Social Events', color: '#8b45e8', bg: '#f5eeff' },
	{ name: 'Academic', color: '#3b6fd9', bg: '#eef3ff' },
	{ name: 'Sports', color: '#c0463f', bg: '#fdeeed' },
	{ name: 'Free food', color: '#e0762f', bg: '#fff3e9' },
	{ name: 'Career', color: '#b8942a', bg: '#fbf5e3' },
	{ name: 'Arts and Theater', color: '#3f8a4f', bg: '#eaf6ec' },
	{ name: 'Housing & Sales', color: '#eb5f78', bg: '#fdeef1' },
	{ name: 'Other', color: '#6b7280', bg: '#f3f4f6' },
];

const DEFAULT_COLOR = { color: '#6b7280', bg: '#f3f4f6' };

/** Colors for one category name, falling back to "Other" gray. */
export function colorsFor(name: string | undefined): { color: string; bg: string } {
	return CATEGORIES.find((c) => c.name === name) ?? DEFAULT_COLOR;
}

export function primaryCategory(names: string[] | undefined): string {
	return names && names.length > 0 ? names[0] : 'Other';
}
