export type CreditBalance = {
  balanceMinutes: number;
};

export type CreditInstructor = {
  id: string;
  name: string;
  avatarUrl: string | null;
  suburb: string | null;
};

export type CreditSlot = {
  instructorId: string;
  startDatetime: string;
  endDatetime: string;
  startTime: string;
  endTime: string;
};

export type CreditSlotSearch = {
  instructorId: string;
  date: string;
  suburb: string;
  durationMinutes: number;
};

export type CreditAvailabilitySearch = {
  instructorId: string;
  month: string;
  durationMinutes: number;
};

export type CreditAvailabilityDay = {
  date: string;
  slotCount: number;
  slots: CreditSlot[];
};

export type CreateCreditBookingInput = {
  instructorId: string;
  startDatetime: string;
  durationMinutes: number;
  pickupSuburb: string;
  pickupPostcode?: string;
  idempotencyKey: string;
};

export type CreditBookingResult = CreditBalance & {
  booking: {
    id: string;
    schoolId: string;
    instructorId: string;
    startDatetime: string;
    endDatetime: string;
    pickupSuburb: string;
    status: "confirmed";
  };
};
