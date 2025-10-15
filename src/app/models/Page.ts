import {RecursiveSection} from "@/app/models/Section";

export interface Page {
    id: number;
    path: string;
    websiteId: number;
}

export interface InsertablePage {
    path: string;
    websiteId: number;
}

export interface RecursivePage {
    id: number;
    path: string;
    websiteId: number;
    sections: RecursiveSection[];
}