const Result = {
    Ok: (value) => ({
        map: (fn) => Result.Ok(fn(value)),
        mapErr: () => Result.Ok(value),
        value,
        error: null,
        isOk: () => true,
        isErr: () => false,
    }),
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