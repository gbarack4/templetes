"use client";

import { useEffect, useState } from "react";
import type { AppNotification, NotificationKind } from "../types";
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  CloseIcon,
  CreditCardIcon,
  UserIcon,
} from "./icons";

type NotificationsPanelProps = Readonly<{
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}>;

const notificationIcons: Record<NotificationKind, typeof CalendarIcon> = {
  lesson_reminder: CalendarIcon,
  lesson_booked: CheckCircleIcon,
  payment: CreditCardIcon,
  review: UserIcon,
  promo: BellIcon,
};

function NotificationItem({
  notification,
  onMarkRead,
}: Readonly<{
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}>) {
  const Icon = notificationIcons[notification.kind];

  return (
    <button
      type="button"
      onClick={() => onMarkRead(notification.id)}
      className={`flex w-full gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 ${
        notification.read ? "bg-white" : "bg-slate-50"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-100">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
          {!notification.read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-600">{notification.message}</p>
        <p className="mt-1 text-xs text-slate-400">{notification.timeLabel}</p>
      </div>
    </button>
  );
}

export function NotificationsPanel({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close notifications"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative mx-auto h-full w-full max-w-md">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notifications-title"
          className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
            isVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="notifications-title" className="text-lg font-bold text-slate-900">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount} unread
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                />
              ))}
            </div>
          ) : (
            <div className="px-3 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-100">
                <BellIcon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-900">All caught up</p>
              <p className="mt-1 text-sm text-slate-500">
                You have no notifications right now.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
