"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import Popup from "@/app/components/popup";
import {addElement, ElementType, getTypes} from "@/app/controller/elementController";
import {put} from "@vercel/blob";

export default function NewElement() {

    const [types, setTypes] = useState<ElementType[]>([]);
    const [selectedType, setSelectedType] = useState<ElementType | null>(null);
    const [content, setContent] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const router = useRouter();
    const {sectionId} = useParams();

    useEffect(() => {
        async function loadData() {
            const types = await getTypes();
            setTypes(types);
            setSelectedType(types[0]);
        }

        loadData().finally(() => setLoading(false));
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    function addElementAction() {
        setLoading(true);
        if (selectedType?.name === 'image') {
            if (selectedFile === null) {
                setPopupTitle("Erreur");
                setPopupText("Il manque une image");
                setShowPopup(true);
                setLoading(false);
                return;
            }
            uploadImage().then((res) => {
                if (res) {
                    addElement(parseInt(sectionId as string), selectedType.id, res).then(() => {
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
            if (!selectedType || content === '') {
                setPopupTitle("Erreur");
                setPopupText("Il faut sélectionner un type et entrer du contenu.");
                setShowPopup(true);
                setLoading(false);
                return;
            }

            addElement(parseInt(sectionId as string), selectedType.id, content).then(() => {
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
                <PageTitle title={"Nouvel élément"}/>
                <PageLoading/>
            </div>
        )
    }

    return (
        <main>
            <PageTitle title={"Nouvel élément"}/>
            <h1 className={"text-center"}>Ajouter un élément</h1>
            <h2 className={"text-center"}>Type</h2>
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
            <h2>Contenu</h2>
            {
                selectedType?.name === 'image' ? <div>
                        <label htmlFor={"file-input"}>
                            <div
                                className={"h-56 w-56 bg-backgroundHover rounded-2xl flex flex-col justify-center items-center gap-3 cursor-pointer"}>
                                <img className={"invert w-24 h-24"} src={"/ico/cloud.svg"} alt={"cloud"}/>
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
                    selectedType?.name === 'texte' ? <textarea placeholder={"Contenu"} value={content || ''}
                                                               onChange={(e) => setContent(e.target.value)}/> :
                        selectedType?.name === 'lien' || selectedType?.name === 'titre' ?
                            <input placeholder={selectedType.name} type={"text"} value={content || ''}
                                   onChange={(e) => setContent(e.target.value)}/> :
                            <p>Aucun type valide n&apos;a été sélectionné.</p>
            }
            <button onClick={addElementAction}>Valider</button>
            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </main>
    )
}