/**testeer with thismock for to use req res next
 * Use the mock request mock response and mock next
 * function to simulate the behavior of Express.js in unit tests. This allows you to test your controller functions without needing to set up an actual server or make HTTP requests. Here's an example of how you can create a mock Express.js environment for testing:
*/

export const mockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    ...overrides,
});

export const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

export const mockNext = () => jest.fn();
