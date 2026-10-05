import { faker } from "@faker-js/faker";

faker.seed(20260721);

export function resetSeed(): void {
  faker.seed(20260721);
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function pickMany<T>(arr: readonly T[], max: number): T[] {
  const count = Math.min(max, arr.length);
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}

export function id(prefix: string): string {
  return `${prefix}_${faker.string.alphanumeric(12).toLowerCase()}`;
}

export function isoDate(daysAgo?: number, addSeconds = 0): string {
  const date = daysAgo != null
    ? faker.date.recent({ days: Math.max(1, daysAgo) })
    : faker.date.recent({ days: 30 });
  date.setSeconds(date.getSeconds() + addSeconds);
  return date.toISOString();
}

export function isoFuture(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 20
): { items: T[]; total: number; page: number; pageSize: number; hasNext: boolean; hasPrev: boolean } {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    total,
    page,
    pageSize,
    hasNext: start + pageSize < total,
    hasPrev: start > 0,
  };
}

export function delay(min = 100, max = 320): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lines(start: number, end: number, fn: (i: number) => string): string[] {
  return Array.from({ length: end - start + 1 }, (_, i) => fn(start + i));
}

export { faker };
