/**
 *Return a value => ok / err
 * with the value  to pass "map, chain and mapErr"
 * "chain  think fn = function get a result for its"
 * in this case error:null for is a respond ok  for it;s isOk true or isError false
 * in the other case de value:null  error create and isOk: false isErr: true
 */
const Respond = {
    Ok: (value) => ({
        map: (fn) => Respond.Ok(fn(value)),
        chain: (fn) => fn(value),
        mapErr: () => Respond.Ok(value),
        value,
        error: null,
        isOk: () => true,
        isErr: () => false,
    }),
    Err: (error) => ({
        map: () => Respond.Err(error),
        chain: () => Respond.Err(error),
        mapErr: (fn) => Respond.Err(fn(error)),
        value: null,
        error,
        isOk: () => false,
        isErr: () => true,
    }),
};

export default Respond;
