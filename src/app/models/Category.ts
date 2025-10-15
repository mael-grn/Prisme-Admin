import {SubCategory} from "@/app/models/SubCategory";

export interface Category {
    id: number;
    name: string;
}

export interface InsertableCategory {
    name: string;
}

export interface RecursiveCategory {
    id: number;
    name: string;
    subCategories: SubCategory[];
}