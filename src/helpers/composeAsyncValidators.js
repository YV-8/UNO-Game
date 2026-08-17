import respond from '../logic/monads/respond.js';
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
    (...validators) => (data) => {
        return validators.reduce(
            async (accPromise, validator) => {
                const acc = await accPromise;
                if (acc.isErr()) return acc;

                const res = await validator(acc.value);
                return res.chain((resolvedValue) =>
                    respond.Ok({ ...acc.value, ...resolvedValue })
                );
            },
            Promise.resolve(respond.Ok(data))
        );
    };