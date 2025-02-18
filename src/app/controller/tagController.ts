"use server";

import {neon} from '@neondatabase/serverless';
const sql = neon(`${process.env.DATABASE_URL}`);

export interface Tag {
    id: number;
    name: string;
}

export async function getTags() : Promise<Tag[]> {
    const result = await sql('SELECT * FROM tag');
    return result as Tag[];
}

export async function getTagId(name: string) : Promise<number | null> {
    const tags = await getTags();
    if (tags.length === 0) {
        return null;
    } else {
        const tag = tags.find(t => t.name === name);
        return tag?.id as number;
    }
}

export async function getTagsForSection(id: number) : Promise<Tag[]> {
    const result = await sql('SELECT * FROM section_tag WHERE section_id = $1', [id]);
    let allTags = await getTags() as Tag[];
    allTags = allTags.filter(tag => result.some(sectionTag => tag.id === sectionTag.tag_id));
    return allTags as Tag[];
}

export async function addTagToSection(sectionId: number, tagId: number) : Promise<boolean> {
    const result = await sql('INSERT INTO section_tag (section_id, tag_id) VALUES ($1, $2)', [sectionId, tagId]);
    return result.length !== 0;
}

export async function removeTagFromSection(sectionId: number, tagId: number) : Promise<boolean> {
    const result = await sql('DELETE FROM section_tag WHERE section_id = $1 AND tag_id = $2', [sectionId, tagId]);
    return result.length !== 0;
}

export async function getTag(id: number) : Promise<Tag | null>  {
    const tags = await getTags();
    if (tags.length === 0) {
        return null;
    } else {
        const tag = tags.find(t => t.id === id);
        return tag as Tag;
    }
}

export async function addTag(name: string) : Promise<void> {
    await sql('INSERT INTO tag (name) VALUES ($1)', [name]);
}

export async function deleteTag(id: number) : Promise<boolean> {
    const result = await sql('DELETE FROM tag WHERE id = $1', [id]);
    return result.length !== 0;
}