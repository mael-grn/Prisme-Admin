"use client"

import {ElementBd, ElementType, getTypes} from "@/app/controller/elementController";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import {deleteSection, getSection, getSectionType, Section} from "@/app/controller/sectionController";
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

export default function SectionVisu() {
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState<ElementType | null>(null);
    const [section, setSection] = useState<Section | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [elementTypes, setElementTypes] = useState<ElementType[]>([]);
    const [elements, setElements] = useState<ElementBd[]>([]);

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
            setSection(sect);
            setTags(await getTagsForSection(parseInt(sectionId as string)));
            setElementTypes(await getTypes());
            setElements(await getElementsForSection(parseInt(sectionId as string)));
            if (sect) setType(await getSectionType(sect.type_id))
        }

        loadData().finally(() => {
            setLoading(false);
        })
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
        setLoading(true)
        allTheStuffToDo().finally(() => {
            setLoading(false);
        })
    }

    function removeTagAction(id: number) {
        setLoading(true);
        removeTagFromSection(parseInt(sectionId as string), id).then(() => {
            getTagsForSection(parseInt(sectionId as string)).then((res) => {
                setTags(res);
            }).finally(() => {
                setLoading(false);
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

    if (loading || !section) {
        return (
            <div>
                <PageTitle title={"..."}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main className={"justify-start"}>
            <PageTitle title={section.title}/>
            <div className={"flex flex-col items-center gap-3 w-full"}>
                <h1>Type</h1>
                <div className={"flex flex-col justify-center items-center gap-3 p-4 rounded-xl bg-dark"}>
                    <p>{type?.name}</p>
                </div>
            </div>
                <div className={"flex flex-col items-center gap-3 w-full"}>
                    <h1>Tags</h1>
                    <div className={"flex flex-col justify-center items-center gap-3 p-4 rounded-xl bg-dark"}>

                        <div className={"flex flex-wrap gap-2"}>
                            {
                                tags.map((tag) => {
                                    return (
                                        <div key={tag.id}
                                             className={"pt-2 pb-2 pl-4 pr-4 rounded-3xl bg-darkHover flex gap-2"}>
                                            <p>{tag.name}</p>
                                            <img src={"/ico/trash.svg"} alt={"trash"}
                                                 className={"cursor-pointer p-1 h-6 invert rounded-3xl hover:bg-foreground"}
                                                 onClick={() => removeTagAction(tag.id)}/>
                                        </div>
                                    )
                                })
                            }
                            {
                                tags.length === 0 && <p>Aucun tag</p>
                            }
                        </div>
                    </div>
                    <button className={"w-fit"} onClick={() => setCreateTagPopup(true)}>
                        Ajouter un tag
                        <img src={"/ico/plus.svg"} alt={"plus"}/>
                    </button>
                    <h1 className={"mt-12"}>Éléments</h1>
                    <div className={"flex flex-col justify-center items-center gap-3 p-4 rounded-xl bg-dark"}>

                        <div className={"flex w-full justify-center items-center flex-col gap-3"}>
                            {
                                elements?.map((elem) => {
                                    return (
                                        <div
                                            onClick={() => router.push("/secure/pages/" + pageId + "/sections/" + sectionId + "/elements/" + elem.id)}
                                            className={"w-full cursor-pointer p-3 rounded-xl hover:bg-darkHover flex gap-3"}
                                            key={elem.id}>
                                            <div className={"flex gap-3 items-center"}>
                                                <p className={"h-10 w-10 rounded-[100px] bg-backgroundHover flex justify-center items-center"}>#{elem.position}</p>
                                                <h2>{elementTypes.find(t => t.id === elem.type_id)?.name}</h2>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            {
                                !elements || elements.length === 0 &&
                                <p>Pas d&apos;éléments</p>
                            }
                        </div>
                    </div>
                    <button className={"w-fit"}
                            onClick={() => router.push("/secure/pages/" + pageId + "/sections/" + sectionId + "/elements/new")}>
                        Ajouter un nouvel élément
                        <img src={"/ico/plus.svg"} alt={"plus"}/>
                    </button>
                </div>


                <div className={"flex gap-3 mt-24 p-4 rounded-xl bg-backgroundHover"}>
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
                                 objectToDelete={"section #" + section.position}/>
                <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
                {
                    createTagPopup && <CreateTag onValidate={onCreateTag} sectionId={section.id}/>
                }
        </main>
);
}