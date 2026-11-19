export function formatEventTime(startHour: number, endHour: number): string {
	const toLabel = (value: number) => {
		const hours = Math.floor(value) % 24;
		const minutes = Math.round((value - Math.floor(value)) * 60);
		const period = hours < 12 ? 'AM' : 'PM';
		const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
		const minuteLabel = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`;
		return `${normalizedHour}${minuteLabel} ${period}`;
	};

	return `${toLabel(startHour)} - ${toLabel(endHour)}`;
}
