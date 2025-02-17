"use server";

import {login} from "@/app/controller/loginController";
import {neon} from '@neondatabase/serverless';
import {deleteElement, getElementsForSection} from "@/app/controller/elementController";
const sql = neon(`${process.env.DATABASE_URL}`);

export interface Section {
    id: number;
    title: string;
    page_id: number;
    position: number;
    type_id: number;
}

export interface SectionType {
    id: number;
    name: string;
}

export async function getSectionsForPage(id: number) : Promise<Section[]> {
    await login(null);
    const result = await sql('SELECT * FROM section WHERE page_id = $1 ORDER BY position', [id]);
    return result as Section[];
}

export async function getSectionTypes() : Promise<SectionType[]> {
    await login(null);
    const result = await sql('SELECT * FROM section_type');
    return result as SectionType[];
}

export async function getSectionType(id: number) : Promise<SectionType | null> {
    await login(null);
    const result = await sql('SELECT * FROM section_type WHERE id = $1', [id]);
    if (result.length === 0) {
        return null;
    } else {
        return result[0] as SectionType;
    }
}

export async function getSection(id: number) : Promise<Section | null>  {
    const result = await sql('SELECT * FROM section WHERE id = $1', [id]);
    if (result.length === 0) {
        return null;
    } else {
        const section = result.find(sect => sect.id === id);
        return section as Section;
    }
}

export async function addSection(pageId: number, title: string, type: number) : Promise<void> {
    await login(null);
    let position;
    const sections = await getSectionsForPage(pageId);
    if (sections.length === 0) {
        position = 1;
    } else {
        position = sections[sections.length - 1].position + 1;
    }
    await sql('INSERT INTO section (title, page_id, position, type_id) VALUES ($1, $2, $3, $4)', [title, pageId, position, type]);
}

export async function updateSection(id: number, newTitle: string) : Promise<void> {
    await login(null);
    await sql('UPDATE section SET title = $1 WHERE id = $2', [newTitle, id]);

}

export async function deleteSection(id: number) : Promise<boolean> {
    await login(null);
    const elements = await getElementsForSection(id);
    for (const elem of elements) {
        await deleteElement(elem.id);
    }
    await sql('DELETE FROM section_tag WHERE section_id = $1', [id]);
    const result = await sql('DELETE FROM section WHERE id = $1', [id]);
    return result.length !== 0;
}
