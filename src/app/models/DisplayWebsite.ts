import {RecursivePage} from "@/app/models/Page";

export interface DisplayWebsite {
    id: number;
    ownerId: number;
    domain: string;
    authToken: string;
    heroImageUrl: string;
    heroTitle: string;
}

export interface InsertableDisplayWebsite {
    ownerId: number;
    domain: string;
    heroImageUrl: string;
    heroTitle: string;
}

export interface RecursiveWebsite {
    id: number;
    ownerId: number;
    domain: string;
    authToken: string;
    heroImageUrl: string;
    heroTitle: string;
    pages: RecursivePage[];
}