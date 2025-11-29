// src/app/components/itemSelection.tsx
"use client"

import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";

export default function ItemSelection({selectedItem, setSelectedItemAction, items}: {
    selectedItem: string,
    setSelectedItemAction: (item: string) => void,
    items: string[]
}) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className={`relative`}>
            <div className={"flex gap-2 items-center pt-1 pb-1 pl-2 rounded-lg  md:hover:bg-onBackgroundHover active:bg-onBackgroundHover cursor-pointer"}>
                <p>{selectedItem}</p>
                <img src={"/ico/chevron-up-down.svg"} alt={"select"} className={"w-6 invert"}/>

            </div>

            <AnimatePresence>
                {
                    isOpen &&
                    <motion.div
                        key={"item-selection-"+selectedItem}
                        initial={{transformOrigin: "top", transform: "scaleY(0)", opacity: 0, filter: "blur(10px)"}}
                        animate={{transformOrigin: "top", transform: "scaleY(1)", opacity: 1, filter: "blur(0px)"}}
                        exit={{transformOrigin: "top", transform: "scaleY(0)", opacity: 0, filter: "blur(10px)"}}
                        onClick={(e) => e.stopPropagation()}
                        className={"bg-onBackground h-fit border-2 border-onBackgroundHover cursor-pointer rounded-lg absolute top-full left-0 mt-2 w-full z-10 flex flex-col overflow-hidden"}
                    >
                        {
                            items.map((item, index) => (
                                <p key={index}
                                   onClick={() => {
                                       setSelectedItemAction(item);
                                       setIsOpen(false);
                                   }}
                                   className={`pt-2 pb-2 pl-4 pr-4 md:hover:bg-onBackgroundHover  cursor-pointer active:bg-onBackgroundHover`}
                                >
                                    {item}
                                </p>
                            ))
                        }
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    )
}