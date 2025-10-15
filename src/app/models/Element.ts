export interface Element {
    id: number;
    sectionId: number;
    type: string;
    position: number;
    content: string;
}

export interface InsertableElement {
    sectionId: number;
    type: string;
    position: number;
    content: string;
}
