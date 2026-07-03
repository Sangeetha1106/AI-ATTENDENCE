export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatPercentage = (val) => {
  if (isNaN(val)) return '0%';
  return `${Number(val).toFixed(2)}%`;
};
