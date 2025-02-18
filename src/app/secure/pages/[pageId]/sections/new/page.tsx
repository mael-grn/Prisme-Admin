"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import Popup from "@/app/components/popup";
import {addSection, getSectionTypes, SectionType} from "@/app/controller/sectionController";

export default function NewSection() {

    const [title, setTitle] = useState<string>('');
    const [types, setTypes] = useState<SectionType[]>([]);
    const [selectedType, setSelectedType] = useState<SectionType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const router = useRouter();
    const { pageId } = useParams();

    useEffect(() => {
        async function loadData() {
            const types = await getSectionTypes();
            setTypes(types);
            setSelectedType(types[0]);
        }
        loadData().finally(() => setLoading(false));
    }, []);

    function addSectonAction() {
        setLoading(true);
        if (title === '') {
            setPopupTitle("Erreur");
            setPopupText("Le titre ne peut pas être vide");
            setShowPopup(true);
            setLoading(false);
            return;
        }
        addSection(parseInt(pageId as string), title, selectedType?.id || 0).then(() => {
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
                <PageTitle title={"Nouvelle section"}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main className={"justify-center items-center"}>
            <PageTitle title={"Nouvelle section"}/>
            <div className={"flex items-center gap-3"}>
                <p>Type</p>
                <select
                    className={"text-foreground bg-backgroundHover focus:outline-0 p-3 rounded-xl"}
                    value={selectedType?.id ?? ''}
                    onChange={(e) => setSelectedType(types.find((t) => t.id === parseInt(e.target.value)) ?? null)}
                >
                    {types.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className={"flex items-center gap-3"}>
                <p>Titre</p>
                <input placeholder={"titre"} type={"text"} value={title} onChange={(e) => setTitle(e.target.value)}/>

            </div>
            <button disabled={!title || title === ""} onClick={addSectonAction}>
                Valider
                <img src={"/ico/check.svg"} alt={"check"}/>
            </button>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    )
}