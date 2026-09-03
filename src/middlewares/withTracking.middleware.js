/**
 * wraps a controller so every call to it is logged
 *
 * Design notes:
 * - Timing uses process.hrtime.bigint() (monotonic, not wall-clock) so the
 *   measurement can't be skewed by system clock adjustments.
 * - The log write happens on the 'finish' event, i.e. *after* the response
 *   has already been flushed to the client — tracking never delays a reply.
 * - The log write is fire-and-forget: if apiUsageRepository.create fails,
 *   we log to console and swallow it. A broken stats pipe should never be
 *   able to take down gameplay.
 * - endpointAccess uses req.route + req.baseUrl when available (the actual
 *   route pattern, e.g. "/api/games/:id/play") and falls back to the raw
 *   path for cases where req.route isn't populated yet (rare, e.g. errors
 *   before routing resolves).
 */
export const trackingMiddleware = ({ apiUsageRepository } = {}) => {
    return (req, res, next) => {
        if (!apiUsageRepository) {
            return next();
        }

        const startedAt = process.hrtime.bigint();

        res.on('finish', () => {
            const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
            const endpointAccess = req.route
                ? `${req.baseUrl}${req.route.path}`
                : req.originalUrl.split('?')[0];

            apiUsageRepository
                .create({
                    endpointAccess,
                    requestMethod: req.method,
                    statusCode: res.statusCode,
                    responseTime: Math.round(elapsedMs),
                    timestamp: new Date(),
                    userId: req.player?.id ?? null,
                })
                .catch((err) => {
                    console.error('[apiTracking] failed to persist usage log:', err.message);
                });
        });

        next();
    };
};

export default trackingMiddleware;