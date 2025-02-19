"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {deletePage, getPage, Page} from "@/app/controller/pageController";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import {
    changeSectionPosition,
    getSectionsForPage,
    getSectionTypes,
    Section,
    SectionType
} from "@/app/controller/sectionController";
import Popup from "@/app/components/popup";
import ValidationPopup from "@/app/components/validationPopup";
import DivLoading from "@/app/components/divLoading";

export default function PageVisu() {
    const [loading, setLoading] = useState(true);
    const [sectionsLoading, setSectionsLoading] = useState(true);
    const [page, setPage] = useState<Page | null>(null);
    const [sectionTypes, setSectionTypes] = useState<SectionType[] | null>([]);
    const [sections, setSections] = useState<Section[] | null>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);
    const [modifySectionOrder, setModifySectionOrder] = useState<boolean>(false);
    const [modifiedSections, setModifiedSections] = useState<number[]>([]);

    const router = useRouter();
    const { pageId } = useParams();

    useEffect(() => {
        async function loadData() {
            setPage(await getPage(parseInt(pageId as string)))
            setLoading(false);
            setSections(await getSectionsForPage(parseInt(pageId as string)));
            setSectionTypes(await getSectionTypes());
            setSectionsLoading(false);
        }
        loadData();
    }, [pageId]);

    function deletePageAction(validation : boolean) {
        if (!validation) {
            setShowPopupDelete(false);
            return;
        }
        setLoading(true);
        const id = parseInt(pageId as string);
        deletePage(id).then(() => {
            router.push('/secure/pages');
        }).catch((error : Error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error.message);
            setShowPopup(true);
        })
    }

    function beginModifySectionOrder() {
        setModifySectionOrder(true);
    }

    function cancelModifySectionOrder() {
        setSectionsLoading(true);
        async function loadData() {
            setSections(await getSectionsForPage(parseInt(pageId as string)));
            setSectionsLoading(false);
        }
        loadData();
        setModifySectionOrder(false);
    }

    function validateModifySectionOrder() {
        setSectionsLoading(true);
        async function loadData() {
            if (!sections) {
                return;
            }
            for (const sect of sections) {
                if (modifiedSections && modifiedSections.includes(sect.id)) {
                    await changeSectionPosition(sect.id, sect.position);
                }
            }
            setSections(await getSectionsForPage(parseInt(pageId as string)));
            setSectionsLoading(false);
        }
        loadData();
        setModifySectionOrder(false);
    }

    function moveSectionUp(section : Section) {
        if (!sections) {
            return;
        }
        const newSections : Section[] = [...sections];
        if (section.position === 1) {
            return;
        }

        const modSect : number[] = [...modifiedSections];
        modSect?.push(newSections.find(s => s.position === section.position - 1)!.id);
        modSect?.push(section.id);
        setModifiedSections(modSect)

        newSections.find(s => s.position === section.position - 1)!.position++;
        newSections.find(s => s.id === section.id)!.position--;
        newSections.sort((a, b) => a.position - b.position);
        setSections(newSections);
    }

    function moveSectionDown(section : Section) {
        if (!sections) {
            return;
        }
        const newSections : Section[] = [...sections];
        if (section.position === sections.length) {
            return;
        }

        const modSect : number[] = [...modifiedSections];
        modSect?.push(newSections.find(s => s.position === section.position + 1)!.id);
        modSect?.push(section.id);
        setModifiedSections(modSect)

        newSections.find(s => s.position === section.position + 1)!.position--;
        newSections.find(s => s.id === section.id)!.position++;
        newSections.sort((a, b) => a.position - b.position);
        setSections(newSections);
    }

    if (loading || !page) {
        return (
            <div>
                <PageTitle title={""}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main>
            <PageTitle title={page.title}/>
            <h3>Sections</h3>
            <div className={"flex w-full flex-col gap-3 bg-dark p-2 rounded-xl"}>
                {
                    sectionsLoading ? <DivLoading/> :
                    sections?.map((sect) => {
                        return (
                            <div
                                onClick={() => !modifySectionOrder && router.push("/secure/pages/" + pageId + "/sections/" + sect.id)}
                                className={`p-2 rounded-xl active:bg-darkHover md:hover:bg-darkHover ${!modifySectionOrder ? "cursor-pointer hover:bg-darkHover" : "cursor-default"}`} key={sect.id}>
                                <div className={"flex gap-1 items-center relative flex-wrap"}>
                                    {
                                        modifySectionOrder &&
                                        <div className={"flex gap-1"}>
                                            <div onClick={() => moveSectionUp(sect)} className={"rounded-3xl flex justify-center items-center h-10 w-10 bg-backgroundHover active:bg-dark md:hover:bg-dark cursor-pointer"}>
                                                <img className={"w-4 h-4 invert"} src={"/ico/up.svg"} alt={"up"}/>
                                            </div>
                                            <div onClick={() => moveSectionDown(sect)} className={"rounded-3xl flex justify-center items-center h-10 w-10 bg-backgroundHover active:bg-dark md:hover:bg-dark cursor-pointer"}>
                                                <img className={"w-4 h-4 invert"} src={"/ico/down.svg"} alt={"down"}/>
                                            </div>
                                        </div>
                                    }
                                    <p className={"h-10 w-10 rounded-[100px] bg-backgroundHover flex justify-center items-center"}>{sect.position}</p>
                                    <p className={"min-h-10 pt-2 pb-2 mr-4 w-fit pl-4 pr-4 rounded-[100px] bg-backgroundHover flex justify-center items-center"}>{(sectionTypes?.find(t => t.id === sect.type_id)?.name)}</p>
                                    <p>{sect.title}</p>
                                </div>
                            </div>
                        )
                    })
                }

                {
                    (!sections || sections.length === 0) && !sectionsLoading && <h2 className={"w-full text-center p-12"}>Pas de sections</h2>
                }
            </div>
            <div className={"flex gap-3"}>
                {
                    modifySectionOrder &&
                    <button className={"bg-red-500 hover:bg-red-400"} onClick={cancelModifySectionOrder}>
                        Annuler
                        <img src={"/ico/close.svg"} alt={"close"}/>

                    </button>
                }
                <button onClick={modifySectionOrder ? validateModifySectionOrder : beginModifySectionOrder}>
                    {
                        modifySectionOrder ? "Valider le nouvel ordre" : "Modifier l'ordre"
                    }
                    {
                        modifySectionOrder ? <img src={"/ico/check.svg"} alt={"validate"}/> :
                            <img src={"/ico/edit.svg"} alt={"edit"}/>
                    }
                </button>
                {
                    !modifySectionOrder &&
                    < button onClick={() => router.push("/secure/pages/" + pageId + "/sections/new")}>
                    Nouvelle section
                    <img src={"/ico/plus.svg"} alt={"plus"}/>
                    </button>
                }

            </div>


            <div className={"flex gap-3  p-4 rounded-xl bg-backgroundHover"}>
                <button onClick={() => router.push("/secure/pages/" + pageId + "/edit")}>
                Modifier
                    <img src={"/ico/edit.svg"} alt={"edit"}/>
                </button>
                <button className={"bg-red-500 hover:bg-red-400"} onClick={() => setShowPopupDelete(true)}>
                    Supprimer
                    <img src={"/ico/trash.svg"} alt={"trash"}/>

                </button>

            </div>
            <ValidationPopup showValidationPopup={showPopupDelete} onClose={deletePageAction}
                             objectToDelete={page.title}/>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    );
}