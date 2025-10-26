"use client";
import {useState} from "react";
import {Subcategory} from "@/app/models/Subcategory";
import {RecursiveCategory} from "@/app/models/Category";
import {AnimatePresence, motion} from "framer-motion";

export default function SubcatSelector({setSelectedSubCategoriesAction, recursiveCategories}: {
    setSelectedSubCategoriesAction: (subcategories: Subcategory[]) => void,
    recursiveCategories: RecursiveCategory[]
}) {
    const [selectedSubCat, setSelectedSubCat] = useState<Subcategory[]>([]);
    const [developpedCategories, setDeveloppedCategories] = useState<number[]>([]);

    const toggleCategoryDeveloppement = (categoryId: number) => {
        if (developpedCategories.includes(categoryId)) {
            setDeveloppedCategories(developpedCategories.filter((id) => id !== categoryId));
        } else {
            setDeveloppedCategories([...developpedCategories, categoryId]);
        }
    }

    const handleCheckboxToggle = (subcategory: Subcategory) => {
        setSelectedSubCat(prev => {
            const exists = prev.some(s => s.id === subcategory.id);
            const next = exists ? prev.filter(s => s.id !== subcategory.id) : [...prev, subcategory];
            setSelectedSubCategoriesAction(next);
            return next;
        });
    }

    return (
        <div className="bg-background p-4 rounded-lg flex flex-col gap-4">
            {
                recursiveCategories.map((category) => {
                    return <div key={category.id} className="flex flex-col gap-2">

                        <div onClick={() => toggleCategoryDeveloppement(category.id)} className="flex flex-row gap-2 items-center">
                            <img src={"/ico/chevron-down.svg"} alt={"develop"} className={`w-6 h-6 ${developpedCategories.includes(category.id) && "rotate-180"}`} />
                            <h3>{category.name}</h3>
                        </div>
                        <AnimatePresence>
                        {
                            developpedCategories.includes(category.id) &&
                            <motion.div className="flex flex-col gap-2 pl-4"
                                        initial={{transform: "translateY(-100px)", opacity: 0}}
                                        animate={{transform: "translateY(0)", opacity: 1}}
                                        exit={{transform: "translateY(-100px)", opacity: 0}}
                            >
                                {
                                    category.subcategories.map((subcategory) => {
                                        const checked = selectedSubCat.some(s => s.id === subcategory.id);
                                        return <div key={category.id + subcategory.id} className={"flex flex-row gap-2 items-center"}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleCheckboxToggle(subcategory)}
                                            />
                                            <p>{subcategory.name}</p>
                                        </div>
                                    })
                                }
                            </motion.div>
                        }
                        </AnimatePresence>

                        <hr className="h-1 w-full bg-onBackgroundHover" />

                    </div>
                })
            }
        </div>
    )
}