'use client';

import { useScroll, useMotionValueEvent } from "framer-motion";
import {useRouter} from "next/navigation";
import {useState} from "react";

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

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 0);
    });

    const router = useRouter();

    return (
        <main className={`flex items-start justify-start flex-col gap-6 ${title ? "pb-6 pl-6 pr-6" : "p-6"} mb-20`}>
            {title && <div className={`flex flex-col ${scrolled ? "gap-4 pt-4" : "gap-6 pt-6"} sticky w-full top-0 left-0 z-10 bg-backgroundOpacity backdrop-blur`}>
                <div className="flex gap-4 items-center " >
                    <button
                        className={`flex ${scrolled ? "gap-0" : "gap-2"} items-center justify-center border-1 border-on-background-hover pl-4 pr-4 pt-2 pb-2 bg-onBackground rounded-lg md:hover:bg-onBackgroundHover active:bg-onBackgroundHover cursor-pointer`}
                        onClick={() => router.back()}
                    >
                        <img src="/ico/arrow-back.svg" alt="Back" className="w-4 invert" />
                        <span className={`${scrolled ? "text-[0px]" : "text-[15px]"}`}>Retour</span>
                    </button>
                    <h1 className={`line-clamp-2`} style={{fontSize: scrolled ? "20px" : "35px"}}>{title}</h1>
                </div>
                <hr className={"border-0 h-[1px] w-full bg-onBackgroundHover"}/>
            </div>}
            <div className={`p-3 w-full flex gap-5 ${pageAlignment === PageAlignmentEnum.center ? 'justify-center items-center flex-col' : pageAlignment === PageAlignmentEnum.start ? 'justify-start  items-stretch flex-col' : pageAlignment === PageAlignmentEnum.tileCenter ? 'justify-center  items-stretch flex-wrap flex-col md:flex-row' : 'justify-start  items-stretch flex-wrap md:flex-row'}`}>
                {children}
            </div>
        </main>
    );
}