/**
 * Format an ISO date string as a relative time (e.g. "2 days ago", "just now").
 */
export function formatRelativeTime(iso: string | undefined | null): string {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	const now = new Date();
	const deltaSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	if (Math.abs(deltaSeconds) < 60) return rtf.format(-deltaSeconds, 'second');
	const deltaMinutes = Math.floor(deltaSeconds / 60);
	if (Math.abs(deltaMinutes) < 60) return rtf.format(-deltaMinutes, 'minute');
	const deltaHours = Math.floor(deltaMinutes / 60);
	if (Math.abs(deltaHours) < 24) return rtf.format(-deltaHours, 'hour');
	const deltaDays = Math.floor(deltaHours / 24);
	if (Math.abs(deltaDays) < 30) return rtf.format(-deltaDays, 'day');
	const deltaMonths = Math.floor(deltaDays / 30);
	if (Math.abs(deltaMonths) < 12) return rtf.format(-deltaMonths, 'month');
	const deltaYears = Math.floor(deltaMonths / 12);
	return rtf.format(-deltaYears, 'year');
}
