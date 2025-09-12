"use server";

import {neon} from '@neondatabase/serverless';
import {deleteSection, getSectionsForPage} from "@/app/service/sectionService";
const sql = neon(`${process.env.DATABASE_URL}`);

export interface Page {
    id: number;
    title: string;
}

export async function getPages() : Promise<Page[]> {
    const result = await sql('SELECT * FROM page');
    return result as Page[];
}

export async function getPage(id: number) : Promise<Page | null>  {
    const result = await sql('SELECT * FROM page WHERE id = $1', [id]);
    if (result.length === 0) {
        return null;
    } else {
        return result[0] as Page;
    }
}

export async function addPage(title: string) : Promise<void> {
    await sql('INSERT INTO page (title) VALUES ($1)', [title]);
}

export async function updatePage(id: number, title: string) : Promise<Page | null> {
    const result = await sql('UPDATE page SET title = $1 WHERE id = $2', [title, id]);
    if (result.length === 0) {
        return null;
    } else {
        return result[0] as Page;
    }
}

export async function deletePage(id: number) : Promise<Page | null> {
    const sections = await getSectionsForPage(id);
    for (const section of sections) {
        await deleteSection(section.id);
    }
    const result = await sql('DELETE FROM page WHERE id = $1', [id]);
    if (result.length === 0) {
        return null;
    } else {
        return result[0] as Page;
    }
}
