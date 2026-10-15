import { useState } from "react";
export function useStored<T>(
  key: string,
  initial: T,
  valid: (v: unknown) => v is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      return valid(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });
  const [error, setError] = useState(false);
  function save(next: T) {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setError(false);
    } catch {
      setError(true);
    }
  }
  return [value, save, error] as const;
}
export type Metrics = {
  compliance: number;
  braking: number;
  acceleration: number;
  patterns: number;
};
export const initialMetrics: Metrics = {
  compliance: 82,
  braking: 78,
  acceleration: 80,
  patterns: 85,
};
export function score(m: Metrics) {
  return Math.round(
    m.compliance * 0.4 +
      m.braking * 0.2 +
      m.acceleration * 0.15 +
      m.patterns * 0.25,
  );
}
export function simulate(
  m: Metrics,
  event: "steady" | "speed" | "brake" | "accelerate",
): Metrics {
  const next = { ...m };
  if (event === "steady") {
    for (const key of Object.keys(next) as (keyof Metrics)[]) next[key] += 4;
  }
  if (event === "speed") {
    next.compliance -= 14;
    next.patterns -= 4;
  }
  if (event === "brake") {
    next.braking -= 18;
    next.patterns -= 2;
  }
  if (event === "accelerate") {
    next.acceleration -= 18;
    next.patterns -= 2;
  }
  for (const key of Object.keys(next) as (keyof Metrics)[])
    next[key] = Math.max(0, Math.min(100, next[key]));
  return next;
}
export const isMetrics = (v: unknown): v is Metrics =>
  !!v &&
  typeof v === "object" &&
  Object.keys(initialMetrics).every(
    (k) =>
      typeof (v as Metrics)[k as keyof Metrics] === "number" &&
      Number.isFinite((v as Metrics)[k as keyof Metrics]) &&
      (v as Metrics)[k as keyof Metrics] >= 0 &&
      (v as Metrics)[k as keyof Metrics] <= 100,
  );
export const isStrings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
export function inPhilippines(lat: number, lon: number) {
  return lat >= 4.3 && lat <= 21.3 && lon >= 116 && lon <= 127;
}
