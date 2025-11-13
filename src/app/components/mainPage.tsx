'use client';

import {
    useScroll,
    useMotionValueEvent,
    AnimatePresence,
    motion,
    useMotionValue,
    useTransform,
    useMotionTemplate
} from "framer-motion";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import SessionService from "@/app/service/SessionService";
import {Section} from "@/app/models/Section";
import {Page} from "@/app/models/Page";
import {DisplayWebsite, RecursiveWebsite} from "@/app/models/DisplayWebsite";
import DisplayWebsiteService from "@/app/service/DisplayWebsiteService";
import PageService from "@/app/service/pageService";
import SectionService from "@/app/service/sectionService";
import ItemSelection from "@/app/components/itemSelection";
import CacheUtil from "@/app/utils/cacheUtil";
import LoadingPopup from "@/app/components/loadingPopup";

export interface pageProps {
    children: React.ReactNode;
    pageAlignment?: PageAlignmentEnum;
    loading?: boolean;
    loadingMessage?: string;
    waitFor?: [];
}

export enum PageAlignmentEnum {
    start,
    center,
    tileStart,
    tileCenter,
}


export default function MainPage({children, pageAlignment = PageAlignmentEnum.start, loading = false, waitFor = []}: pageProps) {

    const {scrollY} = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [section, setSection] = useState<Section | null>(null);
    const [page, setPage] = useState<Page | null>(null);
    const [recursiveWebsite, setRecursiveWebsite] = useState<RecursiveWebsite | null>(null);
    const [websites, setWebsites] = useState<DisplayWebsite[]>([]);


    const {websiteId, pageId, sectionId} = useParams();

    useEffect(() => {
        DisplayWebsiteService.getMyWebsites().then((w) => {
            setWebsites(w);
        })
        if (websiteId) {
            CacheUtil.getItem<RecursiveWebsite>(() => DisplayWebsiteService.getRecursiveWebsiteById(parseInt(websiteId as string)), `main_recursive_website_${websiteId}`, 5 * 60 * 1000).then((website) => {
                setRecursiveWebsite(website);
            });
        }
        if (pageId) {
            CacheUtil.getItem<Page>(() => PageService.getPageById(parseInt(pageId as string)), `main_page_${pageId}`, 5 * 60 * 1000).then((page) => {
                setPage(page);
            });
        }
        if (sectionId) {
            CacheUtil.getItem<Section>(() => SectionService.getSectionById(parseInt(sectionId as string)), `main_section_${sectionId}`, 5 * 60 * 1000).then((section) => {
                setSection(section);
            });
        }

    }, [websiteId, pageId, sectionId]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 0);
    });

    const allItemsLoaded = waitFor.every((item) => item !== undefined && item !== null);

    const logout = () => {
        SessionService.deleteSession().then(() => {
            router.push("/");
        });
    }

    const router = useRouter();

    const logoX = useMotionValue(0);
    const logoY = useMotionValue(0);

    // plages agrandies pour une inclinaison plus marquée
    const rotateX = useTransform(logoY, [-70, 70], [25, -25]);
    const rotateY = useTransform(logoX, [-70, 70], [-25, 25]);

    // ombre plus large et plus contrastée
    const shadowOffsetY = useTransform(logoY, [-70, 70], [28, -28]);
    const dynamicShadow = useMotionTemplate`0px ${shadowOffsetY}px 50px rgba(2,6,23,0.28), 0px 10px 30px rgba(2,6,23,0.06)`;

    // gestionnaires pointer/mouse (support tactile + souris)
    const handleLogoPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) - rect.width / 2;
        const py = (e.clientY - rect.top) - rect.height / 2;
        logoX.set((px / rect.width) * 100);
        logoY.set((py / rect.height) * 100);
    };

    const handleLogoPointerLeave = () => {
        // remise rapide pour une sensation réactive
        logoX.set(0);
        logoY.set(0);
    };

    return (
        <main className={`flex items-start justify-start flex-col gap-6 md:pb-6 pb-3 md:pl-6 pl-3 md:pr-6 pr-3 mb-20`}>
            <div
                className={`flex flex-col ${scrolled ? "gap-4 pt-4" : "gap-4 pt-4 md:gap-6 md:pt-6"} sticky w-full top-0 left-0 z-40 bg-backgroundOpacity backdrop-blur`}>
                <div className="flex gap-4 items-center justify-between w-full">
                    <div className="flex gap-2 items-start flex-col justify-center">
                        <div className={`flex gap-4 items-center min-w-0 ${scrolled ? "scale-90" : "scale-100"}`}>
                            <motion.img
                                src="/img/icon.png"
                                alt="logo"
                                className="w-12 cursor-pointer will-change-transform"
                                style={{
                                    rotateX,
                                    rotateY,
                                    z: 0,
                                    boxShadow: dynamicShadow,
                                    transformStyle: "preserve-3d",
                                    perspective: 1100,
                                    // léger relief initial
                                    translateZ: 0
                                }}
                                onPointerMove={handleLogoPointerMove}
                                onPointerLeave={handleLogoPointerLeave}
                                onPointerCancel={handleLogoPointerLeave}
                                whileHover={{
                                    scale: 1.22,                  // plus visible
                                    translateY: -6,               // lève l'icône
                                    rotateZ: 6,                   // petite rotation pour dynamisme
                                    filter: "brightness(1.06)",   // léger éclaircissement
                                    transition: {
                                        type: "spring",
                                        stiffness: 420,           // ressort plus nerveux
                                        damping: 22,
                                        mass: 0.8
                                    }
                                }}
                                whileTap={{
                                    scale: 0.82,                  // tap plus net
                                    rotateZ: -18,                 // rotation marquée au clic
                                    transition: {
                                        type: "spring",
                                        stiffness: 900,
                                        damping: 36
                                    }
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 28
                                }}
                                onClick={() => router.push("/secure")}
                            />

                            <div
                                className={`gap-2 items-center justify-start md:flex hidden`}>
                                {
                                    recursiveWebsite &&
                                    <ItemSelection
                                        selectedItem={recursiveWebsite.title}
                                        setSelectedItemAction={(websiteTitle:string) => {
                                            const selectedWebsite = websites.find((website) => website.title === websiteTitle);
                                            if (selectedWebsite) {
                                                router.push(`/secure/${selectedWebsite.id}`);
                                            }
                                        }}
                                        items={websites.map((website) => website.title)}/>
                                }
                                {
                                    page &&
                                    <>
                                        <p>{" / "}</p>
                                        <ItemSelection
                                            selectedItem={page.title}
                                            setSelectedItemAction={(pageTitle:string)=> {
                                                const selectedPage = recursiveWebsite?.pages.find((p) => p.title === pageTitle);
                                                if (selectedPage && recursiveWebsite) {
                                                    router.push(`/secure/${recursiveWebsite.id}/${selectedPage.id}`);
                                                }
                                            }}
                                            items={recursiveWebsite?.pages.map((page) => page.title) || []}/>
                                    </>
                                }
                                {
                                    section &&
                                    <>
                                        <p>{" / "}</p>
                                        <ItemSelection
                                            selectedItem={section.title}
                                            setSelectedItemAction={(sectionTitle:string)=>{
                                                const recursivePage = recursiveWebsite?.pages.find((p) => p.id === page?.id);
                                                const selectedSection = recursivePage?.sections.find((s) => s.title === sectionTitle);
                                                if (selectedSection && recursiveWebsite && page) {
                                                    router.push(`/secure/${recursiveWebsite.id}/${page.id}/${selectedSection.id}`);
                                                }
                                            }}
                                            items={recursiveWebsite?.pages.find((p) => p.id === page?.id)?.sections.map((section) => section.title) || []}/>
                                    </>
                                }
                            </div>
                        </div>




                    </div>

                    <div className="flex gap-4 items-center">

                        <button
                            className={`flex flex-shrink-0 ${scrolled ? "gap-0" : "gap-0 md:gap-2"} items-center justify-center border-1 border-on-background-hover pl-4 pr-4 pt-2 pb-2 bg-onBackground rounded-lg md:hover:bg-onBackgroundHover active:bg-onBackgroundHover cursor-pointer`}
                            onClick={() => router.push("/secure")}
                        >
                            <img src="/ico/home.svg" alt="power" className="w-4 invert"/>
                            <span className={`${scrolled ? "text-[0px]" : "text-[0px] md:text-[15px]"}`}>Accueil</span>
                        </button>

                        <button
                            className={`flex flex-shrink-0 ${scrolled ? "gap-0" : "gap-0 md:gap-2"} items-center justify-center border-1 border-on-background-hover pl-4 pr-4 pt-2 pb-2 bg-onBackground rounded-lg md:hover:bg-onBackgroundHover active:bg-onBackgroundHover cursor-pointer`}
                            onClick={logout}
                        >
                            <img src="/ico/power.svg" alt="power" className="w-4 invert"/>
                            <span
                                className={`${scrolled ? "text-[0px]" : "text-[0px] md:text-[15px]"}`}>Déconnexion</span>
                        </button>
                    </div>

                </div>
                <hr className={"border-0 h-[1px] w-full bg-onBackgroundHover"}/>
            </div>
            <div
                className={`w-full relative`}>

                <LoadingPopup show={loading}/>
                <AnimatePresence>
                    {!loading && allItemsLoaded &&
                        <motion.div
                            className={`md:p-3 p-1 w-full relative flex gap-5 ${pageAlignment === PageAlignmentEnum.center ? 'justify-center items-center flex-col' : pageAlignment === PageAlignmentEnum.start ? 'justify-start  items-stretch flex-col' : pageAlignment === PageAlignmentEnum.tileCenter ? 'justify-center  items-stretch flex-wrap flex-col md:flex-row' : 'justify-start  items-stretch flex-wrap md:flex-row'}`}
                            initial={{ filter: "blur(20px)", transform: "scale(.9)"}}
                            animate={{ filter: "blur(0px)", transform: "scale(1)"}}
                            exit={{ filter: "blur(20px)", transform: "scale(.9)"}}
                        >
                            {children}
                        </motion.div>
                    }
                </AnimatePresence>


            </div>
        </main>
    );
}