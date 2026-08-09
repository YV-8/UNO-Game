import Result from '../logic/monads/result.js';

export const composeAsyncValidators =
(...validators) =>
    async(data) =>{
        const result = await validators.reduce(
            async(accPromise, validator) =>{
                const acc = await accPromise;
                if(acc.isErr()) return acc;

                const res = await validator(acc.value);
                return res.isErr() ? res : Result.Ok({...acc.value, ...res.value});
            },
            Promise.resolve(Result.Ok(data))
        );
        return result;
    };