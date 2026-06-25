import { z } from "zod";

// ─── Transport enums ────────────────────────────────────────────────────────
// itinerarySchema allows "walk" (matches DB itinerarySchema in tour.model.js)
// tourSchema does NOT allow "walk" (matches tourSchema in tour.model.js)

const ITINERARY_TRANSPORT = z.enum(["bus", "car", "plane", "train", "ship", "walk", "mixed"]);
const TOUR_TRANSPORT = z.enum(["bus", "car", "plane", "train", "ship", "mixed"]);
const SESSION = z.enum(["morning", "afternoon", "evening", "night"]);

// ─── Activity ───────────────────────────────────────────────────────────────
const ActivitySchema = z.object({
  session: SESSION.default("morning"),
  time: z.string().default(""),
  activityName: z.string().default(""),
  attractionName: z.string().default(""),
  note: z.string().default(""),
});

// ─── Itinerary Day ──────────────────────────────────────────────────────────
const ItineraryDaySchema = z.object({
  day: z.number().int().min(1).default(1),
  title: z.string().default(""),
  content: z.string().default(""),
  transport: ITINERARY_TRANSPORT.default("mixed"),
  activities: z.array(ActivitySchema).default([]),
});

// ─── Confidence scores (0–1) ─────────────────────────────────────────────────
const ConfidenceSchema = z.object({
  name: z.number().min(0).max(1).default(0),
  departurePoint: z.number().min(0).max(1).default(0),
  destinationName: z.number().min(0).max(1).default(0),
  priceAdult: z.number().min(0).max(1).default(0),
  itinerary: z.number().min(0).max(1).default(0),
});

// ─── Main LLM extraction schema ─────────────────────────────────────────────
export const TourExtractionSchema = z.object({
  name: z.string().default(""),
  departurePoint: z.string().default(""),
  destinationName: z.string().default(""),
  duration: z.string().default(""),
  priceAdult: z.number().min(0).default(0),
  priceChild: z.number().min(0).default(0),
  transport: TOUR_TRANSPORT.default("mixed"),
  description: z.string().default(""),
  categories: z.array(z.string()).default([]),
  itinerary: z.array(ItineraryDaySchema).default([]),
  confidence: ConfidenceSchema.default({}),
  missingFields: z.array(z.string()).default([]),
});

/** @typedef {import("zod").infer<typeof TourExtractionSchema>} TourExtraction */
