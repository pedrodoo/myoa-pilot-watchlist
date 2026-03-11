/**
 * Generic item shape for presentational components.
 * Domain-agnostic: components consume this instead of domain entities.
 */
export type WatchStatus = 'want_to_watch' | 'watched';

export interface ViewItem {
	id: string | number;
	label: string;
	addedAt?: string;
	posterUrl?: string | null;
	status?: WatchStatus;
}
