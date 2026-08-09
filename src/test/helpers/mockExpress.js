export const mockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    player: {},
    ...overrides,
});

export const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};