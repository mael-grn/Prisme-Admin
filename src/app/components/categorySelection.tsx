import { RecursiveCategory } from "@/app/models/Category";
                                                import { Subcategory } from "@/app/models/Subcategory";
                                                import { useState } from "react";
                                                import { AnimatePresence, motion, Variants } from "framer-motion";

                                                const containerVariants: Variants = {
                                                    hidden: {
                                                        opacity: 0,
                                                        y: -8,
                                                        filter: "blur(6px)",
                                                        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
                                                    },
                                                    visible: {
                                                        opacity: 1,
                                                        y: 0,
                                                        filter: "blur(0px)",
                                                        transition: {
                                                            duration: 0.28,
                                                            ease: [0.22, 1, 0.36, 1],
                                                            when: "beforeChildren",
                                                            staggerChildren: 0.04
                                                        }
                                                    },
                                                    exit: {
                                                        opacity: 0,
                                                        y: -6,
                                                        filter: "blur(6px)",
                                                        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
                                                    }
                                                };

                                                const itemVariants: Variants = {
                                                    hidden: { opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.18 } },
                                                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.22 } },
                                                    exit: { opacity: 0, y: -6, filter: "blur(6px)", transition: { duration: 0.16 } }
                                                };

                                                export default function CategorySelection({
                                                    recursiveCategoryList,
                                                    preSelectedSubcategories = [],
                                                    onSelectSubcategoryAction,
                                                    onDeselectSubcategoryAction,
                                                    onCreateNewCategoryPressedAction,
                                                    onCreateSubcategoryPressedAction
                                                }: {
                                                    recursiveCategoryList: RecursiveCategory[],
                                                    preSelectedSubcategories?: Subcategory[],
                                                    onSelectSubcategoryAction: (subcategory: Subcategory) => void,
                                                    onDeselectSubcategoryAction: (subcategory: Subcategory) => void,
                                                    onCreateNewCategoryPressedAction: () => void,
                                                    onCreateSubcategoryPressedAction: (category: RecursiveCategory) => void,
                                                }) {

                                                    const [selectedSubcategories, setSelectedSubcategories] = useState<Subcategory[]>(preSelectedSubcategories);
                                                    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

                                                    const onCheckboxClick = (subcategory: Subcategory) => {
                                                        const isSelected = selectedSubcategories.findIndex(s => s.id === subcategory.id) !== -1;
                                                        if (isSelected) {
                                                            setSelectedSubcategories(selectedSubcategories.filter(s => s.id !== subcategory.id));
                                                            onDeselectSubcategoryAction(subcategory);
                                                        } else {
                                                            setSelectedSubcategories([...selectedSubcategories, subcategory]);
                                                            onSelectSubcategoryAction(subcategory);
                                                        }
                                                    };

                                                    if (recursiveCategoryList.length === 0) {
                                                        return (
                                                            <div className={"flex gap-2 items-center"}>
                                                                <img src={"/ico/info.svg"} alt={"info"} className={"w-8 invert"} />
                                                                <p>Il n&apos;existe aucune catégories pour le moment.</p>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className={"w-full p-4 rounded-xl bg-background"}>
                                                            {
                                                                recursiveCategoryList.map((category) => (
                                                                    <div key={category.id} className={`flex flex-col gap-3 w-full`}>
                                                                        <div className="flex gap-4 items-center">
                                                                            <img
                                                                                src={`/ico/chevron-down.svg`}
                                                                                alt={"deploy"}
                                                                                className={`invert w-6 ${expandedCategories.includes(category.id) ? "-rotate-180" : "-rotate-90"} cursor-pointer`}
                                                                                onClick={() => {
                                                                                    if (expandedCategories.includes(category.id)) {
                                                                                        setExpandedCategories(expandedCategories.filter(id => id !== category.id));
                                                                                    } else {
                                                                                        setExpandedCategories([...expandedCategories, category.id]);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <h3>{category.name}</h3>
                                                                        </div>

                                                                        <AnimatePresence initial={false}>
                                                                            {
                                                                                expandedCategories.includes(category.id) &&
                                                                                <motion.div
                                                                                    key={`container-${category.id}`}
                                                                                    variants={containerVariants}
                                                                                    initial="hidden"
                                                                                    animate="visible"
                                                                                    exit="exit"
                                                                                    layout
                                                                                    style={{ overflow: "hidden" }}
                                                                                    className={"flex flex-col gap-2 pl-12 mb-4"}
                                                                                >
                                                                                    {
                                                                                        category.subcategories.length === 0 ?
                                                                                            <motion.div
                                                                                                variants={itemVariants}
                                                                                                className={"flex gap-2 items-center"}
                                                                                            >
                                                                                                <img src={"/ico/info.svg"} alt={"info"} className={"w-6 invert"} />
                                                                                                <p>Il n&apos;existe aucune sous-catégories pour le moment.</p>
                                                                                            </motion.div>
                                                                                            :
                                                                                            category.subcategories.map((subcategory) => {
                                                                                                const isChecked = selectedSubcategories.findIndex(s => s.id === subcategory.id) !== -1;

                                                                                                return (
                                                                                                    <motion.label
                                                                                                        key={subcategory.id}
                                                                                                        variants={itemVariants}
                                                                                                        className="flex items-center gap-4 group cursor-pointer pl-2"
                                                                                                    >
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            className="sr-only"
                                                                                                            checked={isChecked}
                                                                                                            onChange={() => onCheckboxClick(subcategory)}
                                                                                                            aria-checked={isChecked}
                                                                                                        />
                                                                                                        <span
                                                                                                            className={
                                                                                                                `relative flex items-center justify-center w-4 h-4 rounded transition-colors duration-150 border ` +
                                                                                                                (isChecked
                                                                                                                    ? `bg-white border-transparent`
                                                                                                                    : `bg-onBackground border-onBackgroundHover group-hover:bg-onBackgroundHover group-hover:border-onBackgroundHover`)
                                                                                                            }
                                                                                                            aria-hidden="true"
                                                                                                        >
                                                                                                            {isChecked && (
                                                                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                                                                                    <path d="M5 13l4 4L19 7" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                                                </svg>
                                                                                                            )}
                                                                                                        </span>
                                                                                                        <p>{subcategory.name}</p>
                                                                                                    </motion.label>
                                                                                                );
                                                                                            })
                                                                                    }
                                                                                    <motion.button
                                                                                        type={"button"}
                                                                                        className={"border-none bg-transparent md:hover:bg-onBackgroundHover active:bg-onBackgroundHover active:scale-90 rounded-lg flex pt-1 pb-1 pl-2 pr-2 justify-start items-center gap-3 w-fit"}
                                                                                        onClick={() => onCreateSubcategoryPressedAction(category)}
                                                                                        variants={itemVariants}
                                                                                    >
                                                                                        <img src={"/ico/add.svg"} alt={"add"} className={"invert w-5"} />
                                                                                        <p>Ajouter une sous-catégorie</p>
                                                                                    </motion.button>
                                                                                </motion.div>
                                                                            }
                                                                        </AnimatePresence>

                                                                    </div>
                                                                ))
                                                            }
                                                            <button type={"button"} className={"border-2 border-onBackgroundHover mt-6 bg-transparent md:hover:bg-onBackgroundHover active:bg-onBackgroundHover active:scale-90 rounded-lg flex pt-2 pb-2 pl-3 pr-3 justify-center items-center gap-3 w-full"} onClick={onCreateNewCategoryPressedAction}>
                                                                <img src={"/ico/add.svg"} alt={"add"} className={"invert w-5"} />
                                                                <p>Créer une catégorie</p>
                                                            </button>
                                                        </div>
                                                    );
                                                }