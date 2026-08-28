import _ from 'lodash';
export const statsService = ({ apiUsageRepository, respond }) => {
    /**project, so a tiny reduce-based groupBy -> used by every stat below*/
    
    const getRequest = async () => {
        const rows = await apiUsageRepository.findAll();

        const byEndpoint = _.groupBy(rows, 'endpointAccess');
        const breakdown = Object.fromEntries(
            Object.entries(byEndpoint).map(([endpoint, endpointRows]) => {
                const byMethod = _.groupBy(endpointRows, (r) => r.requestMethod);
                const methodCounts = Object.fromEntries(
                    Object.entries(byMethod).map(([method, methodRows]) => [method, methodRows.length])
                );
                return [endpoint, methodCounts];
            })
        );

        return respond.Ok({
            total_requests: rows.length,
            breakdown,
        });
    };

    const getResponseTime = async () => {
        const rows = await apiUsageRepository.findAll();
        const byEndpoint = _.groupBy(rows, (r) => r.endpointAccess);

        const stats = Object.fromEntries(
            Object.entries(byEndpoint).map(([endpoint, endpointRows]) => {
                const times = endpointRows.map((r) => r.responseTime);
                const sum = times.reduce((acc, t) => acc + t, 0);
                return [
                    endpoint,
                    {
                        avg: Math.round(sum / times.length),
                        min: Math.min(...times),
                        max: Math.max(...times),
                    },
                ];
            })
        );

        return respond.Ok(stats);
    };

    const getStatusCode = async () => {
        const rows = await apiUsageRepository.findAll();
        const counts = _.countBy(rows, 'statusCode');

        return respond.Ok(counts);
    };

    const getPopularEndpoints = async () => {
        const rows = await apiUsageRepository.findAll();
        const byEndpoint = _.groupBy(rows, (r) => r.endpointAccess);

        const ranked = Object.entries(byEndpoint)
            .map(([endpoint, endpointRows]) => ({ endpoint, request_count: endpointRows.length }))
            .sort((a, b) => b.request_count - a.request_count);

        if (ranked.length === 0) {
            return respond.Ok({ most_popular: null, request_count: 0, ranking: [] });
        }

        const [top] = ranked;
        return respond.Ok({
            most_popular: top.endpoint,
            request_count: top.request_count,
            ranking: ranked,
        });
    };

    return {getRequest,getResponseTime,getStatusCode,getPopularEndpoints,};
};