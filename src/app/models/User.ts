export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

export interface InsertableUser {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}