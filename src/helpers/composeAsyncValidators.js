import Result from '../logic/monads/result.js';
/**Encadena validadores async en un solo pipeline.
 * Cada validador recibe la data acumula -> da un Result
 * - Si alguno devuelve Err,
 *  la cadena corta ahí mismo
 *   Err es lo que recibe  a composeAsyncValidators
 * - Si devuelve Ok,
 *  su value se mergea con la data acumulada ->
 * siguientes validadores ven los campos que agregaron los anteriores
 * validateScoreExists agrega `existingScore`, y el siguiente paso
 * de validateUpdateScore puede leerlo
*/
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