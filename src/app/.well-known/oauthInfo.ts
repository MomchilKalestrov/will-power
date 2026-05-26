export default {
    issuer:                           process.env.URL,
    authorization_endpoint:           process.env.URL + '/api/oauth/authorize',
    token_endpoint:                   process.env.URL + '/api/oauth/token',
    response_types_supported:         [ 'code' ],
    grant_types_supported:            [ 'authorization_code', 'refresh_token' ],
    code_challenge_methods_supported: [ 'S256' ]
};