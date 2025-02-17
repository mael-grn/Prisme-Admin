"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import Popup from "@/app/components/popup";
import {getSection, Section, updateSection} from "@/app/controller/sectionController";

export default function NewPage() {

    const [title, setTitle] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [section, setSection] = useState<Section | null>(null);

    const router = useRouter();
    const { sectionId } = useParams();

    useEffect(() => {
        const id = parseInt(sectionId as string);
        getSection(id).then((res) => {
            setSection(res)
            setTitle(res ? res.title : "");
        }).finally(() => {
            setLoading(false);
        })
    }, [sectionId]);

    function updateSectionAction() {
        const id = parseInt(sectionId as string);
        setLoading(true);
        if (title === '') {
            setPopupTitle("Erreur");
            setPopupText("Le titre ne peut pas être vide");
            setShowPopup(true);
            setLoading(false);
            return;
        }
        updateSection(id, title).then(() => {
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
        <main>
            <PageTitle title={"Modification"}/>
            <h1 className={"text-center"}>{section?.title}</h1>
            <p  className={"text-center"}>Entrez ci-dessous le nouveau titre : </p>
            <input placeholder={"titre"} type={"text"} value={title} onChange={(e) => setTitle(e.target.value)}/>
            <button disabled={!title || title === ""} onClick={updateSectionAction}>
                Valider
                <img src={"/ico/check.svg"} alt={"check"}/>
            </button>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    )
}