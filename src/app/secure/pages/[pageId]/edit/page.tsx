"use client"

import {useEffect, useState} from "react";
import {getPage, Page, updatePage} from "@/app/controller/pageController";
import {useParams, useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import Popup from "@/app/components/popup";

export default function NewPage() {

    const [title, setTitle] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [page, setPage] = useState<Page | null>(null);

    const router = useRouter();
    const { pageId } = useParams();

    useEffect(() => {
        const id = parseInt(pageId as string);
        getPage(id).then((res) => {
            setPage(res)
            setTitle(res ? res.title : "");
        }).finally(() => {
            setLoading(false);
        })
    }, [pageId]);

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
            <p  className={"text-center"}>Entrez ci-dessous le nouveau titre : </p>
            <input placeholder={"titre"} type={"text"} value={title} onChange={(e) => setTitle(e.target.value)}/>
            <button disabled={!title || title === ""} onClick={updatePageAction}>
                Valider
                <img src={"/ico/check.svg"} alt={"check"}/>
            </button>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    )
}