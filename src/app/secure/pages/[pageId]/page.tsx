"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {deletePage, getPage, Page} from "@/app/controller/pageController";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import {getSectionsForPage, getSectionTypes, Section, SectionType} from "@/app/controller/sectionController";
import Popup from "@/app/components/popup";
import ValidationPopup from "@/app/components/validationPopup";

export default function PageVisu() {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<Page | null>(null);
    const [sectionTypes, setSectionTypes] = useState<SectionType[] | null>([]);
    const [sections, setSections] = useState<Section[] | null>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);

    const router = useRouter();
    const { pageId } = useParams();

    useEffect(() => {
        async function loadData() {
            setPage(await getPage(parseInt(pageId as string)))
            setSections(await getSectionsForPage(parseInt(pageId as string)));
            setSectionTypes(await getSectionTypes());
        }
        loadData().finally(() => setLoading(false));
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

    if (loading || !page) {
        return (
            <div>
                <PageTitle title={"..."}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main>
            <PageTitle title={page.title}/>
            <div className={"flex md:w-2/3 w-full flex-col gap-3 bg-dark p-4 rounded-xl"}>
                {
                    sections?.map((sect) => {
                        return (
                            <div
                                onClick={() => router.push("/secure/pages/" + pageId + "/sections/" + sect.id)}
                                className={"cursor-pointer p-3 rounded-xl hover:bg-darkHover"} key={sect.id}>
                                <div className={"flex gap-1 items-center"}>
                                    <p className={"h-10 w-10 rounded-[100px] bg-backgroundHover flex justify-center items-center"}>#{sect.position}</p>
                                    <p className={"h-10 mr-4 w-fit pl-4 pr-4 rounded-[100px] bg-backgroundHover flex justify-center items-center"}>{(sectionTypes?.find(t => t.id === sect.type_id)?.name)}</p>
                                    <h2>{sect.title}</h2>
                                </div>
                            </div>
                        )
                    })
                }

                {
                    !sections || sections.length === 0 && <h2 className={"w-full text-center p-12"}>Pas de sections</h2>
                }
            </div>
            <button className={"mb-16"} onClick={() => router.push("/secure/pages/" + pageId + "/sections/new")}>
                Nouvelle section
                <img src={"/ico/plus.svg"} alt={"plus"}/>
            </button>

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