"use server";

import {neon} from '@neondatabase/serverless';
import {del} from "@vercel/blob";
const sql = neon(`${process.env.DATABASE_URL}`);

export interface ElementBd {
    id: number;
    section_id: number;
    type_id: number;
    position: number;
    content: string;
}

export interface ElementType {
    id: number;
    name: string;
}


export async function getTypes() : Promise<ElementType[]> {
    const result = await sql('SELECT * FROM element_type');
    return result as ElementType[];
}

export async function getType(id: number) : Promise<ElementType | null> {
    const result = await sql('SELECT * FROM element_type WHERE id = $1', [id]);
    if (result.length === 0) {
        return null;
    } else {
        return result[0] as ElementType;
    }
}

export async function getElementsForSection(id: number) : Promise<ElementBd[]> {
    const result = await sql('SELECT * FROM element WHERE section_id = $1 ORDER BY position', [id]);
    return result as ElementBd[];
}

export async function getElements() : Promise<ElementBd[]> {
    const result = await sql('SELECT * FROM element');
    return result as ElementBd[];
}

export async function getElement(id: number) : Promise<ElementBd | null>  {
    const result = await sql('SELECT * FROM element WHERE id = $1', [id]);
    if (result.length === 0) {
        return null;
    } else {
        const element = result.find(elem => elem.id === id);
        return element as ElementBd;
    }
}

export async function addElement(sectionId: number, typeId: number, content: string) : Promise<void> {
    let position;
    const elements = await getElementsForSection(sectionId);
    if (elements.length === 0) {
        position = 1;
    } else {
        position = elements[elements.length - 1].position + 1;
    }
    await sql('INSERT INTO element (section_id, type_id, position, content) VALUES ($1, $2, $3, $4)', [sectionId, typeId, position, content]);
}

export async function updateElement(id: number, content: string) : Promise<ElementBd | null> {
    const elem = await getElement(id);
    if (!elem) {
        throw "Element not found";
    }
    const type = await getType(elem.type_id);
    if (!type) {
        throw "Type not found";
    }

    if (type.name === 'image') {
        await del(elem.content, {
            token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
        });
    }
    await sql('UPDATE element SET content = $1 WHERE id = $2', [content, id]);
    return getElement(id);
}

export async function changeElementPosition(id: number, newPosition: number) : Promise<void> {
    await sql('UPDATE element SET position = $1 WHERE id = $2', [newPosition, id]);
}

export async function deleteElement(id: number) : Promise<boolean> {
    const elem = await getElement(id);
    if (!elem) {
        throw "Element not found";
    }
    const type = await getType(elem.type_id);
    if (!type) {
        throw "Type not found";
    }

    if (type.name === 'image') {
        await del(elem.content, {
            token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
        });
    }

    const result = await sql('DELETE FROM element WHERE id = $1', [id]);
    return result.length !== 0;
}

