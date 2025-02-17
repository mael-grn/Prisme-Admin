"use client"

import {useEffect, useState} from "react";
import {getPages, Page} from "@/app/controller/pageController";
import {useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";

export default function Pages() {

    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        getPages().then((pages) => {
            setPages(pages);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <main>
                <PageTitle title={"Pages"}/>
                <PageLoading/>
            </main>
        )
    }

    return (
        <main>
            <PageTitle title={"Pages"}/>
            <h1>Vos pages</h1>
            <div className={"flex md:w-2/3 w-full flex-col gap-3 p-4 bg-dark rounded-xl"}>
                {
                    pages.map((page) => {
                        return (
                            <div onClick={() => router.push("/secure/pages/" + page.id)} className={"cursor-pointer p-3 rounded-xl hover:bg-darkHover"} key={page.id}>
                                <h2>{page.title}</h2>
                            </div>
                        )
                    })
                }

                {
                    pages.length === 0 && <h2 className={"w-full text-center p-12"}>Pas de pages</h2>
                }
            </div>

            <button
                className={"w-fit"}
                onClick={() => {
                    router.push('/secure/pages/new');
                }}
            >
                Ajouter
                <img src={"/ico/plus.svg"} alt={"plus"}/>
            </button>
        </main>
    )
}