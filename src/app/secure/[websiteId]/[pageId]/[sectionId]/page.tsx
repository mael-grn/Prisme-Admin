"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import MainPage, {PageAlignmentEnum} from "@/app/components/mainPage";
import SectionElem, {SectionWidth} from "@/app/components/sectionElem";
import List from "@/app/components/list";
import {ActionTypeEnum} from "@/app/components/Button";
import LoadingPopup from "@/app/components/loadingPopup";
import AdvancedPopup from "@/app/components/advancedPopup";
import Input from "@/app/components/Input";
import {InsertableSection, Section} from "@/app/models/Section";
import SectionService from "@/app/service/sectionService";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {StringUtil} from "@/app/utils/stringUtil";
import Form from "@/app/components/form";
import Textarea from "@/app/components/textarea";
import DropDown from "@/app/components/DropDown";
import ElementService from "@/app/service/elementService";
import {InsertableElement, Element} from "@/app/models/Element";
import {Page} from "@/app/models/Page";
import PageService from "@/app/service/pageService";
import {ImageUtil} from "@/app/utils/ImageUtil";
import ImageInput from "@/app/components/imageInput";

export default function SectionVisu() {

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Chargement des informations de la page...");
    const [elementsLoading, setElementsLoading] = useState(true);

    const [page, setPage] = useState<Page | null>(null);
    const [section, setSection] = useState<Section | null>(null);
    const [elements, setElements] = useState<Element[] | null>([]);

    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const [showPopupNewElement, setShowPopupNewElement] = useState(false);
    const [showPopupEditSectionType, setShowPopupEditSectionType] = useState(false);
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);

    const [modifyElementOrder, setModifyElementOrder] = useState<boolean>(false);
    const [modifiedElements, setModifiedElements] = useState<number[]>([]);

    const [newElementContent, setNewElementContent] = useState<string>('');
    const [newElementFile, setNewElementFile] = useState<File | null>(null);

    const [newElementType, setNewElementType] = useState<string>('');

    const [newSectionType, setNewSectionType] = useState<string>('');


    const router = useRouter();
    const {websiteId, pageId, sectionId} = useParams();

    useEffect(() => {
        async function loadData() {
            setLoadingMessage("Chargement de la page d'origine...")
            setPage(await PageService.getPageById(parseInt(pageId as string)))
            setLoadingMessage("Chargement de la section...")
            const tmpSection: Section = await SectionService.getSectionById(parseInt(sectionId as string))
            setSection(tmpSection)
            setNewSectionType(tmpSection.section_type);
            setLoadingMessage("Récupération des éléments...")
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
            setNewSectionType(ElementService.getElementTypes()[0]);
            setElementsLoading(false);
        }

        try {
            loadData();
        } catch (e) {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        } finally {
            setLoading(false);
        }

    }, [sectionId]);

    function deleteSectionAction() {
        setLoading(true);
        setLoadingMessage("suppression de la section...");
        if (!section) return;
        SectionService.deleteSection(section).then(() => {
            router.push('/secure/' + websiteId + '/' + pageId);
        }).catch((e) => {
            setPopupTitle("Une erreur s'est produite lors de la suppression");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }


    function updateSectionAction() {
        setShowPopupEditSectionType(false);
        if (!section) return;
        const insertableSection: InsertableSection = {
            page_id: section.page_id,
            position: section.position,
            section_type: newSectionType
        }
        const validation = FieldsUtil.checkSection(insertableSection)
        if (!validation.valid) {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        const updatedSection: Section = {
            ...insertableSection,
            id: section.id
        }

        setLoading(true);
        setLoadingMessage("Mise à jour des données...");
        SectionService.updateSection(updatedSection).then(async () => {
            setLoadingMessage("Récuperation des informations...");
            const tmp = await SectionService.getSectionById(parseInt(sectionId as string))
            setSection(tmp);
            setNewSectionType(tmp.section_type);
        }).catch((error) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    async function addElementAction() {
        setShowPopupNewElement(false);
        if (!section) return;



        const newElement: InsertableElement = {
            section_id: section.id,
            element_type: newElementType,
            content: newElementContent
        }
        const validation = FieldsUtil.checkElement(newElement)

        if (!validation.valid) {
            setPopupTitle("Données invalides");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        setLoading(true);

        if (newElementType === 'image') {
            if (newElementFile) {
                setLoadingMessage("Upload de l'image...");
                newElement.content = await ImageUtil.uploadImage(newElementFile)
            } else {
                setPopupTitle("Données invalides");
                setPopupText("Vous avez selectionné le type 'image' mais n'avez importé aucune image.");
                setShowPopup(true);
                return;
            }
        }

        setLoadingMessage("Ajout de l'élément...");
        ElementService.insertElement(newElement).then(async () => {
            setLoadingMessage("Chargement des elements...")
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
        }).catch((error) => {
            setPopupTitle("Erreur");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    function beginModifyElementOrder() {
        setModifyElementOrder(true);
    }

    async function cancelModifyElementOrder() {
        setModifyElementOrder(false);

        setElementsLoading(true)
        setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
        setElementsLoading(false);
    }

    function validateModifyElementOrder() {
        setElementsLoading(true);

        async function loadData() {
            if (!elements) {
                return;
            }
            for (const elem of elements) {
                if (modifiedElements && modifiedElements.includes(elem.id)) {
                    try {
                        await ElementService.moveElement(elem);
                    } catch (e) {
                        setPopupTitle("Une erreur s'est produite");
                        setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
                        setShowPopup(true);
                        setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
                        setElementsLoading(false);
                        return
                    }

                }
            }
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
            setElementsLoading(false);
        }

        loadData();
        setModifyElementOrder(false);
    }

    function moveElementUp(element: Element) {
        if (!elements) {
            return;
        }
        const newElements: Element[] = [...elements];
        if (element.position === 1) {
            return;
        }

        const modSect: number[] = [...modifiedElements];
        modSect?.push(newElements.find(s => s.position === element.position - 1)!.id);
        modSect?.push(element.id);
        setModifiedElements(modSect)

        newElements.find(s => s.position === element.position - 1)!.position++;
        newElements.find(s => s.id === element.id)!.position--;
        newElements.sort((a, b) => a.position - b.position);
        setElements(newElements);
    }

    function moveElementDown(element: Element) {
        if (!elements) {
            return;
        }
        const newElements: Element[] = [...elements];
        if (element.position === elements.length) {
            return;
        }

        const modSect: number[] = [...modifiedElements];
        modSect?.push(newElements.find(s => s.position === element.position + 1)!.id);
        modSect?.push(element.id);
        setModifiedElements(modSect)

        newElements.find(s => s.position === element.position + 1)!.position--;
        newElements.find(s => s.id === element.id)!.position++;
        newElements.sort((a, b) => a.position - b.position);
        setElements(newElements);
    }

    if (!section || !page) {
        return (
            <div>
                <LoadingPopup show={true} message={loadingMessage}/>
            </div>
        )
    }

    return (
        <MainPage pageAlignment={PageAlignmentEnum.tileStart} title={page?.title + ' - ' + section.section_type}>
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
                                 onClick: () => setShowPopupNewElement(true),
                                 iconName: "add",
                                 actionType: ActionTypeEnum.safe
                             }
                         ]}>

                <List elements={elements?.map((elem) => {
                    return {
                        text: StringUtil.truncateString(elem.content, 50),
                        onClick: () => router.push("/secure/" + websiteId + '/' + pageId + '/' + sectionId + '/' + elem.id),
                        actions: modifyElementOrder ? [{
                            iconName: "up",
                            onClick: () => moveElementUp(elem)
                        }, {iconName: "down", onClick: () => moveElementDown(elem)}] : undefined
                    }
                }) ?? []}/>

            </SectionElem>

            <SectionElem title={"Type de section"}
                         actions={[{text: "Modifier", onClick: () => setShowPopupEditSectionType(true), iconName: "edit"}]}>
                <p>{section?.section_type}</p>
            </SectionElem>

            <SectionElem title={"Supprimer"} actions={[{
                text: "Supprimer",
                onClick: () => setShowPopupDelete(true),
                iconName: "trash",
                actionType: ActionTypeEnum.dangerous
            }]}>
                <p>Supprimer la section entraine la perte de l'intégralité de ses éléments.</p>
            </SectionElem>

            <AdvancedPopup
                show={showPopup}
                message={popupText}
                title={popupTitle}
                closePopup={() => setShowPopup(false)}
            />

            <AdvancedPopup
                actions={[{
                    iconName: "trash",
                    text: "Supprimer",
                    actionType: ActionTypeEnum.dangerous,
                    onClick: deleteSectionAction
                }]}
                icon={"warning"}
                show={showPopupDelete}
                message={"Cette action est irreversible. Vous perdrez également les elements que cette section contient."}
                title={`Voulez-vous vraiment supprimer cette section ?`}
                closePopup={() => setShowPopupDelete(false)}
            />

            <Form onSubmitAction={updateSectionAction}>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditSectionType}
                    message={"Selectionnez le nouveau type de la section :"}
                    title={'Modifier le type'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditSectionType(false)}
                >
                    <DropDown items={SectionService.getSectionTypes()} selectedItem={newSectionType} setSelectedItemAction={setNewSectionType} />
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={addElementAction}>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupNewElement}
                    message={"Remplissez les informations ci-dessous pour créer un nouvel élément dans votre section."}
                    title={'Créer un élément'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupNewElement(false)}
                >

                    <DropDown items={ElementService.getElementTypes()} selectedItem={newElementType} setSelectedItemAction={setNewElementType} />

                    <div className={"flex gap-4 items-center"}>
                        <img src={"/ico/question.svg"} alt={"tip"} className={"invert w-10 h-10"}/>
                        {
                            newElementType === "titre" ?
                                <p>Un titre sera affiché en gros, en gras, bref il sera bien visible !</p> :
                                newElementType === "texte" ?
                                    <p>Un texte sera affiché de manière classique, comme un paragraphe. Attention, les retours à la ligne ne seront pas pris en compte, pour obtenir cet effet il faudra ajouter plusieurs paragraphes.</p> :
                                    newElementType === "lien" ?
                                        <p>Saisissez un lien, et celui-ci sera cliquable.</p> :
                                        newElementType === "image" ?
                                            <p>Déposer une image, et celle-ci sera stocké dans le cloud et affichée naturellement !</p> :
                                        <p>Type d'élément inconnu.</p>
                        }
                    </div>

                    {
                        newElementType === "titre" ?
                            <Input placeholder={"Titre"} value={newElementContent} setValueAction={setNewElementContent}/> :
                            newElementType === "texte" ?
                                <Textarea value={newElementContent} onChangeAction={setNewElementContent}/> :
                                newElementType === "lien" ?
                                    <Input validatorAction={StringUtil.httpsDomainValidator} iconName={"globe"} placeholder={"Lien"} value={newElementContent} setValueAction={setNewElementContent}/> :
                                    newElementType === "image" ?
                                        <ImageInput setFileAction={setNewElementFile}/> :
                                        <p>Type d'élément inconnu.</p>
                    }

                </AdvancedPopup>
            </Form>

            <LoadingPopup show={loading} message={loadingMessage}/>

        </MainPage>
    );
}