export interface RegisterInterface {
    ClientId: string;
    Username: string;
    Password: string;
}

export interface RegisterResponseInterface {
    CodeDeliveryDetails: {
        AttributeName: string;
        DeliveryMedium: string;
        Destination: string;
    };
    Session: string;
    UserConfirmed: boolean;
    UserSub: string;
}

export interface UsernameExistsException {
    __type: string;
    message: string;
}