import type { ViewItem } from '$lib/types';

export type StatusFilter = 'all' | 'want_to_watch' | 'watched';

export interface FilterState {
	statusFilter: StatusFilter;
}

export type SortBy = 'date' | 'title' | 'rating' | 'status';
export type SortDir = 'asc' | 'desc';

export interface SortState {
	sortBy: SortBy;
	sortDir: SortDir;
}

export function applyFilters(items: ViewItem[], filter: FilterState): ViewItem[] {
	return items.filter((item) => {
		if (filter.statusFilter === 'all') return true;
		return (item.status ?? 'want_to_watch') === filter.statusFilter;
	});
}

export function applySort(items: ViewItem[], sort: SortState): ViewItem[] {
	const dir = sort.sortDir === 'asc' ? 1 : -1;
	const sorted = [...items].sort((a, b) => {
		switch (sort.sortBy) {
			case 'date': {
				const ta = a.addedAt ? new Date(a.addedAt).getTime() : 0;
				const tb = b.addedAt ? new Date(b.addedAt).getTime() : 0;
				return (ta - tb) * dir;
			}
			case 'title':
				return (
					dir *
					(a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }) ||
						0)
				);
			case 'rating': {
				// Unrated (undefined or 0) sort last when desc, first when asc
				const ra = a.rating != null && a.rating >= 1 ? a.rating : -1;
				const rb = b.rating != null && b.rating >= 1 ? b.rating : -1;
				return (ra - rb) * dir;
			}
			case 'status': {
				const sa = a.status === 'watched' ? 1 : 0;
				const sb = b.status === 'watched' ? 1 : 0;
				return (sa - sb) * dir;
			}
			default:
				return 0;
		}
	});
	return sorted;
}

export function filterAndSort(
	items: ViewItem[],
	filter: FilterState,
	sort: SortState
): ViewItem[] {
	return applySort(applyFilters(items, filter), sort);
}
