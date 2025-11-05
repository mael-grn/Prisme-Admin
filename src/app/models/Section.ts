import {RecursiveCategory} from "@/app/models/Category";
import {Element} from "@/app/models/Element";

export interface Section {
    id: number;
    title: string;
    page_id: number;
    position: number;
    section_type: string;
}

export interface InsertableSection {
    page_id: number;
    title: string;
    position: number;
    section_type: string;
}

export interface RecursiveSection {
    id: number;
    title: string;
    page_id: number;
    position: number;
    section_type: string;
    categories: RecursiveCategory[];
    elements: Element[];
}