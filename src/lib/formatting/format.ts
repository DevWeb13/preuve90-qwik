import { PRODUCT_CONFIG, SELECTION_LABELS, SELECTION_SHORT_LABELS } from "~/config/product";
import type { PredictionSelection } from "~/types/prediction";

const dateTimeFormatter = new Intl.DateTimeFormat(PRODUCT_CONFIG.locale, {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: PRODUCT_CONFIG.timezone,
});

const shortDateTimeFormatter = new Intl.DateTimeFormat(PRODUCT_CONFIG.locale, {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: PRODUCT_CONFIG.timezone,
});

const calendarDateFormatter = new Intl.DateTimeFormat(PRODUCT_CONFIG.locale, {
  dateStyle: "long",
  timeZone: PRODUCT_CONFIG.timezone,
});

const moneyFormatter = new Intl.NumberFormat(PRODUCT_CONFIG.locale, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat(PRODUCT_CONFIG.locale, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatDateTime = (value: string) => dateTimeFormatter.format(new Date(value));
export const formatShortDateTime = (value: string) =>
  shortDateTimeFormatter.format(new Date(value));
export const formatCalendarDate = (dateKey: string) =>
  calendarDateFormatter.format(new Date(`${dateKey}T12:00:00Z`));
export const formatMoney = (cents: number) => moneyFormatter.format(cents / 100);
export const formatSignedMoney = (cents: number) =>
  `${cents > 0 ? "+" : ""}${moneyFormatter.format(cents / 100)}`;
export const formatPercent = (value: number | null) =>
  value === null ? "—" : percentFormatter.format(value);
export const getSelectionLabel = (selection: PredictionSelection) => SELECTION_LABELS[selection];
export const getSelectionShortLabel = (selection: PredictionSelection) =>
  SELECTION_SHORT_LABELS[selection];
