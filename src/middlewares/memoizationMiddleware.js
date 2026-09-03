export const memoizationMiddleware = ({ max = 50, maxAge = 60000 } = {}) => {
    let cache = [];

    /**Unique -> anything view unaffiliated date */
    const buildCacheKey = (req) => {
        const bodyKey = JSON.stringify(req.body ?? {});
        const userId = req.player?.id ?? 'anonymous';
        return `${req.method}:${req.originalUrl}:${bodyKey}:${userId}`;
    };

    /** execute each request que pasa por esta instancia,
     * never setInterval -- delete */
    const removeExpiredEntries = (now) => {
        const initialLength = cache.length;
        cache = cache.filter((entry) => now - entry.lastAccessedAt < maxAge);
        const removedCount = initialLength - cache.length;
        if (removedCount > 0) {
            console.log(`Memoization: ${removedCount} intput to expire delete, Actual cache: ${cache.length}`);
        }
    };

    /** Limit, use reduce como acumulator to find index lastAccessedAt and delete */
    const evictLeastRecentlyUsed = () => {
        if (cache.length < max) return;
        const oldestIndex = cache.reduce(
            (oldestIdx, entry, idx) => (entry.lastAccessedAt < cache[oldestIdx].lastAccessedAt ? idx : oldestIdx),
            0
        );
        const evictedList = cache.splice(oldestIndex, 1);
        const evicted = evictedList[0];
        console.log(`Top limit (${max}) input LRU delete: ${evicted?.key}`);
    };

    const findEntry = (key) => cache.find((entry) => entry.key === key);

    const storeEntry = (key, status, body, now) => {
        evictLeastRecentlyUsed();
        cache.push({ key, status, body, lastAccessedAt: now });
    };

    return (req, res, next) => {
        const now = Date.now();
        removeExpiredEntries(now);

        const key = buildCacheKey(req);
        const cached = findEntry(key);

        if (cached) {
            cached.lastAccessedAt = now;
            return res.status(cached.status).json(cached.body);
        }
        console.log(`[Memoization] [CACHE MISS] Processed request for: ${key}`);

        /**monkey-patching res.json*/
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode < 400) {
                storeEntry(key, res.statusCode, body, Date.now());
            }
            return originalJson(body);
        };

        next();
    };
};