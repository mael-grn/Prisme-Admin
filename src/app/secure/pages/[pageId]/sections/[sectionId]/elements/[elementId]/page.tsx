"use client"

import {
    deleteElement,
    ElementBd,
    ElementType,
    getElementById,
    getType,
    getTypes,
    updateElement, updateElementType,
} from "@/app/service/elementService";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import PageTitle from "@/app/components/pageTitle";
import PageLoading from "@/app/components/pageLoading";
import {getSection, Section} from "@/app/service/sectionService";
import Popup from "@/app/components/popup";
import ValidationPopup from "@/app/components/validationPopup";
import MainPage, {PageAlignmentEnum} from "@/app/components/mainPage";
import SectionElem from "@/app/components/sectionElem";
import {ActionTypeEnum} from "@/app/components/Button";
import AdvancedPopup from "@/app/components/advancedPopup";
import {StringUtil} from "@/app/util/stringUtil";
import LoadingPopup from "@/app/components/loadingPopup";
import {put} from "@vercel/blob";
import DropDown from "@/app/components/DropDown";
import Input from "@/app/components/Input";
import Form from "@/app/components/form";

export default function ElementVisu() {
    
    const [loading, setLoading] = useState(true);
    const [section, setSection] = useState<Section | null>(null);
    const [element, setElement] = useState<ElementBd | null>(null);
    const [elementType, setElementType] = useState<ElementType | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);
    const [showPopupEditType, setShowPopupEditType] = useState<boolean>(false);
    const [showPopupEditContent, setShowPopupEditContent] = useState<boolean>(false);
    const [newType, setNewType] = useState<ElementType | null>(null);
    const [newContent, setNewContent] = useState<string>('');
    const [newSelectedFile, setNewSelectedFile] = useState<File | null>(null);
    const [newImageSrc, setNewImageSrc] = useState<string | null>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [elementTypes, setElementTypes] = useState<ElementType[]>([]);

    const [typeLoading, setTypeLoading] = useState<boolean>(false);
    const [contentLoading, setContentLoading] = useState<boolean>(false);

    const router = useRouter();
    const { pageId, sectionId, elementId } = useParams();

    useEffect(() => {
        async function loadData() {
            setSection(await getSection(parseInt(sectionId as string)));
            const elem = await getElementById(parseInt(elementId as string))
            setElement(elem);
            if (elem) {
                const type = await getType(elem.type_id);
                setNewType(type);
                setNewContent(elem.content);
                setElementType(type);
            }
            setElementTypes(await getTypes());
        }

        loadData().finally(() => {
            setLoading(false);
        })
    }, [pageId, sectionId]);

    function deleteElementAction() {
        setShowPopupDelete(false);
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

    function editTypeAction() {
        setShowPopupEditType(false);
        setTypeLoading(true)
        updateElementType(parseInt(elementId as string), newType).then( async () => {
            const elem = await getElementById(parseInt(elementId as string))
            setElement(elem);
            if (elem) {
                const type = await getType(elem.type_id);
                setElementType(type);
            }
        }).catch((error : Error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error.message);
            setShowPopup(true);
        }).finally(() => setTypeLoading(false))
    }

    function editContentAction() {
        setShowPopupEditContent(false);
        setContentLoading(true)

        if (elementType?.name === 'image') {
            if (newSelectedFile === null) {
                setPopupTitle("Erreur");
                setPopupText("Il manque une image");
                setShowPopup(true);
                setLoading(false);
                return;
            }
            uploadImage().then((res) => {
                if (res) {
                    updateElement(parseInt(elementId as string), res).then( async () => {
                        const elem = await getElementById(parseInt(elementId as string))
                        setElement(elem);
                        if (elem) {
                            const type = await getType(elem.type_id);
                            setElementType(type);
                        }
                    }).catch((error : Error) => {
                        setLoading(false);
                        setPopupTitle("Erreur");
                        setPopupText(error.message);
                        setShowPopup(true);
                    }).finally(() => setContentLoading(false))
                } else {
                    return;
                }
            });
        } else {
            if (newContent === '') {
                setPopupTitle("Erreur");
                setPopupText("Il faut entrer du contenu.");
                setShowPopup(true);
                setLoading(false);
                return;
            }

            updateElement(parseInt(elementId as string), newContent).then( async () => {
                const elem = await getElementById(parseInt(elementId as string))
                setElement(elem);
                if (elem) {
                    const type = await getType(elem.type_id);
                    setElementType(type);
                }
            }).catch((error : Error) => {
                setLoading(false);
                setPopupTitle("Erreur");
                setPopupText(error.message);
                setShowPopup(true);
            }).finally(() => setContentLoading(false))
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDragEnter = () => {
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    async function uploadImage() : Promise<string | null> {
        if (!newSelectedFile) {
            return null;
        }
        const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        try {
            const blobRes = await put(newSelectedFile.name, newSelectedFile, {
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setNewSelectedFile(file);
            const tempUrl = URL.createObjectURL(file);
            setNewImageSrc(tempUrl);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setNewSelectedFile(file);
            const tempUrl = URL.createObjectURL(file);
            setNewImageSrc(tempUrl);
        }
    };

    if (loading || !section || !element) {
        return (
            <div>
                <LoadingPopup show={true} message={"Récuperation des informations..."}/>
            </div>
        )
    }

    return (
        <MainPage title={StringUtil.truncateString(element?.content || "", 20)} pageAlignment={PageAlignmentEnum.tileStart}>

            <SectionElem
                loading={typeLoading}
                title={"Type"}
                actions={[
                    {
                        text: "Modifier",
                        iconName: "edit",
                        onClick: () => setShowPopupEditType(true)
                    }
                ]}
            >
                <p>{elementType?.name}</p>
            </SectionElem>

            <SectionElem
                title={"Contenu"}
                loading={contentLoading}

                actions={[
                    {
                        text: "Modifier",
                        iconName: "edit",
                        onClick: () => setShowPopupEditContent(true)
                    }
                ]}
            >
                {
                    elementType?.name === 'image' ? <img src={element?.content} alt={"image"}/> :
                        elementType?.name === 'lien' ? <a href={element?.content}>{element?.content}</a> :
                            <p>{element?.content}</p>
                }
            </SectionElem>

            <SectionElem
                actionType={ActionTypeEnum.dangerous}
                title={"Suppression"}
                actions={[
                    {
                        text: "Supprimer",
                        iconName: "trash",
                        actionType: ActionTypeEnum.dangerous,
                        onClick: () => setShowPopupDelete(true)
                    }
                ]}
            >
                <p>Attention, cette action est définitive.</p>
            </SectionElem>

            <AdvancedPopup
                actions={[{iconName: "trash", text: "Supprimer", actionType: ActionTypeEnum.dangerous, onClick: deleteElementAction}]}
                icon={"warning"}
                show={showPopupDelete}
                message={"Cette action est irreversible. Vous perdrez le contenu de cet élément."}
                title={`Voulez-vous vraiment supprimer l'élément "${StringUtil.truncateString(element?.content || "", 50)}" ?`}
                closePopup={() => setShowPopupDelete(false)}
            />

            <Form onSubmitAction={ editContentAction }>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditContent}
                    message={"Saisissez le nouveau contenu de l'élément :"}
                    title={"Modifier l'élément"}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={ () => setShowPopupEditContent(false)}
                >

                    {
                        elementType?.name === 'image' ?

                            <div>
                                <label htmlFor={"file-input"}>
                                    <div

                                        className={`h-fit w-full relative p-3 rounded-lg flex justify-center items-center gap-3 cursor-pointer hover:bg-onBackgroundHover ${isDragging ? "bg-onBackgroundHover pt-10 pb-10" : "bg-background"}`}>

                                        {
                                            newSelectedFile ?

                                                <>
                                                    <img src={newImageSrc ||  ""} alt={"new image"} className={"h-12 rounded-lg"}/>
                                                    <p>{newSelectedFile.name}</p>
                                                </>


                                                :

                                                <>
                                                    <img className={"invert w-6 h-6"} src={"/ico/cloud.svg"} alt={"cloud"}/>
                                                    <p>Choisir une image</p>
                                                </>


                                        }
                                        <span
                                            className={"absolute w-full h-full top-0 left-0 bg-transparent"}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                        />
                                    </div>
                                </label>
                                <input
                                    className={"hidden"}
                                    type={"file"}
                                    id={"file-input"}
                                    onChange={handleFileChange}
                                    accept={"image/*"}/>
                            </div>

                            :

                            newType?.name === 'texte' ?

                                <textarea
                                    className={"bg-background focus:bg-onBackgroundHover md:hover:bg-onBackgroundHover active:bg-onBackgroundHover rounded-lg outline-0 p-2 w-full h-64 min-h-64 max-h-64 resize-none"}
                                    placeholder={"Contenu"}
                                    value={newContent || ''}
                                    onChange={(e) => setNewContent(e.target.value)}
                                />

                                :

                                newType?.name === 'lien' || newType?.name === 'titre' ?

                                    <Input
                                        placeholder={newType.name}
                                        value={newContent || ''}
                                        setValueAction={setNewContent}
                                    />

                                    :

                                    <p>Erreur : Type inconnu</p>
                    }
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={ editTypeAction }>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditType}
                    message={"Selectionnez le nouveau type de l'élément :"}
                    title={"Modifier l'élément"}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={ () => setShowPopupEditContent(false)}
                >
                    <DropDown
                        items={elementTypes.map((elem) => elem.name)}
                        selectedItem={newType?.name || "Selectionner un type"}
                        setSelectedItemAction={(newValue) => setNewType(elementTypes.find((et) => et.name === newValue) || null)}
                    />
                </AdvancedPopup>
            </Form>

            <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
        </MainPage>
    );
}