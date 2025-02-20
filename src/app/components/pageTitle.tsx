"use client";

import { usePathname, useRouter } from "next/navigation";

interface PageTitleProps {
    title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
    const router = useRouter();
    const usePath = usePathname();
    const pathname = usePath.startsWith('/secure') ? usePath.slice(7) : usePath;

    const pathParts = pathname.split('/').filter(Boolean); // On découpe le pathname par les "/" et on retire les éléments vides

    return (
        <div
            className={"overflow-hidden z-20 fixed top-2 left-2 p-3 rounded-3xl bg-backgroundTransparent box-border backdrop-blur w-fit flex gap-3 items-center"} style={{maxWidth: "calc(100% - 1rem)"}}>
            <div className={"flex gap-3 items-center justify-start mr-3"}>
                <img src={"/ico/arrow-left.svg"} alt={"arrow"} className={"invert h-6 cursor-pointer hover:opacity-50"}
                     onClick={() => router.back()}/>
                <p className={"font-bold text-xl"}>{title}</p>
            </div>
            <div className={"flex gap-1 flex-wrap pt-1 pb-1 pl-2 pr-2 rounded-3xl bg-dark"}>
                {pathParts.map((part, index) => {
                    const link = `/secure/${pathParts.slice(0, index + 1).join('/')}`; // Crée un lien pour chaque partie du pathname
                    return (
                        <span key={index} className={"flex gap-1"}>
                            <a href={link}>{part}</a>
                            {index < pathParts.length - 1 &&
                                <span>/</span>}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
