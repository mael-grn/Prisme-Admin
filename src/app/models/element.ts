export interface Element {
    id: number;
    section: number;
    type: ElementType;
    position: number;
    content: string;
}

export interface InsertableElement {
    section_id: number;
    type_id: number;
    position: number;
    content: string;
}

export interface ElementType {
    id: number;
    name: string;
}
