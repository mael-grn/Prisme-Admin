import {InsertableTmdbMagnetLink} from "@/app/models/tmdbMagnetLink";
import {Movie} from "@/app/models/movie";
import axios, {AxiosError} from "axios";
import { JSDOM } from "jsdom";

const ENDPOINTS = [
    "https://tpirbay.site/",
    "https://tpirbay.top/",
    "https://tpirbay.xyz/"
];

export async function getPirateBayMagnetLinks(media: Movie): Promise<InsertableTmdbMagnetLink[]> {

    return await extractLinksFromEndpoint(0, media);


}

async function extractLinksFromEndpoint(endpointIndex: number, media: Movie) : Promise<InsertableTmdbMagnetLink[]> {

    const newTitle = media.title
        .toLowerCase()
        .normalize("NFD")

    try {
        const fetchedMoviePage = await axios.get(`${ENDPOINTS[endpointIndex]}/search/${newTitle}/1/99/0`)

        const moviePageDom = new JSDOM(fetchedMoviePage.data);
        const moviePage = moviePageDom.window.document;
        const links = moviePage.querySelectorAll("tbody>tr");

        if (links.length <= 0) {
            return [];
        }

        const resultLinks: InsertableTmdbMagnetLink[] = []

        for (const link of links) {
            const torrentTitle = link.querySelector(".detName a")?.textContent?.toLowerCase() ?? null;
            if (torrentTitle && (torrentTitle.includes(media.title.toLowerCase()) || torrentTitle.includes(media.title.toLowerCase().replaceAll(" ", "-")) || torrentTitle.includes(media.title.toLowerCase().replaceAll(" ", ".")))) {
                let quality: string | null = null
                if (torrentTitle.includes("720")) quality = '720p'
                else if (torrentTitle.includes("1080")) quality = '1080p'
                else if (torrentTitle.includes("2160")) quality = '4k'
                else if (torrentTitle.includes("4k")) quality = '4k'
                else quality = 'Inconnu'

                const torrentLink = link.querySelector("td>a")?.getAttribute('href') ?? null

                if (torrentLink) {
                    resultLinks.push({
                        tmdb_id: media.tmdbId,
                        quality: quality,
                        language: media.vo,
                        source: 'Pirate Bay',
                        magnet_link: torrentLink
                    })
                }
            }
        }

        return resultLinks;

    } catch (e) {
        throw (e as AxiosError).status || -1
    }
}