import Respond from '../../../logic/monads/respond.js';

describe('Respond monad', () => {
    describe('Ok', () => {
        test('isOk true, isErr false', () => {
            const r = Respond.Ok(5);
            expect(r.isOk()).toBe(true);
            expect(r.isErr()).toBe(false);
            expect(r.value).toBe(5);
            expect(r.error).toBeNull();
        });

        test('map transforms the value and stays Ok', () => {
            const r = Respond.Ok(5).map((v) => v * 2);
            expect(r.value).toBe(10);
            expect(r.isOk()).toBe(true);
        });

        test('chain calls the function with the value', () => {
            const r = Respond.Ok(5).chain((v) => Respond.Ok(v + 1));
            expect(r.value).toBe(6);
        });

        test('mapErr is a no-op on Ok', () => {
            const r = Respond.Ok(5).mapErr(() => ({ statusCode: 500 }));
            expect(r.value).toBe(5);
            expect(r.isOk()).toBe(true);
        });
    });

    describe('Err', () => {
        test('isErr true, isOk false', () => {
            const r = Respond.Err({ statusCode: 400, message: 'Bad' });
            expect(r.isErr()).toBe(true);
            expect(r.isOk()).toBe(false);
            expect(r.value).toBeNull();
            expect(r.error).toEqual({ statusCode: 400, message: 'Bad' });
        });

        test('map is a no-op on Err (short-circuits)', () => {
            const r = Respond.Err({ statusCode: 400 }).map((v) => v * 2);
            expect(r.isErr()).toBe(true);
            expect(r.error).toEqual({ statusCode: 400 });
        });

        test('chain is a no-op on Err (short-circuits)', () => {
            const fn = jest.fn();
            const r = Respond.Err({ statusCode: 400 }).chain(fn);
            expect(fn).not.toHaveBeenCalled();
            expect(r.isErr()).toBe(true);
        });

        test('mapErr transforms the error', () => {
            const r = Respond.Err({ statusCode: 400 }).mapErr((e) => ({ ...e, message: 'wrapped' }));
            expect(r.error).toEqual({ statusCode: 400, message: 'wrapped' });
        });
    });
});