export default {
    issuer:                           process.env.NEXTAUTH_URL,
    authorization_endpoint:           process.env.NEXTAUTH_URL + '/api/oauth/authorize',
    token_endpoint:                   process.env.NEXTAUTH_URL + '/api/oauth/token',
    response_types_supported:         [ 'code' ],
    grant_types_supported:            [ 'authorization_code', 'refresh_token' ],
    code_challenge_methods_supported: [ 'S256' ]
};