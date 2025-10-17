"use client"

import {
    insertElement,
    changeElementPosition,
    ElementBd,
    ElementType,
    getElementsFromSection,
    getTypes, normalizeElementPositions
} from "@/app/service/elementService";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {
    deleteSection,
    getSection,
    getSectionType, getSectionTypes,
    Section,
    SectionType,
    updateSection
} from "@/app/service/sectionService";
import {
    addTag,
    addTagToSection,
    deleteTag,
    getTags,
    getTagsForSection,
    removeTagFromSection,
    Tag
} from "@/app/service/tagService";
import MainPage, {PageAlignmentEnum} from "@/app/components/mainPage";
import SectionElem, {SectionWeight, SectionWidth} from "@/app/components/sectionElem";
import {ActionTypeEnum} from "@/app/components/Button";
import List from "@/app/components/list";
import AdvancedPopup from "@/app/components/advancedPopup";
import LoadingPopup from "@/app/components/loadingPopup";
import Input from "@/app/components/Input";
import DropDown from "@/app/components/DropDown";
import {put} from "@vercel/blob";
import Form from "@/app/components/form";

const maxContentLength = 75;
export default function SectionVisu() {
    const [loading, setLoading] = useState(true);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [elementsLoading, setElementsLoading] = useState(true);
    const [type, setType] = useState<ElementType | null>(null);
    const [section, setSection] = useState<Section | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [sectionTags, setSectionTags] = useState<Tag[]>([]);
    const [sectionTypes, setSectionTypes] = useState<SectionType[]>([]);
    const [elementTypes, setElementTypes] = useState<ElementType[]>([]);
    const [elements, setElements] = useState<ElementBd[]>([]);
    const [modifyElementOrder, setModifyElementOrder] = useState<boolean>(false);
    const [modifiedElements, setModifiedElements] = useState<number[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);
    const [showPopupEditSection, setShowPopupEditPage] = useState<boolean>(false);
    const [showPopupNewElement, setShowPopupNewElement] = useState<boolean>(false);
    const [showPopupCreateTag, setShowPopupCreateTag] = useState<boolean>(false);
    const [newTag, setNewTag] = useState<string>("");
    const [deployTagList, setDeployTagList] = useState<boolean>(false);
    const [newSectionTitle, setNewSectionTitle] = useState<string>('');
    const [selectedSectionNewType, setSelectedSectionNewType] = useState<SectionType | null>(null);
    const [selectedElementType, setSelectedElementType] = useState<ElementType | null>(null);
    const [newElementContent, setNewElementContent] = useState<string>('');
    const [newElementSelectedFile, setNewElementSelectedFile] = useState<File | null>(null);
    const [newElementImageSrc, setNewElementImageSrc] = useState<string | null>(null);
    const [newElementIsDragging, setNewElementIsDragging] = useState<boolean>(false);
    const router = useRouter();
    const { pageId, sectionId } = useParams();

    useEffect(() => {
        async function loadData() {
            const sect = await getSection(parseInt(sectionId as string))
            if (sect) {
                const sectType = await getSectionType(sect.type_id);
                setType(sectType)
                setNewSectionTitle(sect.title)
                setSelectedSectionNewType(sectType)
            }
            setSection(sect);
            setSectionTypes(await getSectionTypes());
            setLoading(false);
            setTags(await getTags())
            setSectionTags(await getTagsForSection(parseInt(sectionId as string)));
            setTagsLoading(false);
            setElementTypes(await getTypes());
            setElements(await getElementsFromSection(parseInt(sectionId as string)));
            setElementsLoading(false);
        }
        loadData();
    }, [pageId, sectionId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setNewElementSelectedFile(file);
            const tempUrl = URL.createObjectURL(file);
            setNewElementImageSrc(tempUrl);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setNewElementIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setNewElementSelectedFile(file);
            const tempUrl = URL.createObjectURL(file);
            setNewElementImageSrc(tempUrl);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDragEnter = () => {
        setNewElementIsDragging(true);
    };

    const handleDragLeave = () => {
        setNewElementIsDragging(false);
    };

    function addElementAction() {
        setElementsLoading(true);
        setShowPopupNewElement(false);
        if (selectedElementType?.name === 'image') {
            if (newElementSelectedFile === null) {
                setPopupTitle("Erreur");
                setPopupText("Il manque une image");
                setShowPopup(true);
                setElementsLoading(false);
                return;
            }
            uploadImage().then((res) => {
                if (res) {
                    insertElement(parseInt(sectionId as string), selectedElementType.id, res).then(() => {
                        router.back();
                    }).catch((error : Error) => {
                        setElementsLoading(false);
                        setPopupTitle("Erreur");
                        setPopupText(error.message);
                        setShowPopup(true);
                    })
                } else {
                    return;
                }
            });
        } else {
            if (!selectedElementType || newElementContent === '') {
                setPopupTitle("Erreur");
                setPopupText("Il faut sélectionner un type et entrer du contenu.");
                setShowPopup(true);
                setElementsLoading(false);
                return;
            }

            insertElement(parseInt(sectionId as string), selectedElementType.id, newElementContent).then(() => {
                router.back();
            }).catch((error : Error) => {
                setElementsLoading(false);
                setPopupTitle("Erreur");
                setPopupText(error.message);
                setShowPopup(true);
            })
        }
    }

    async function uploadImage() : Promise<string | null> {
        if (!newElementSelectedFile) {
            return null;
        }
        const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        try {
            const blobRes = await put(newElementSelectedFile.name, newElementSelectedFile, {
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

    function updateSectionAction() {
        const id = parseInt(sectionId as string);
        setLoading(true);
        if (newSectionTitle === '' || !selectedSectionNewType) {
            return;
        }
        setShowPopupEditPage(false)
        updateSection(id, newSectionTitle, selectedSectionNewType).then(async () => {
            const sect = await getSection(parseInt(sectionId as string))
            if (sect) setType(await getSectionType(sect.type_id));
            setSection(sect);
        }).catch((error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {setLoading(false);});
    }

    function addTagAction(newTag: Tag) {
        setTagsLoading(true);
        addTagToSection(parseInt(sectionId as string), newTag.id).then( async () => {
            setTags(await getTags())
            setSectionTags(await getTagsForSection(parseInt(sectionId as string)));
        }).catch(() => {
            setPopupTitle("Erreur");
            setPopupText("Une erreur est survenue lors de l'ajout du tag à la section");
            setShowPopup(true);
        }).finally( () => {
            setTagsLoading(false);
        })
    }

    function removeTagAction(id: number) {
        setTagsLoading(true);
        removeTagFromSection(parseInt(sectionId as string), id).then(async () => {
            setTags(await getTags())
            setSectionTags(await getTagsForSection(parseInt(sectionId as string)));
        }).catch(() => {
            setPopupTitle("Erreur");
            setPopupText("Une erreur est survenue lors de l'ajout du tag à la section");
            setShowPopup(true);
        }).finally( () => {
            setTagsLoading(false);
        })
    }

    function deleteTagAction(id: number) {
        if (sectionTags.find(tag => tag.id === id)) {
            setPopupTitle("Erreur");
            setPopupText("Impossible de supprimer un tag utilisé par cette section");
            setShowPopup(true);
            return;
        }
        setTagsLoading(false)
        deleteTag(id).then(async () => {
            setTags(await getTags())
            setSectionTags(await getTagsForSection(parseInt(sectionId as string)));
        }).catch((e : Error) => {
            setPopupTitle("Erreur");
            setPopupText(e.message);
            setShowPopup(true);
        }).finally( () => {
            setTagsLoading(false);
        })
    }

    function addNewTagAction() {
        setTagsLoading(true)
        setShowPopupCreateTag(false);
        addTag(newTag).then(async () => {
            setTags(await getTags())
            setSectionTags(await getTagsForSection(parseInt(sectionId as string)));
            setNewTag("");
        }).catch((e : Error) => {
            setPopupTitle("Erreur");
            setPopupText(e.message);
            setShowPopup(true);
        }).finally(() => {
            setTagsLoading(false);
        })
    }

    function deleteSectionAction() {
        setLoading(true);
        const id = parseInt(sectionId as string);
        deleteSection(id).then(() => {
            router.push('/secure/pages/' + section?.page_id);
        }).catch((error : Error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error.message);
            setShowPopup(true);
        })
    }

    function beginModifyElementOrder() {
        setElementsLoading(true);
        async function loadData() {
            await normalizeElementPositions(parseInt(sectionId as string))
            setElements(await getElementsFromSection(parseInt(sectionId as string)));
            setElementsLoading(false);
        }
        loadData();
        setModifyElementOrder(true);
    }

    function cancelModifyElementOrder() {
        setElementsLoading(true);
        async function loadData() {
            setElements(await getElementsFromSection(parseInt(sectionId as string)));
            setElementsLoading(false);
        }
        loadData();
        setModifyElementOrder(false);
    }

    function validateModifyElementOrder() {
        setElementsLoading(true);
        async function loadData() {
            if (!elements) {
                return;
            }
            for (const elem of elements) {
                if (modifiedElements && modifiedElements.includes(elem.id)) {
                    await changeElementPosition(elem.id, elem.position);
                }
            }
            setElements(await getElementsFromSection(parseInt(sectionId as string)));
            setElementsLoading(false);
        }
        loadData();
        setModifyElementOrder(false);
    }

    function moveElementUp(elem : ElementBd) {
        if (!elements) {
            return;
        }
        const newElements : ElementBd[] = [...elements];

        if (elem.position === 1) {
            return;
        }

        const modElem : number[] = [...modifiedElements];
        modElem?.push(newElements.find(s => s.position === elem.position - 1)!.id);
        modElem?.push(elem.id);
        setModifiedElements(modElem)

        newElements.find(s => s.position === elem.position - 1)!.position++;
        newElements.find(s => s.id === elem.id)!.position--;
        newElements.sort((a, b) => a.position - b.position);
        setElements(newElements);
    }

    function moveElementDown(elem : ElementBd) {
        if (!elements) {
            return;
        }
        const newElements : ElementBd[] = [...elements];

        if (elem.position === elements.length) {
            return;
        }

        const modElem : number[] = [...modifiedElements];
        modElem?.push(newElements.find(s => s.position === elem.position + 1)!.id);
        modElem?.push(elem.id);
        setModifiedElements(modElem)

        newElements.find(s => s.position === elem.position + 1)!.position--;
        newElements.find(s => s.id === elem.id)!.position++;
        newElements.sort((a, b) => a.position - b.position);
        setElements(newElements);
    }

    if (loading || !section) {
        return (
            <div>
                <LoadingPopup show={true} message={"Récuperation des informations..."}/>
            </div>
        )
    }

    return (
        <MainPage title={section.title} pageAlignment={PageAlignmentEnum.tileStart}>
            <SectionElem
                title={"Informations"}
                actions={[
                    { iconName: "edit", text: "Modifier", onClick: () => setShowPopupEditPage(true) },
                    {
                        text: "Supprimer",
                        iconName: "trash",
                        onClick: () => setShowPopupDelete(true),
                        actionType: ActionTypeEnum.dangerous
                    },
                ]}
            >
                <p>Titre {section.title}</p>
                <p>Type : {type?.name}</p>
            </SectionElem>



            <SectionElem
                weight={SectionWeight.HEAVY}
                title={"Tags"}
                loading={tagsLoading}
                actions={[
                    { iconName: "add", text: "Créer", onClick: () => setShowPopupCreateTag(true) },
                ]}
            >
                <div className={`${deployTagList ? "max-h-fit  overflow-auto pb-20" : "max-h-48 overflow-hidden pb-0"} flex gap-2 flex-wrap  relative`}>
                    {tags.map((tag) => {
                        return (
                            <div key={tag.id}
                                 onClick={() => {
                                     if (sectionTags.find((sectTag) => sectTag.id == tag.id)) {
                                         removeTagAction(tag.id);
                                     } else {
                                         addTagAction(tag);
                                     }
                                 }}
                                 className={`p-1 gap-1 justify-center items-center w-fit cursor-pointer rounded-3xl ${sectionTags.find((sectTag) => sectTag.id == tag.id) ? "bg-safe active:bg-safeHover md:hover:bg-safeHover" : "bg-background md:hover:bg-onBackgroundHover active:bg-onBackgroundHover"} flex`}>
                                {
                                    sectionTags.find((sectTag) => sectTag.id == tag.id) &&
                                    <img src={"/ico/check.svg"} alt={"check"}
                                         className={` p-1 h-6`}/>
                                }
                                <p className={`${sectionTags.find((sectTag) => sectTag.id == tag.id) ? "text-background mr-2" : "text-foreground mr-1 ml-2"}`}>{tag.name}</p>
                                {
                                    !sectionTags.find((sectTag) => sectTag.id == tag.id) &&
                                    <img src={"/ico/trash.svg"} alt={"trash"}
                                         className={`cursor-pointer p-1 h-6 rounded-3xl bg-dangerous active:bg-dangerousHover md:hover:bg-dangerousHover`}
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             deleteTagAction(tag.id);
                                         }}/>
                                }

                            </div>
                        )
                    })}
                    <div className={"absolute bottom-0 left-0 h-16 w-full flex justify-center items-center bg-gradient-to-t from-onBackground to-transparent"}>
                        <div onClick={() => setDeployTagList(!deployTagList)} className={"flex justify-center items-center gap-1 rounded-3xl bg-foreground md:hover:bg-onForegroundHover active:bg-onForegroundHover p-2 cursor-pointer"}>
                            <img className={"h-4"} src={deployTagList ? "/ico/up.svg" : "/ico/down.svg"} alt={"deploy tags"}/>
                            <p className={"text-background text-sm"}>
                                {deployTagList ? "Réduire" : "Voir plus"}
                            </p>
                        </div>
                    </div>
                </div>

            </SectionElem>


            <SectionElem loading={elementsLoading} title={"Elements"} width={SectionWidth.FULL}
                         actions={modifyElementOrder ? [
                             {
                                 text: "Annuler",
                                 iconName: "close",
                                 onClick: cancelModifyElementOrder,
                                 actionType: ActionTypeEnum.dangerous
                             },
                             {
                                 text: "Valider",
                                 iconName: "check",
                                 onClick: validateModifyElementOrder,
                                 actionType: ActionTypeEnum.safe
                             }
                         ] : [
                             {
                                 text: "Réorganiser",
                                 iconName: "order",
                                 onClick: beginModifyElementOrder,
                             },
                             {
                                 text: "Ajouter",
                                 iconName: "add",
                                 actionType: ActionTypeEnum.safe,
                                    onClick: () => setShowPopupNewElement(true)
                             }
                         ]}>

                <List elements={elements?.map((elem) => {
                    return {text: elem.content, onClick: () => router.push("/secure/pages/" + pageId + "/sections/" + section.id + "/elements/" + elem.id),
                        actions: modifyElementOrder ? [{iconName: "up", onClick: () => moveElementUp(elem)}, {iconName: "down", onClick: () => moveElementDown(elem)}] : undefined}
                }) ?? []}/>

            </SectionElem>




            <AdvancedPopup
                show={showPopup}
                message={popupText}
                title={popupTitle}
                closePopup={() => setShowPopup(false)}
            />

            <AdvancedPopup
                actions={[{iconName: "trash", text: "Supprimer", actionType: ActionTypeEnum.dangerous, onClick: deleteSectionAction}]}
                icon={"warning"}
                show={showPopupDelete}
                message={"Cette action est irreversible. Vous perdrez également les elements que cette section contient."}
                title={`Voulez-vous vraiment supprimer la section "${section.title}" ?`}
                closePopup={() => setShowPopupDelete(false)}
            />

            <Form onSubmitAction={ updateSectionAction }>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditSection}
                    message={"Saisissez le nouveau type et titre de la section ci-dessous :"}
                    title={'Modifier la section'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={ () => setShowPopupEditPage(false)}
                >
                    <Input key={1} placeholder={"Nom"} value={newSectionTitle} setValueAction={setNewSectionTitle}/>
                    <DropDown
                        items={sectionTypes.map((sectionType) => sectionType.name)}
                        selectedItem={selectedSectionNewType?.name || 'Type de la section'}
                        setSelectedItemAction={(newValue) => setSelectedSectionNewType(sectionTypes.find((st) => st.name === newValue) || null)}
                    />
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={ addNewTagAction }>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupCreateTag}
                    message={"Saisissez le tag à créer :"}
                    title={'Créer un tag'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={ () => setShowPopupCreateTag(false)}
                >
                    <Input key={1} placeholder={"tag"} value={newTag} setValueAction={setNewTag}/>
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={ addElementAction }>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupNewElement}
                    message={"Saisissez le type et le contenu de l'élément ci-dessous :"}
                    title={'Créer un élément'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={ () => setShowPopupNewElement(false)}
                >
                    <div className={"flex gap-2 items-center"}>
                        <p>Type d'élément : </p>
                        <DropDown
                            items={elementTypes.map((elem) => elem.name)}
                            selectedItem={selectedElementType?.name || "Selectionner un type"}
                            setSelectedItemAction={(newValue) => setSelectedElementType(elementTypes.find((et) => et.name === newValue) || null)}
                        />
                    </div>

                    {
                        selectedElementType?.name === 'image' ?

                            <div>
                                <label htmlFor={"file-input"}>
                                    <div

                                        className={`h-fit w-full relative p-3 rounded-lg flex justify-center items-center gap-3 cursor-pointer hover:bg-onBackgroundHover ${newElementIsDragging ? "bg-onBackgroundHover pt-10 pb-10" : "bg-background"}`}>

                                        {
                                            newElementSelectedFile ?

                                                <>
                                                    <img src={newElementImageSrc ||  ""} alt={"new image"} className={"h-12 rounded-lg"}/>
                                                    <p>{newElementSelectedFile.name}</p>
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

                            selectedElementType?.name === 'texte' ?

                                <textarea
                                    className={"bg-background focus:bg-onBackgroundHover md:hover:bg-onBackgroundHover active:bg-onBackgroundHover rounded-lg outline-0 p-2 w-full h-64 min-h-64 max-h-64 resize-none"}
                                    placeholder={"Contenu"}
                                    value={newElementContent || ''}
                                    onChange={(e) => setNewElementContent(e.target.value)}
                                />

                                :

                                selectedElementType?.name === 'lien' || selectedElementType?.name === 'titre' ?

                                    <Input
                                        placeholder={selectedElementType.name}
                                        value={newElementContent || ''}
                                        setValueAction={setNewElementContent}
                                    />

                                    :

                                    <p>Selectionnez un type d'élément</p>
                    }
                </AdvancedPopup>
            </Form>
        </MainPage>
    );
}