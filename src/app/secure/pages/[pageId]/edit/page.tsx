"use client"

import { useState} from "react";
import { updatePage} from "@/app/controller/pageController";
import {useParams, useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import Popup from "@/app/components/popup";

export default function NewPage() {

    const [title, setTitle] = useState<string>('/');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const router = useRouter();
    const { pageId } = useParams();



    function updatePageAction() {
        const id = parseInt(pageId as string);
        setLoading(true);
        if (title === '') {
            setPopupTitle("Erreur");
            setPopupText("Le titre ne peut pas être vide");
            setShowPopup(true);
            setLoading(false);
            return;
        }
        updatePage(id, title).then(() => {
            router.back();
        }).catch((error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error);
            setShowPopup(true);
        })
    }

    if (loading) {
        return (
            <div>
                <PageTitle title={"..."}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main className={"justify-center items-center"}>
            <PageTitle title={"Modification"}/>
            <p  className={"text-center"}>Entrez ci-dessous le nouvel endpoint : </p>
            <input placeholder={"endpoint"} type={"text"} value={title} onChange={(e) => setTitle(e.target.value)}/>
            <button disabled={!title || !title.startsWith("/")} onClick={updatePageAction}>
                Valider
                <img src={"/ico/check.svg"} alt={"check"}/>
            </button>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    )
}