'use client';

import LoadingIcon from "@/app/components/LoadingIcon";
import {AnimatePresence, motion} from "framer-motion";

export interface ButtonProps {
    iconName: string;
    text: string;
    onClick?: () => void;
    actionType?: ActionTypeEnum;
    isForm?: boolean;
    isLoading?: boolean;
    isSecondary?: boolean;
    isDisabled?: boolean;
}

export enum ActionTypeEnum {
    dangerous,
    safe,
    neutral
}

export default function Button({iconName, text, onClick, actionType = ActionTypeEnum.neutral, isSecondary=false, isForm = false, isLoading, isDisabled = false}:ButtonProps) {

    return (
        <button
            disabled={isDisabled || isLoading}
            type={isForm ? "submit" : "button"}
            className={`flex  gap-2 cursor-pointer text-background items-center justify-center pt-2 pb-2 pl-4 pr-4 ${ actionType === ActionTypeEnum.neutral ? isSecondary ? "bg-background text-foreground border-1 border-foreground md:hover:bg-onBackgroundHover active:bg-onBackgroundHover" : "bg-foreground md:hover:bg-onForeground active:bg-onForeground" : actionType === ActionTypeEnum.safe ? "bg-safe md:hover:bg-safeHover active:bg-safeHover" : "bg-dangerous md:hover:bg-dangerousHover active:bg-dangerous"} rounded-lg disabled:cursor-default disabled:opacity-50 `}
            onClick={onClick}
        >
            <>
                <AnimatePresence>
                    {
                        isLoading ? <LoadingIcon small={true} dark={true}/>
                            :
                            <motion.img
                                initial={{ opacity: 0, transform: "scale(.5)", filter: "blur(10px)" }}
                                animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
                                exit={{ opacity: 0, transform: "scale(.5)", filter: "blur(10px)" }}
                                src={`/ico/${iconName}.svg`} alt={iconName} className={`w-5 ${isSecondary && "invert"}`} />
                    }
                </AnimatePresence>


                {text}
            </>
        </button>
    );
}