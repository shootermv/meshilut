class gitAPI {
    constructor(loginParams, onSuccess, onFailure) {
        setGlobalVariable( 'gitApi', this );
        onSuccess();
    }
}