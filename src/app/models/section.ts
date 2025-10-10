import {Page} from "@/app/models/page";
import {Tag} from "@/app/models/tag";

export interface Section {
    id: number;
    title: string;
    page: Page;
    position: number;
    type: SectionType;
    tags: Tag[];
    is_canada: boolean;
}

export interface InsertableSection {
    title: string;
    page_id: number;
    position: number;
    type_id: number;
    is_canada: boolean;
}

export interface SectionType {
    id: number;
    name: string;
}