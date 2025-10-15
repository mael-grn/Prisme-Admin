export interface SubCategory {
    id: number;
    categoryId: number;
    name: string;
}

export interface InsertableSubCategory {
    categoryId: number;
    name: string;
}