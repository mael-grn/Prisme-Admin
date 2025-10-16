export interface Subcategory {
    id: number;
    category_id: number;
    name: string;
}

export interface InsertableSubcategory {
    category_id: number;
    name: string;
}