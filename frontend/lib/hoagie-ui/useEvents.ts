'use client';

import { useEventList } from '@/lib/useEventList';

// Light pastel bg, darker solid border/text color
export const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
	sports: { bg: '#EFF6FF', border: '#3B82F6' },
	academic: { bg: '#F5F3FF', border: '#7C3AED' },
	food: { bg: '#FFF7ED', border: '#EA580C' },
	social: { bg: '#F0FDF4', border: '#16A34A' },
	default: { bg: '#F9FAFB', border: '#6B7280' },
};

export function getCategoryColor(category: string): { bg: string; border: string } {
	return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default;
}

export function useEvents(startTime: Date, endTime: Date) {
	const params = new URLSearchParams({
		start_time: startTime.toISOString(),
		end_time: endTime.toISOString(),
	});
	return useEventList(`/api/event?${params}`);
}
