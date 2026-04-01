import http from 'k6/http';

export function sendGraphQLRequest(url, query, variables, token, storeId) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-store-id': storeId,
    };

    const payload = JSON.stringify({
        query: query,
        variables: variables,
    });

    return http.post(url, payload, { headers: headers });
}
