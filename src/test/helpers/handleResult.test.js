import { handleResult } from '../../../helpers/handleResult.js';
import Respond from '../../../logic/monads/respond.js';

describe('handleResult', () => {
    let res;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    test('responds with the success status and the value on Ok', () => {
        handleResult(res, Respond.Ok({ id: 1 }), 201);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    test('defaults to 200 when no successStatus is given', () => {
        handleResult(res, Respond.Ok({ id: 1 }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('responds with the error statusCode and message on Err', () => {
        handleResult(res, Respond.Err({ statusCode: 404, message: 'Not found' }));
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    test('defaults to 500 when the error has no statusCode', () => {
        handleResult(res, Respond.Err({ message: 'Boom' }));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Boom' });
    });
});