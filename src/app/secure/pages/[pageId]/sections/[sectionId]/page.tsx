"use client"

import {changeElementPosition, ElementBd, ElementType, getTypes} from "@/app/controller/elementController";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import {
    deleteSection,
    getSection, getSectionType,
    Section
} from "@/app/controller/sectionController";
import Popup from "@/app/components/popup";
import ValidationPopup from "@/app/components/validationPopup";
import {
    addTag,
    addTagToSection,
    getTagId, getTags,
    getTagsForSection,
    removeTagFromSection,
    Tag
} from "@/app/controller/tagController";
import CreateTag from "@/app/components/createTag";
import {getElementsForSection} from "@/app/controller/elementController";
import DivLoading from "@/app/components/divLoading";

const maxContentLength = 75;
export default function SectionVisu() {
    const [loading, setLoading] = useState(true);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [elementsLoading, setElementsLoading] = useState(true);
    const [type, setType] = useState<ElementType | null>(null);
    const [section, setSection] = useState<Section | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [elementTypes, setElementTypes] = useState<ElementType[]>([]);
    const [elements, setElements] = useState<ElementBd[]>([]);
    const [modifyElementOrder, setModifyElementOrder] = useState<boolean>(false);
    const [modifiedElements, setModifiedElements] = useState<number[]>([]);
    const [createTagPopup, setCreateTagPopup] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);

    const router = useRouter();
    const { pageId, sectionId } = useParams();

    useEffect(() => {
        async function loadData() {
            const sect = await getSection(parseInt(sectionId as string))
            if (sect) setType(await getSectionType(sect.type_id));
            setSection(sect);
            setLoading(false);
            setTags(await getTagsForSection(parseInt(sectionId as string)));
            setTagsLoading(false);
            setElementTypes(await getTypes());
            setElements(await getElementsForSection(parseInt(sectionId as string)));
            setElementsLoading(false);
        }
        loadData();
    }, [pageId, sectionId]);

    function onCreateTag(newTag: string | null) {
        if (newTag === null) {
            setCreateTagPopup(false);
            return;
        }

        async function allTheStuffToDo() {
            if (newTag === null) {
                setCreateTagPopup(false);
                return;
            }
            const tags = await getTags();
            if (!tags.find(t => t.name === newTag)) {
                await addTag(newTag);
            }

            const tagId = await getTagId(newTag);
            await addTagToSection(parseInt(sectionId as string), tagId as number);
            const tagsForSection = await getTagsForSection(parseInt(sectionId as string));
            setTags(tagsForSection);
        }

        setCreateTagPopup(false);
        setTagsLoading(true)
        allTheStuffToDo().finally(() => {
            setTagsLoading(false);
        })
    }

    function removeTagAction(id: number) {
        setTagsLoading(true);
        removeTagFromSection(parseInt(sectionId as string), id).then(() => {
            getTagsForSection(parseInt(sectionId as string)).then((res) => {
                setTags(res);
            }).finally(() => {
                setTagsLoading(false);
            })
        });
    }

    function deleteSectionAction(validation: boolean) {
        if (!validation) {
            setShowPopupDelete(false);
            return;
        }
        setLoading(true);
        const id = parseInt(sectionId as string);
        deleteSection(id).then(() => {
            router.push('/secure/pages/' + section?.page_id);
        }).catch((error : Error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error.message);
            setShowPopup(true);
        })
    }

    function beginModifyElementOrder() {
        setModifyElementOrder(true);
    }

    function cancelModifyElementOrder() {
        setElementsLoading(true);
        async function loadData() {
            setElements(await getElementsForSection(parseInt(sectionId as string)));
            setElementsLoading(false);
        }
        loadData();
        setModifyElementOrder(false);
    }

    function validateModifyElementOrder() {
        setElementsLoading(true);
        async function loadData() {
            if (!elements) {
                return;
            }
            for (const elem of elements) {
                if (modifiedElements && modifiedElements.includes(elem.id)) {
                    await changeElementPosition(elem.id, elem.position);
                }
            }
            setElements(await getElementsForSection(parseInt(sectionId as string)));
            setElementsLoading(false);
        }
        loadData();
        setModifyElementOrder(false);
    }

    function moveElementUp(elem : ElementBd) {
        if (!elements) {
            return;
        }
        const newElements : ElementBd[] = [...elements];

        if (elem.position === 1) {
            return;
        }

        const modElem : number[] = [...modifiedElements];
        modElem?.push(newElements.find(s => s.position === elem.position - 1)!.id);
        modElem?.push(elem.id);
        setModifiedElements(modElem)

        newElements.find(s => s.position === elem.position - 1)!.position++;
        newElements.find(s => s.id === elem.id)!.position--;
        newElements.sort((a, b) => a.position - b.position);
        setElements(newElements);
    }

    function moveElementDown(elem : ElementBd) {
        if (!elements) {
            return;
        }
        const newElements : ElementBd[] = [...elements];

        if (elem.position === elements.length) {
            return;
        }

        const modElem : number[] = [...modifiedElements];
        modElem?.push(newElements.find(s => s.position === elem.position + 1)!.id);
        modElem?.push(elem.id);
        setModifiedElements(modElem)

        newElements.find(s => s.position === elem.position + 1)!.position--;
        newElements.find(s => s.id === elem.id)!.position++;
        newElements.sort((a, b) => a.position - b.position);
        setElements(newElements);
    }

    if (loading || !section) {
        return (
            <div>
                <PageTitle title={""}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main className={"justify-start"}>
            <PageTitle title={section.title}/>
            <h3>Type</h3>
            <div className={"flex flex-col justify-center items-center gap-3 p-2 rounded-xl bg-dark"}>
                <p>{type?.name}</p>
            </div>
            <h3>Tags</h3>
            <div className={"flex flex-wrap gap-2"}>
                {
                    tagsLoading ? <DivLoading/> :
                        tags.map((tag) => {
                            return (
                                <div key={tag.id}
                                     className={"pt-1 pb-1 pl-2 pr-2 rounded-3xl bg-dark flex gap-2"}>
                                    <p>{tag.name}</p>
                                    <img src={"/ico/trash.svg"} alt={"trash"}
                                         className={"cursor-pointer p-1 h-6 invert rounded-3xl active:bg-foreground md:hover:bg-foreground"}
                                         onClick={() => removeTagAction(tag.id)}/>
                                </div>
                            )
                        })
                }
                {
                    tags.length === 0 && !tagsLoading && <p>Aucun tag</p>
                }
            </div>
            <button className={"w-fit"} onClick={() => setCreateTagPopup(true)}>
                Ajouter un tag
                <img src={"/ico/plus.svg"} alt={"plus"}/>
            </button>
            <h3>Éléments</h3>
            <div className={"flex w-full flex-wrap justify-center items-center flex-col gap-3 p-2 bg-dark rounded-[10px]"}>
                {
                    elementsLoading ? <DivLoading/> :
                        elements?.map((elem) => {
                            return (
                                <div
                                    onClick={() => !modifyElementOrder && router.push("/secure/pages/" + pageId + "/sections/" + sectionId + "/elements/" + elem.id)}
                                    className={`w-full p-2 rounded-[5px] ${!modifyElementOrder ? "cursor-pointer active:bg-darkHover md:hover:bg-darkHover" : "cursor-default"} flex gap-3`}
                                    key={elem.id}>
                                    <div className={"flex gap-3 items-center flex-wrap overflow-hidden"}>
                                        {
                                            modifyElementOrder &&
                                            <div className={"flex gap-1"}>
                                                <div onClick={() => moveElementUp(elem)} className={"rounded-3xl flex justify-center items-center h-10 w-10 bg-backgroundHover active:bg-dark md:hover:bg-dark cursor-pointer"}>
                                                    <img className={"w-4 h-4 invert"} src={"/ico/up.svg"} alt={"up"}/>
                                                </div>
                                                <div onClick={() => moveElementDown(elem)} className={"rounded-3xl flex justify-center items-center h-10 w-10 bg-backgroundHover active:bg-dark md:hover:bg-dark cursor-pointer"}>
                                                    <img className={"w-4 h-4 invert"} src={"/ico/down.svg"} alt={"down"}/>
                                                </div>
                                            </div>
                                        }
                                        <p className={"h-10 w-10 rounded-[100px] bg-backgroundHover flex justify-center items-center"}>{elem.position}</p>
                                        <p className={"h-10 flex w-fit rounded-[100px] pl-3 pr-3 bg-backgroundHover  justify-center items-center"}>{elementTypes.find(t => t.id === elem.type_id)?.name}</p>
                                        <p>{elem.content.length > maxContentLength ? elem.content.slice(0, maxContentLength) + "..." : elem.content}</p>
                                    </div>
                                </div>
                            )
                        })
                }

                {
                    (!elementsLoading && (!elements || elements.length === 0)) &&
                    <p>Pas d&apos;éléments</p>
                }
            </div>

            <div className={"flex gap-3"}>
                {
                    modifyElementOrder &&
                    <button className={"bg-red-500 hover:bg-red-400"} onClick={cancelModifyElementOrder}>
                        Annuler
                        <img src={"/ico/close.svg"} alt={"close"}/>

                    </button>
                }
                <button onClick={modifyElementOrder ? validateModifyElementOrder : beginModifyElementOrder}>
                    {
                        modifyElementOrder ? "Valider le nouvel ordre" : "Modifier l'ordre"
                    }
                    {
                        modifyElementOrder ? <img src={"/ico/check.svg"} alt={"validate"}/> :
                            <img src={"/ico/edit.svg"} alt={"edit"}/>
                    }
                </button>
                {
                    !modifyElementOrder &&
                    <button className={"w-fit"}
                            onClick={() => router.push("/secure/pages/" + pageId + "/sections/" + sectionId + "/elements/new")}>
                        Ajouter un nouvel élément
                        <img src={"/ico/plus.svg"} alt={"plus"}/>
                    </button>
                }
            </div>

            <div className={"flex gap-3 p-4 rounded-xl bg-backgroundHover"}>
                <button onClick={() => router.push("/secure/pages/" + pageId + "/sections/" + sectionId + "/edit")}>
                    Modifier
                    <img src={"/ico/edit.svg"} alt={"edit"}/>
                </button>
                <button className={"bg-red-500 hover:bg-red-400"} onClick={() => setShowPopupDelete(true)}>
                    Supprimer
                    <img src={"/ico/trash.svg"} alt={"trash"}/>
                </button>

            </div>
            <ValidationPopup showValidationPopup={showPopupDelete} onClose={deleteSectionAction}
                             objectToDelete={section.title}/>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
            {
                createTagPopup && <CreateTag onValidate={onCreateTag} sectionId={section.id}/>
            }
        </main>
    );
}