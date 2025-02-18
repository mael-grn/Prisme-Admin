"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import Popup from "@/app/components/popup";
import {
    ElementType,
    getElement,
    getType, updateElement
} from "@/app/controller/elementController";
import {put} from "@vercel/blob";

export default function EditElement() {

    const [type, setType] = useState<ElementType | null>(null);
    const [content, setContent] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const router = useRouter();
    const {elementId} = useParams();

    useEffect(() => {
        async function loadData() {
            const elem = await getElement(parseInt(elementId as string))
            setType(await getType(elem?.type_id || 0));
            setContent(elem?.content || '');
        }

        loadData().finally(() => setLoading(false));
    }, [elementId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    function editElementAction() {
        setLoading(true);
        if (type?.name === 'image') {
            if (selectedFile === null) {
                setPopupTitle("Erreur");
                setPopupText("Il manque une image");
                setShowPopup(true);
                setLoading(false);
                return;
            }
            uploadImage().then((res) => {
                if (res) {
                    updateElement(parseInt(elementId as string), res).then(() => {
                        router.back();
                    }).catch((error : Error) => {
                        setLoading(false);
                        setPopupTitle("Erreur");
                        setPopupText(error.message);
                        setShowPopup(true);
                    })
                } else {
                    return;
                }
            });
        } else {
            if (content === '') {
                setPopupTitle("Erreur");
                setPopupText("Il faut entrer du contenu.");
                setShowPopup(true);
                setLoading(false);
                return;
            }

            updateElement(parseInt(elementId as string), content).then(() => {
                router.back();
            }).catch((error : Error) => {
                setLoading(false);
                setPopupTitle("Erreur");
                setPopupText(error.message);
                setShowPopup(true);
            })
        }
    }

    async function uploadImage() : Promise<string | null> {
        if (!selectedFile) {
            return null;
        }
        const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        try {
            const blobRes = await put(selectedFile.name, selectedFile, {
                access: 'public',
                token: token,
            });
            return blobRes.url;
        } catch (error) {
            setPopupTitle("Erreur");
            setPopupText((error as Error).message);
            setShowPopup(true);
            return null;
        }
    }

    if (loading) {
        return (
            <div>
                <PageTitle title={"Modification"}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main className={"justify-center items-center"}>
            <PageTitle title={"Modification"}/>

            <p>Nouveau contenu :</p>
            {
                type?.name === 'image' ? <div>
                        <label htmlFor={"file-input"}>
                            <div
                                className={"h-36 w-56 bg-dark rounded-2xl flex flex-col justify-center items-center gap-3 cursor-pointer"}>
                                <img className={"invert w-12 h-12"} src={"/ico/cloud.svg"} alt={"cloud"}/>
                                {
                                    selectedFile ? <p>{selectedFile.name}</p> : <p>Choisir une image</p>
                                }
                            </div>
                        </label>
                        <input
                            className={"hidden"}
                            type={"file"}
                            id={"file-input"}
                            onChange={handleFileChange}
                            accept={"image/*"}/>
                    </div> :
                    type?.name === 'texte' ? <textarea placeholder={"Contenu"} value={content || ''}
                                                               onChange={(e) => setContent(e.target.value)}/> :
                        type?.name === 'lien' || type?.name === 'titre' ?
                            <input placeholder={type.name} type={"text"} value={content || ''} onChange={(e) => setContent(e.target.value)}/> :
                            <p>Aucun type valide n&apos;a été sélectionné.</p>
            }
            <button disabled={(type?.name === "image" && selectedFile === null) || (content === null || content === "")} onClick={editElementAction}>Valider</button>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    )
}