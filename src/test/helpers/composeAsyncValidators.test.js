import { composeAsyncValidators } from '../../../src/helpers/composeAsyncValidators.js';
import Respond from '../../../src/logic/monads/respond.js';

describe('composeAsyncValidators', () => {
    test('runs all validators in order and merges their values', async () => {
        const v1 = jest.fn(async (data) => Respond.Ok({ ...data, a: 1 }));
        const v2 = jest.fn(async (data) => Respond.Ok({ ...data, b: 2 }));
        const pipeline = composeAsyncValidators(v1, v2);

        const result = await pipeline({ start: true });

        expect(v1).toHaveBeenCalledWith({ start: true });
        expect(v2).toHaveBeenCalledWith({ start: true, a: 1 });
        expect(result.value).toEqual({ start: true, a: 1, b: 2 });
    });

    test('short-circuits on the first Err and does not call later validators', async () => {
        const v1 = jest.fn(async () => Respond.Err({ statusCode: 400, message: 'fail' }));
        const v2 = jest.fn(async (data) => Respond.Ok(data));
        const pipeline = composeAsyncValidators(v1, v2);

        const result = await pipeline({ start: true });

        expect(v2).not.toHaveBeenCalled();
        expect(result.isErr()).toBe(true);
        expect(result.error).toEqual({ statusCode: 400, message: 'fail' });
    });

    test('returns Ok with the original data when there are no validators', async () => {
        const pipeline = composeAsyncValidators();
        const result = await pipeline({ start: true });
        expect(result.value).toEqual({ start: true });
    });
});