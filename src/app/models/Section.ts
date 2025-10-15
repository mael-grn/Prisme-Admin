import {RecursiveCategory} from "@/app/models/Category";
import {Element} from "@/app/models/Element";

export interface Section {
    id: number;
    pageId: number;
    position: number;
    sectionType: number;
}

export interface InsertableSection {
    pageId: number;
    position: number;
    sectionType: number;
}

export interface RecursiveSection {
    id: number;
    pageId: number;
    position: number;
    sectionType: number;
    categories: RecursiveCategory[];
    elements: Element[];
}