/**
 * Generic item shape for presentational components.
 * Domain-agnostic: components consume this instead of domain entities.
 */
export interface ViewItem {
	id: string | number;
	label: string;
}
