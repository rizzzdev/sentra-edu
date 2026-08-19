export function formatCurrencyIDR(amount: number | string | null | undefined): string {
  const numericAmount = Number(amount || 0);
  return 'Rp ' + numericAmount.toLocaleString('id-ID');
}

export function formatDateIndonesian(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  const dateObj = new Date(isoString.length === 10 ? `${isoString}T00:00:00` : isoString);
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTimeIndonesian(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTimeRange(startTimeIso: string, endTimeIso: string): string {
  try {
    const startDate = new Date(startTimeIso);
    const endDate = new Date(endTimeIso);
    return `${startDate.toTimeString().slice(0, 5)}–${endDate.toTimeString().slice(0, 5)}`;
  } catch {
    return '';
  }
}

export function getNextDayDateTimeDefault(): string {
  const nextDate = new Date(Date.now() + 86400000);
  nextDate.setMinutes(0, 0, 0);
  const padZero = (num: number) => String(num).padStart(2, '0');
  return `${nextDate.getFullYear()}-${padZero(nextDate.getMonth() + 1)}-${padZero(nextDate.getDate())}T${padZero(nextDate.getHours())}:00`;
}
