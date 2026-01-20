export interface LoginInterface {
    AuthFlow: string;
    ClientId: string;
    AuthParameters: {
        USERNAME: string;
        PASSWORD: string;
    };
}

export interface LoginResponseInterface {
    AuthenticationResult: {
        AccessToken: string;
        ExpiresIn: number;
        IdToken: string;
        RefreshToken: string;
        TokenType: string;
    };
    ChallengeParameters: Record<string, string>;
}

export interface LoginException {
    name: string;
    message?: string;
    metadata?: {
        httpStatusCode?: number;
        requestId?: string;
    };
}

export interface LoginResponseUser {
    username: string;
    userId: string;
    signInDetails: {
        loginId: string;
        authFlowType: string;
    };
}