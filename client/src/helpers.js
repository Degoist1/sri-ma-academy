const two = (n) => String(n).padStart(2, '0');

// today as 'YYYY-MM-DD' (local time)
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};

// last n months as 'YYYY-MM', newest first
export const lastMonths = (n = 6) =>
  Array.from({ length: n }, (_, i) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${two(d.getMonth() + 1)}`;
  });
