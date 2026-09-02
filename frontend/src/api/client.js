const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const buildHeaders = (token, hasBody) => {
    const headers = {};
    if (hasBody) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

const request = async (path, { method = 'GET', body, token } = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: buildHeaders(token, body !== undefined),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : null;

    if (!res.ok) {
        const message = data?.error || data?.message || `Request failed with status ${res.status}`;
        throw new Error(message);
    }
    return data;
};

export const apiClient = {
    get: (path, token) => request(path, { method: 'GET', token }),
    post: (path, body, token) => request(path, { method: 'POST', body, token }),
    put: (path, body, token) => request(path, { method: 'PUT', body, token }),
    delete: (path, token) => request(path, { method: 'DELETE', token }),
};

export default apiClient;
