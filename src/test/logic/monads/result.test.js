import Result from '../../Logic/Monads/result.js';

describe('Result Monad', () => {
    describe('Result.Ok', () => {
        test('base Ok properties and methods', () => {
            const ok = Result.Ok(42);
            expect(ok.isOk()).toBe(true);
            expect(ok.isErr()).toBe(false);
            expect(ok.value).toBe(42);
            expect(ok.error).toBeNull();
        });

        test('Ok.map returns a new Ok with all methods fully functional', () => {
            const ok = Result.Ok(10);
            const mapped = ok.map((n) => n * 2);

            expect(mapped.value).toBe(20);
            expect(mapped.error).toBeNull();
            expect(mapped.isOk()).toBe(true);
            expect(mapped.isErr()).toBe(false);

            // Fuerza la ejecución de los métodos en la nueva instancia generada por map
            expect(mapped.map((n) => n + 1).value).toBe(21);
            expect(mapped.mapErr(() => 'ignored').value).toBe(20);
        });

        test('Ok.mapErr returns a new Ok with all methods fully functional', () => {
            const ok = Result.Ok(10);
            const mappedErr = ok.mapErr((e) => `wrapped: ${e}`);

            expect(mappedErr.value).toBe(10);
            expect(mappedErr.error).toBeNull();
            expect(mappedErr.isOk()).toBe(true);
            expect(mappedErr.isErr()).toBe(false);

            // Fuerza la ejecución de la función lambda de la línea 6 y valida la nueva instancia
            expect(mappedErr.map((n) => n + 5).value).toBe(15);
            expect(mappedErr.mapErr(() => 'ignored').value).toBe(10);
        });
    });

    describe('Result.Err', () => {
        test('base Err properties and methods', () => {
            const err = Result.Err('boom');
            expect(err.isOk()).toBe(false);
            expect(err.isErr()).toBe(true);
            expect(err.value).toBeNull();
            expect(err.error).toBe('boom');
        });

        test('Err.map returns a new Err with all methods fully functional', () => {
            const err = Result.Err('boom');
            const mapped = err.map((n) => n * 10);

            expect(mapped.value).toBeNull();
            expect(mapped.error).toBe('boom');
            expect(mapped.isOk()).toBe(false);
            expect(mapped.isErr()).toBe(true);

            // Fuerza la ejecución de la función lambda de la línea 14 y valida la nueva instancia
            expect(mapped.map((n) => n + 1).error).toBe('boom');
            expect(mapped.mapErr((e) => `new: ${e}`).error).toBe('new: boom');
        });

        test('Err.mapErr returns a new Err with all methods fully functional', () => {
            const err = Result.Err('boom');
            const mappedErr = err.mapErr((e) => `wrapped: ${e}`);

            expect(mappedErr.value).toBeNull();
            expect(mappedErr.error).toBe('wrapped: boom');
            expect(mappedErr.isOk()).toBe(false);
            expect(mappedErr.isErr()).toBe(true);

            // Fuerza la ejecución de las líneas 15 a 18 en las instancias retornadas
            expect(mappedErr.map((n) => n + 1).error).toBe('wrapped: boom');
            expect(mappedErr.mapErr((e) => `double: ${e}`).error).toBe('double: wrapped: boom');
        });
    });
});