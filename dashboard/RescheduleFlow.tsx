"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "./types";
import type { InstructorOption } from "./mock-data";
import {
  getInstructorByName,
  mockInstructors,
  mockRescheduleDates,
  mockRescheduleTimeSlots,
} from "./mock-data";
import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";
import {
  InstructorProfileSummary,
  InstructorSearch,
} from "./components/InstructorSearch";
import {
  getSelectedRescheduleDate,
  RescheduleCalendar,
} from "./components/RescheduleCalendar";

type RescheduleFlowProps = Readonly<{
  lesson: Lesson;
}>;

function CurrentLessonCard({
  lesson,
  instructor,
  onChangeInstructor,
  showChangeInstructor,
}: Readonly<{
  lesson: Lesson;
  instructor: InstructorOption;
  onChangeInstructor?: () => void;
  showChangeInstructor?: boolean;
}>) {
  return (
    <section className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Current lesson
      </p>
      <p className="mt-2 font-semibold text-slate-900">
        {lesson.month} {lesson.day} · {lesson.weekday}
      </p>
      <p className="mt-1 text-sm text-slate-600">{lesson.timeRange}</p>
      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          Instructor
        </p>
        <InstructorProfileSummary instructor={instructor} />
        {showChangeInstructor && onChangeInstructor && (
          <button
            type="button"
            onClick={onChangeInstructor}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Change instructor
          </button>
        )}
      </div>
    </section>
  );
}

export function RescheduleFlow({ lesson }: RescheduleFlowProps) {
  const router = useRouter();
  const defaultInstructor = getInstructorByName(lesson.instructor);

  const [showInstructorSearch, setShowInstructorSearch] = useState(false);
  const [instructorConfirmed, setInstructorConfirmed] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState(defaultInstructor.id);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedInstructor =
    mockInstructors.find((instructor) => instructor.id === selectedInstructorId) ??
    defaultInstructor;
  const selectedDate = getSelectedRescheduleDate(mockRescheduleDates, selectedDateId);
  const canConfirm = instructorConfirmed && selectedDate && selectedTime;

  function handleInstructorSelect(instructorId: string) {
    setSelectedInstructorId(instructorId);
    setShowInstructorSearch(false);
    setInstructorConfirmed(true);
    setSelectedDateId(null);
    setSelectedTime(null);
  }

  function handleChangeInstructorClick() {
    setShowInstructorSearch(true);
    setSelectedDateId(null);
    setSelectedTime(null);
  }

  function handleConfirm() {
    if (!canConfirm) return;
    setIsConfirmed(true);
  }

  function goBack() {
    router.push("/dashboard");
  }

  if (isConfirmed && selectedDate && selectedTime) {
    return (
      <FlowPageContent className="text-center">
        <div className="flex flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">Lesson rescheduled</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your lesson has been updated with the details below.
          </p>
          <div className="mt-6 w-full rounded-2xl bg-slate-50 p-4 text-left">
            <p className="font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>
            <p className="mt-1 text-sm text-slate-600">{selectedTime}</p>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <InstructorProfileSummary instructor={selectedInstructor} />
            </div>
          </div>
          <button
            type="button"
            onClick={goBack}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </FlowPageContent>
    );
  }

  return (
    <>
      <FlowPageHeader title="Reschedule lesson" onBack={goBack} />
      <FlowPageContent>
        <CurrentLessonCard
          lesson={lesson}
          instructor={selectedInstructor}
          showChangeInstructor={instructorConfirmed && !showInstructorSearch}
          onChangeInstructor={handleChangeInstructorClick}
        />

        {!instructorConfirmed && !showInstructorSearch && (
          <section className="space-y-2">
            <button
              type="button"
              onClick={() => setShowInstructorSearch(true)}
              className="w-full rounded-xl bg-slate-100 py-3 text-sm font-medium text-blue-600 transition hover:bg-slate-200"
            >
              Change instructor
            </button>
            <button
              type="button"
              onClick={() => setInstructorConfirmed(true)}
              className="w-full py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              Continue with {lesson.instructor}
            </button>
          </section>
        )}

        {showInstructorSearch && (
          <InstructorSearch
            instructors={mockInstructors}
            onSelect={handleInstructorSelect}
            onCancel={() => setShowInstructorSearch(false)}
          />
        )}

        {instructorConfirmed && !showInstructorSearch && !selectedDate && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Pick a new date</h2>
            <RescheduleCalendar
              availableDates={mockRescheduleDates}
              selectedDateId={selectedDateId}
              onSelectDate={(dateId) => {
                setSelectedDateId(dateId);
                setSelectedTime(null);
              }}
            />
          </section>
        )}

        {instructorConfirmed && selectedDate && !showInstructorSearch && (
          <section className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Selected date
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">{selectedDate.label}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedDateId(null);
                setSelectedTime(null);
              }}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Change date
            </button>
          </section>
        )}

        {instructorConfirmed && selectedDate && !showInstructorSearch && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Pick a time</h2>
            <div className="grid grid-cols-2 gap-2">
              {mockRescheduleTimeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                    selectedTime === time
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </section>
        )}

        {canConfirm && !showInstructorSearch && (
          <section className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              New lesson summary
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>
            <p className="mt-1 text-sm text-slate-600">{selectedTime}</p>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <InstructorProfileSummary instructor={selectedInstructor} />
            </div>
          </section>
        )}

        {canConfirm && !showInstructorSearch && (
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Confirm reschedule
          </button>
        )}
      </FlowPageContent>
    </>
  );
}
