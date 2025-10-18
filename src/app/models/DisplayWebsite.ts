import {RecursivePage} from "@/app/models/Page";

export interface DisplayWebsite {
    id: number;
    owner_id: number;
    website_domain: string;
    auth_token: string;
    hero_image_url: string;
    hero_title: string;
}

export interface InsertableDisplayWebsite {
    owner_id: number;
    website_domain: string;
    hero_image_url?: string;
    hero_title: string;
}

export interface RecursiveWebsite {
    id: number;
    owner_id: number;
    website_domain: string;
    auth_token: string;
    hero_image_url: string;
    hero_title: string;
    pages: RecursivePage[];
}