type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

export function checkRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    if (!current && buckets.size >= MAX_BUCKETS) {
      pruneExpiredBuckets(now);

      if (buckets.size >= MAX_BUCKETS) {
        evictOldestBucket();
      }
    }

    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  const nextBucket = {
    ...current,
    count: current.count + 1
  };

  buckets.set(key, nextBucket);

  return { allowed: true, remaining: Math.max(0, limit - nextBucket.count) };
}

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function evictOldestBucket() {
  const oldestKey = buckets.keys().next().value as string | undefined;

  if (oldestKey) {
    buckets.delete(oldestKey);
  }
}
