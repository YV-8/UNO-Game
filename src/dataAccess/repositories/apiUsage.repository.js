import { ApiUsage } from '../models/index.js';

class ApiUsageRepository {
    async create (data)  {
        return await ApiUsage.create(data);
    }

    // Raw rows only — all aggregation (avg/min/max, groupBy, counts) happens
    async findAll (since) {
        const where = since ? { timestamp: { [Op.gte]: since } } : {};
        return  await ApiUsage.findAll({ where, raw: true, order: [['timestamp', 'ASC']] });
    };
};

export default  new ApiUsageRepository();