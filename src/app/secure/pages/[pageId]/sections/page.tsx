"use client"

import {useEffect, useState} from "react";
import {getPages, Page} from "@/app/controller/pageController";
import {useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import DivLoading from "@/app/components/divLoading";
import {getSections, Section} from "@/app/controller/sectionController";

export default function Sections() {

    const [sections, setSections] = useState<Section[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        getSections().then((sections) => {
            setSections(sections);
            getPages().then((pages) => {
                setPages(pages);
                setLoading(false);
            });
        });
    }, []);

    const getPageForSection = (section: Section) => pages.find(page => page.id === section.page_id);

    return (
        <main>
            <PageTitle title={"Sections"}/>
            <h3>Vos sections</h3>
            {
                loading ? <DivLoading/> :
                    <div className={"flex w-full flex-wrap flex-col gap-3 p-2 bg-dark rounded-[10px]"}>
                        {
                            sections.map((section) => {
                                return (
                                    <div onClick={() => router.push("/secure/pages/" + getPageForSection(section)?.id + "/sections/" + section.id)}
                                         className={"cursor-pointer flex gap-3 items-center p-2 rounded-[5px] active:bg-darkHover md:hover:bg-darkHover"}
                                         key={section.id}>
                                        <p className={"h-10 rounded-[100px] bg-backgroundHover w-fit pl-3 pr-3 flex justify-center items-center"}>{getPageForSection(section)?.title}</p>
                                        <p>{section.title}</p>
                                    </div>
                                )
                            })
                        }

                        {
                            sections.length === 0 && <h2 className={"w-full text-center p-12"}>Pas de sections</h2>
                        }
                    </div>
            }
        </main>
    )
}