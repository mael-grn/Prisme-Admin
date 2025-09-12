'use client';

import {useState} from "react";

export default function DropDown({
                                     items,
                                     selectedItem,
                                     setSelectedItemAction,
                                 }: {
    items: string[],
    selectedItem: string,
    setSelectedItemAction: (newValue: string) => void,
}) {

    const [showItems, setShowItems] = useState(false);
    return (
        <div className={"relative"}>
            <div
                className={` pt-2 pb-2 pl-3 pr-3 rounded-lg bg-background w-fit flex items-center justify-between gap-2 cursor-pointer md:hover:bg-onBackgroundHover target:bg-onBackgroundHover`}
                onMouseUp={() => setShowItems(!showItems)}
            >
                {selectedItem}
                <img src={"/ico/down.svg"} alt={"drown-down"} className={"h-4 w-4 invert"}/>
            </div>
            {
                showItems &&(
                    <ul className={"top-0 z-10 left-0 rounded-lg absolute bg-onBackground w-fit h-fit p-2 flex flex-col gap-2 border-2 border-onBackgroundHover"}>
                        {
                            items.map((item, index) => (
                                <li
                                    key={index}
                                    className={`p-2 rounded-lg cursor-pointer  ${selectedItem === item ? "bg-foreground text-background" : "md:hover:bg-onBackgroundHover"}`}
                                    onMouseUp={() => {
                                        setSelectedItemAction(item);
                                        setShowItems(false);
                                    }}
                                >
                                    {item}
                                </li>
                            ))
                        }
                    </ul>
                )
            }
        </div>


    );
}