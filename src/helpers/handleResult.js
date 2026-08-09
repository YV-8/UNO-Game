export const handleResult = (res, result, successStatus = 200) => {
    if (result.isErr()) {
        const { statusCode = 500, message } = result.error;
        return res.status(statusCode).json({ error:message });
    }
    return res.status(successStatus).json(result.value);
};