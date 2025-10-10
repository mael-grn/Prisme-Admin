import {Movie} from "@/app/models/movie";
import LightMovie from "@/app/models/lightMovie";


export function parseLightMovie(data: {
    title: string,
    release_date: string,
    poster_path: string,
    id: string
}): LightMovie {
    return {
        title: data.title,
        year: parseInt(data.release_date?.split('-')[0] ?? 'Intemporel'),
        posterUrl: data.poster_path ? "https://image.tmdb.org/t/p/w500" + data.poster_path : "https://eanwebn2obhbwxhv.public.blob.vercel-storage.com/movie-placeholder.png",
        tmdbId: data.id,
    }
}

export async function getPopularMovies(): Promise<LightMovie[]> {
    'use server';
    const apiKey: string = process.env.TMDB_KEY ?? "";
    console.log("TMDB_KEY", apiKey);

    const url = 'https://api.themoviedb.org/3/movie/popular?language=fr&page=1';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey}`
        }
    };

    const res = await fetch(url, options);

    if (!res.ok) {
        throw res.status;
    }

    const data = await res.json();

    const mediaList: LightMovie[] = [];
    for (const item of data.results) {
        if (item.poster_path && item.release_date) {
            mediaList.push(parseLightMovie(item));
        }
    }

    return mediaList;
}

export async function getMovieDetailsFromTmdb(tmdbId: string, lang: string = "fr"): Promise<Movie> {
    'use server';

    const apiKey: string = process.env.TMDB_KEY ?? "";

    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?language=${lang}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey}`
        }
    };

    const res = await fetch(url, options)

    if (!res.ok) throw res.status;

    const data = await res.json();

    return {
        title: data.title,
        year: data.release_date.split('-')[0],
        posterUrl: data.poster_path ? "https://image.tmdb.org/t/p/w500" + data.poster_path : "",
        backdropUrl: "https://image.tmdb.org/t/p/w1280" + data.backdrop_path,
        genres: data.genres.map((genre: { name: string }) => genre.name),
        imdbId: data.imdb_id,
        vo: data.original_language,
        overview: data.overview,
        runtime: parseFloat(data.runtime),
        vote: data.vote_average,
        voteCount: data.vote_count,
        tmdbId: tmdbId,
    }

}

export async function getTvDetailsFromTmdb(tmdbId: string, lang: string = "fr"): Promise<Movie> {
    'use server';

    const apiKey: string = process.env.TMDB_KEY ?? "";

    const url = `https://api.themoviedb.org/3/tv/${tmdbId}?language=${lang}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey}`
        }
    };

    const res = await fetch(url, options)

    if (!res.ok) throw res.status;

    const data = await res.json();

    return {
        title: data.name,
        year: data.first_air_date.split('-')[0],
        posterUrl: data.poster_path ? "https://image.tmdb.org/t/p/w500" + data.poster_path : "",
        backdropUrl: "https://image.tmdb.org/t/p/w1280" + data.backdrop_path,
        genres: data.genres.map((genre: { name: string }) => genre.name),
        imdbId: data.external_ids?.imdb_id,
        vo: data.original_language,
        overview: data.overview,
        runtime: parseFloat(data.episode_run_time[0]),
        vote: data.vote_average,
        voteCount: data.vote_count,
        tmdbId: tmdbId,
    }
}

export async function searchMovie(queryString: string): Promise<LightMovie[]> {

    const apiKey: string = process.env.TMDB_KEY ?? "";

    const movieUrl = `https://api.themoviedb.org/3/search/tv?query=${queryString}&include_adult=false&language=fr`;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey}`
        }
    };

    const movieRes = await fetch(movieUrl, options);

    if (!movieRes.ok) {
        throw movieRes.status;
    }

    const movieData = await movieRes.json();
    const movieList: LightMovie[] = [];

    for (const item of movieData.results) {
        movieList.push(parseLightMovie(item));
    }

    return movieList
}

export async function searchTv(queryString: string): Promise<LightMovie[]> {

    const apiKey: string = process.env.TMDB_KEY ?? "";

    const tvUrl = `https://api.themoviedb.org/3/search/tv?query=${queryString}&include_adult=false&language=fr`;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey}`
        }
    };

    const tvRes = await fetch(tvUrl, options);

    if (!tvRes.ok) {
        throw tvRes.status;
    }

    const tvData = await tvRes.json();

    return []; // A completer
}