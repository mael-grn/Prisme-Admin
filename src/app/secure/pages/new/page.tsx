"use client"

import {useState} from "react";
import {addPage} from "@/app/controller/pageController";
import {useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import Popup from "@/app/components/popup";

export default function NewPage() {

    const [title, setTitle] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const router = useRouter();

    function addPageAction() {
        setLoading(true);
        if (title === '') {
            setPopupTitle("Erreur");
            setPopupText("Le titre ne peut pas être vide");
            setShowPopup(true);
            setLoading(false);
            return;
        }
        addPage(title).then(() => {
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
                <PageTitle title={"Nouvelle page"}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main>
            <PageTitle title={"Nouvelle page"}/>
            <h1 className={"text-center"}>Ajouter une page</h1>
            <p  className={"text-center"}>Entrez ci-dessous le titre de la nouvelle page : </p>
            <input placeholder={"titre"} type={"text"} value={title} onChange={(e) => setTitle(e.target.value)}/>
            <button disabled={!title || title === ""} onClick={addPageAction}>
                Valider
                <img src={"/ico/check.svg"} alt={"check"}/>
            </button>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    )
}