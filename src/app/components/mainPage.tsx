'use client';

import {useScroll, useMotionValueEvent} from "framer-motion";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import SessionService from "@/app/service/SessionService";
import {Element} from "@/app/models/Element";
import {Section} from "@/app/models/Section";
import {Page} from "@/app/models/Page";
import {DisplayWebsite} from "@/app/models/DisplayWebsite";
import DisplayWebsiteService from "@/app/service/DisplayWebsiteService";
import PageService from "@/app/service/pageService";
import SectionService from "@/app/service/sectionService";
import ElementService from "@/app/service/elementService";
import {StringUtil} from "@/app/utils/stringUtil";

export interface pageProps {
    children: React.ReactNode;
    title?: string;
    pageAlignment?: PageAlignmentEnum;

}

export enum PageAlignmentEnum {
    start,
    center,
    tileStart,
    tileCenter,
}



export default function MainPage({children, title, pageAlignment=PageAlignmentEnum.start}: pageProps) {

    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [element, setElement] = useState<Element | null>(null);
    const [section, setSection] = useState<Section | null>(null);
    const [page, setPage] = useState<Page | null>(null);
    const [website, setWebsite] = useState<DisplayWebsite | null>(null);

    const {websiteId, pageId, sectionId, elementId} = useParams();

    useEffect(() => {
        if (websiteId) {
            DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string)).then((website) => {
                setWebsite(website);
            })
        }
        if (pageId) {
            PageService.getPageById(parseInt(pageId as string)).then((page) => {
                setPage(page);
            })
        }
        if (sectionId) {
            SectionService.getSectionById(parseInt(sectionId as string)).then((section) => {
                setSection(section);
            })
        }
        if (elementId) {
            ElementService.getElementById(parseInt(elementId as string)).then((element) => {
                setElement(element);
            })
        }
    }, [websiteId, pageId, sectionId, elementId]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 0);
    });

    const logout = () => {
        SessionService.deleteSession().then(() => {
            router.push("/");
        });
    }

    const router = useRouter();

    return (
        <main className={`flex items-start justify-start flex-col gap-6 ${title ? "pb-6 pl-6 pr-6" : "p-6"} mb-20`}>
            {title && <div className={`flex flex-col ${scrolled ? "gap-4 pt-4" : "gap-6 pt-6"} sticky w-full top-0 left-0 z-10 bg-backgroundOpacity backdrop-blur`}>
                <div className="flex gap-4 items-center justify-between w-full" >
                    <div className="flex gap-2 items-start flex-col justify-center">
                        <div className="flex gap-4 items-center">
                            <button
                                className={`flex ${scrolled ? "gap-0" : "gap-2"} items-center justify-center border-1 border-on-background-hover pl-4 pr-4 pt-2 pb-2 bg-onBackground rounded-lg md:hover:bg-onBackgroundHover active:bg-onBackgroundHover cursor-pointer`}
                                onClick={() => router.back()}
                            >
                                <img src="/ico/arrow-back.svg" alt="Back" className="w-4 invert" />
                                <span className={`${scrolled ? "text-[0px]" : "text-[15px]"}`}>Retour</span>
                            </button>
                            <h1 className={`line-clamp-2`} style={{fontSize: scrolled ? "20px" : "35px"}}>{title}</h1>
                        </div>

                        <div
                            className={`flex gap-1 items-center text-onBackgroundHover ${scrolled && "text-[0]"} italic justify-start`}>
                            {
                                website &&
                                <>
                                    <a className={"cursor-pointer hover:underline"} href={"/secure/" + websiteId}>{StringUtil.truncateString(website.hero_title, 15)}</a>
                                </>
                            }
                            {
                                page &&
                                <>
                                    <p>{" > "}</p>
                                    <a className={"cursor-pointer hover:underline"} href={`/secure/${websiteId}/${pageId}`}>{StringUtil.truncateString(page.title, 15)}</a>
                                </>
                            }
                            {
                                section &&
                                <>
                                    <p>{" > "}</p>
                                    <a className={"cursor-pointer hover:underline"} href={`/secure/${websiteId}/${pageId}/${sectionId}`}>{StringUtil.truncateString(section.section_type, 15)}</a>
                                </>
                            }
                            {
                                element &&
                                <>
                                    <p>{" > "}</p>
                                    <a className={"cursor-pointer hover:underline"} href={`/secure/${websiteId}/${pageId}/${sectionId}/${elementId}`}>{StringUtil.truncateString(element.content, 15)}</a>
                                </>
                            }
                        </div>



                    </div>

                    <div className="flex gap-4 items-center">

                        <button
                            className={`flex ${scrolled ? "gap-0" : "gap-2"} items-center justify-center border-1 border-on-background-hover pl-4 pr-4 pt-2 pb-2 bg-onBackground rounded-lg md:hover:bg-onBackgroundHover active:bg-onBackgroundHover cursor-pointer`}
                            onClick={() => router.push("/secure")}
                        >
                            <img src="/ico/home.svg" alt="power" className="w-4 invert" />
                            <span className={`${scrolled ? "text-[0px]" : "text-[15px]"}`}>Accueil</span>
                        </button>

                        <button
                            className={`flex ${scrolled ? "gap-0" : "gap-2"} items-center justify-center border-1 border-on-background-hover pl-4 pr-4 pt-2 pb-2 bg-onBackground rounded-lg md:hover:bg-onBackgroundHover active:bg-onBackgroundHover cursor-pointer`}
                            onClick={logout}
                        >
                            <img src="/ico/power.svg" alt="power" className="w-4 invert" />
                            <span className={`${scrolled ? "text-[0px]" : "text-[15px]"}`}>Déconnexion</span>
                        </button>
                    </div>

                </div>
                <hr className={"border-0 h-[1px] w-full bg-onBackgroundHover"}/>
            </div>}
            <div className={`p-3 w-full flex gap-5 ${pageAlignment === PageAlignmentEnum.center ? 'justify-center items-center flex-col' : pageAlignment === PageAlignmentEnum.start ? 'justify-start  items-stretch flex-col' : pageAlignment === PageAlignmentEnum.tileCenter ? 'justify-center  items-stretch flex-wrap flex-col md:flex-row' : 'justify-start  items-stretch flex-wrap md:flex-row'}`}>
                {children}
            </div>
        </main>
    );
}