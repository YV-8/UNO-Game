// Result monad: envuelve un valor que salió bien (Ok) o mal (Err),
// para que services/validators devuelvan el resultado sin lanzar excepciones
const Result = {
    Ok: (value) => ({
        map: (fn) => Result.Ok(fn(value)),
        mapErr: () => Result.Ok(value),
        value,
        error: null,
        isOk: () => true,
        isErr: () => false,
    }),
    // Envuelve un fallo (típicamente { statusCode, message })
    Err: (error) => ({
        map: () => Result.Err(error),
        mapErr: (fn) => Result.Err(fn(error)),
        value: null,
        error,
        isOk: () => false,
        isErr: () => true,
    }),
};

export default Result;