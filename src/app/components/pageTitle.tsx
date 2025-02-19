"use client";

import { usePathname, useRouter } from "next/navigation";
import {logout} from "@/app/controller/loginController";

interface PageTitleProps {
    title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
    const router = useRouter();
    const usePath = usePathname();
    const pathname = usePath.startsWith('/secure') ? usePath.slice(7) : usePath;

    const pathParts = pathname.split('/').filter(Boolean); // On découpe le pathname par les "/" et on retire les éléments vides

    return (
        <div className={"overflow-hidden z-20 fixed top-[30px] left-[30px] p-4 rounded-2xl bg-backgroundTransparent box-border backdrop-blur"} style={{ width: 'calc(100% - 60px)' }}>
            <div className={"flex gap-1 flex-wrap"}>
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
            <div className={"flex gap-3 items-center justify-start"}>
                <img src={"/ico/arrow-left.svg"} alt={"arrow"} className={"invert h-8 cursor-pointer hover:opacity-50"}
                     onClick={() => router.back()}/>
                <h2>{title}</h2>
            </div>
            <button onClick={logout} className={"bg-red-500 md:hover:bg-red-400 active:scale-90 rounded-3xl absolute top-2 right-2"}>
                Déconnexion
                <img src={"/ico/power.svg"} alt={"power"}/>
            </button>
        </div>
    );
}
