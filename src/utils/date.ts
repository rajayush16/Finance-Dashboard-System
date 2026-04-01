export const toISODateString = (value: Date): string => {
  return value.toISOString().split("T")[0];
};
