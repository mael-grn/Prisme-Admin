"use client"

import {useEffect, useState} from "react";
import {getPages, Page} from "@/app/controller/pageController";
import {useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import DivLoading from "@/app/components/divLoading";

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

    return (
        <main>
            <PageTitle title={"Pages"}/>
            <h1>Vos pages</h1>
            {
                loading ? <DivLoading/> :
                    <div className={"flex w-full flex-col gap-3 p-2 bg-dark rounded-[10px]"}>
                        {
                            pages.map((page) => {
                                return (
                                    <div onClick={() => router.push("/secure/pages/" + page.id)}
                                         className={"cursor-pointer p-2 rounded-[5px] hover:bg-darkHover"}
                                         key={page.id}>
                                        <p className={"font-bold"}>{page.title}</p>
                                    </div>
                                )
                            })
                        }

                        {
                            pages.length === 0 && <h2 className={"w-full text-center p-12"}>Pas de pages</h2>
                        }
                    </div>
            }


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