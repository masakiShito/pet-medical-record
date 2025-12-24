export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toISODate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function toISODateTime(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  return new Date(date).toISOString();
}
