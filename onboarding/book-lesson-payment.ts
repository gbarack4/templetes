export function calculateOnboardingLessonPayment(
  hours: number,
  availableCreditHours: number,
  pricePerHour: number,
) {
  const creditHoursUsed = Math.min(hours, availableCreditHours);
  const payableHours = Math.max(0, hours - creditHoursUsed);
  const subtotal = hours * pricePerHour;
  const creditDiscount = creditHoursUsed * pricePerHour;
  const totalDue = payableHours * pricePerHour;

  return {
    creditHoursUsed,
    payableHours,
    subtotal,
    creditDiscount,
    totalDue,
  };
}
