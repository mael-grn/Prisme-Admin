import {RecursiveSection} from "@/app/models/Section";

export interface Page {
    id: number;
    path: string;
    website_id: number;
    icon_svg?: string;
    title: string;
    description?: string;
    position: number;
}

export interface InsertablePage {
    path: string;
    website_id: number;
    icon_svg?: string;
    title: string;
    description?: string;
}

export interface RecursivePage {
    id: number;
    path: string;
    website_id: number;
    sections: RecursiveSection[];
    icon_svg?: string;
    title: string;
    description?: string;
    position: number;
}