
'use client';

import Button, {ActionTypeEnum, ButtonProps} from "@/app/components/Button";
import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import LoadingIcon from "@/app/components/LoadingIcon";

export enum SectionWeight {
    LIGHT = 1,
    MEDIUM = 2,
    HEAVY = 3
}

export enum SectionWidth {
    AUTO = "auto",
    FIT = "fit-content",
    FULL = "100%",
    HALF = "50%",
    QUARTER = "25%",
    THIRD = "33%",
    TWO_THIRDS = "66%",
    THREE_QUARTERS = "75%"
}

export default function SectionElem({title, actions, loading=false, children, weight=SectionWeight.LIGHT, width=SectionWidth.AUTO, actionType = ActionTypeEnum.neutral}: {title?: string, loading?: boolean, actions?: ButtonProps[], children: React.ReactNode, weight?: SectionWeight, width?: SectionWidth, actionType?: ActionTypeEnum}) {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 768) {
                setIsMobile(true);
            }
        }
    }, []);

    return (
        <div style={{width: isMobile ? SectionWidth.FULL : width, maxWidth: isMobile ? SectionWidth.FULL : width, minWidth: isMobile ? SectionWidth.FULL : width, flex: weight}} className={` max-h-full min-h-full flex flex-col`}>
            <div className={`w-full flex-1 relative p-3 md:p-6 bg-onBackground border-[1px] ${actionType === ActionTypeEnum.safe ? "border-safeHover" : actionType === ActionTypeEnum.dangerous ? "border-dangerousHover" : "border-onBackgroundHover"}  ${actions ? "rounded-t-xl" : "rounded-xl"} flex gap-3 overflow-hidden flex-col`}>
                {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
                <AnimatePresence>
                    {
                        loading &&
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className={"backdrop-blur bg-backgroundOpacity absolute w-full h-full top-0 left-0 z-10 flex justify-center items-center"}
                        >
                            <LoadingIcon/>
                        </motion.div>
                    }
                </AnimatePresence>
                {children}
            </div>
            {
                actions && actions.length > 0 &&
                <div className={`rounded-b-xl p-3 bg-onBackground border-[1px] border-t-0 ${actionType === ActionTypeEnum.safe ? "border-safeHover" : actionType === ActionTypeEnum.dangerous ? "border-dangerousHover" : "border-onBackgroundHover"} flex gap-3 justify-end items-center`}>
                    {
                        actions.map((action, index) => <Button key={index} iconName={action.iconName} text={action.text} onClick={action.onClick} actionType={action.actionType} isForm={action.isForm} isSecondary={action.isSecondary} isLoading={action.isLoading} />)
                    }
                </div>
            }
        </div>
    );
}