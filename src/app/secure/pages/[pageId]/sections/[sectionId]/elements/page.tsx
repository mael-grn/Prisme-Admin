"use client"

import {useEffect, useState} from "react";
import {getPages, Page} from "@/app/controller/pageController";
import {useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import DivLoading from "@/app/components/divLoading";
import {getSections, Section} from "@/app/controller/sectionController";
import {ElementBd, getElements} from "@/app/controller/elementController";

export default function Elements() {

    const [elements, setElements] = useState<ElementBd[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        getElements().then((elements) => {
            setElements(elements);
            getSections().then((sections) => {
                setSections(sections);
                getPages().then((pages) => {
                    setPages(pages);
                    setLoading(false);
                });
            });
        });

    }, []);

    const getSectionForElement = (elem: ElementBd) => sections.find(sect => sect.id === elem.section_id);
    const getPageForElement = (elem: ElementBd) => pages.find(page => page.id === getSectionForElement(elem)?.page_id);

    return (
        <main>
            <PageTitle title={"Elements"}/>
    <h3>Vos éléments</h3>
    {
        loading ? <DivLoading/> :
            <div className={"flex flex-wrap w-full flex-col gap-3 p-2 bg-dark rounded-[10px]"}>
                {
                    elements.map((elem) => {
                        return (
                            <div
                                onClick={() => router.push("/secure/pages/" + getPageForElement(elem)?.id + "/sections/" + getSectionForElement(elem)?.id + "/elements/" + elem.id)}
                                className={"cursor-pointer flex gap-3 items-center p-2 rounded-[5px] active:bg-darkHover md:hover:bg-darkHover"}
                                key={elem.id}>
                                <p className={"min-h-10 rounded-[20px] bg-backgroundHover w-fit pl-3 pr-3 flex justify-center items-center"}>{getPageForElement(elem)?.title}</p>
                                <p className={"min-h-10 rounded-[20px] bg-backgroundHover w-fit pl-3 pr-3 flex justify-center items-center"}>{getSectionForElement(elem)?.title}</p>
                                <p>{elem.content}</p>
                            </div>
                        )
                    })
                }

                {
                    sections.length === 0 && <h2 className={"w-full text-center p-12"}>Pas d&apos;éléments</h2>
        }
        </div>
    }
    </main>
)
}