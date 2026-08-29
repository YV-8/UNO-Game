/**
 * wraps a controller so every call to it is logged
*'finish' .event, that is, after the response
*was sent
*the trace never delays a response
* "fire and forget": if apiUsageRepository.create fails
* we log it to the console
* endpointAccess uses req.route + req.baseUrl
* is able: falls back to the raw route
* in cases where req.route has not yet completed, it goes directly to processing as an error
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