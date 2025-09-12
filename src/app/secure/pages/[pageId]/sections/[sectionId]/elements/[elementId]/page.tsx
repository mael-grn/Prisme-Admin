"use client"

import {
    deleteElement,
    ElementBd,
    ElementType,
    getElement,
    getType,
} from "@/app/service/elementService";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import { getSection, Section} from "@/app/service/sectionService";
import Popup from "@/app/components/popup";
import ValidationPopup from "@/app/components/validationPopup";

export default function ElementVisu() {
    
    const [loading, setLoading] = useState(true);
    const [section, setSection] = useState<Section | null>(null);
    const [element, setElement] = useState<ElementBd | null>(null);
    const [elementType, setElementType] = useState<ElementType | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);

    const router = useRouter();
    const { pageId, sectionId, elementId } = useParams();

    useEffect(() => {
        async function loadData() {
            setSection(await getSection(parseInt(sectionId as string)));
            const elem = await getElement(parseInt(elementId as string))
            setElement(elem);
            if (elem) {
                const type = await getType(elem.type_id);
                setElementType(type);
            }
        }

        loadData().finally(() => {
            setLoading(false);
        })
    }, [pageId, sectionId]);

    function deleteElementAction(validation : boolean) {
        if (!validation) {
            setShowPopupDelete(false);
            return;
        }
        setLoading(true);
        const id = parseInt(elementId as string);
        deleteElement(id).then(() => {
            router.push('/secure/pages/' + pageId + '/sections/' + sectionId);
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
            <PageTitle title={"#" + element?.position + " " + elementType?.name}/>
            <h3>Type</h3>
            <p className={"pt-2 pb-2 pr-3 pl-3 rounded-xl bg-dark"}>{elementType?.name}</p>
            <h3>Contenu</h3>
            <div className={"p-4 rounded-xl bg-dark"}>
                {
                    elementType?.name === 'image' ? <img src={element?.content} alt={"image"}/> :
                        elementType?.name === 'lien' ? <a href={element?.content}>{element?.content}</a> :
                            <p>{element?.content}</p>
                }
            </div>

            <div className={"flex gap-3 p-4 rounded-xl bg-backgroundHover"}>
                <button
                    onClick={() => router.push("/secure/pages/" + pageId + "/sections/" + sectionId + "/elements/" + elementId + "/edit")}>
                    Modifier
                    <img src={"/ico/edit.svg"} alt={"edit"}/>
                </button>
                <button className={"bg-red-500 hover:bg-red-400"} onClick={() => setShowPopupDelete(true)}>
                    Supprimer
                    <img src={"/ico/trash.svg"} alt={"trash"}/>
                </button>

            </div>
            <ValidationPopup showValidationPopup={showPopupDelete} onClose={deleteElementAction}
                             objectToDelete={"élément #" + element?.position}/>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    );
}