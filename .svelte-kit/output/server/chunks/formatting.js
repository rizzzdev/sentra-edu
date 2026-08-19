function formatCurrencyIDR(amount) {
  const numericAmount = Number(amount || 0);
  return "Rp " + numericAmount.toLocaleString("id-ID");
}
function formatDateIndonesian(isoString) {
  if (!isoString) return "-";
  const dateObj = new Date(isoString.length === 10 ? `${isoString}T00:00:00` : isoString);
  if (isNaN(dateObj.getTime())) return "-";
  return dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
export {
  formatDateIndonesian as a,
  formatCurrencyIDR as f
};
