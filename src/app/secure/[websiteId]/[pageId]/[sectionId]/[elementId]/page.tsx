"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import MainPage, {PageAlignmentEnum} from "@/app/components/mainPage";
import SectionElem from "@/app/components/sectionElem";
import  {ActionTypeEnum} from "@/app/components/Button";
import LoadingPopup from "@/app/components/loadingPopup";
import AdvancedPopup from "@/app/components/advancedPopup";
import Input from "@/app/components/Input";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {StringUtil} from "@/app/utils/stringUtil";
import Form from "@/app/components/form";
import Textarea from "@/app/components/textarea";
import ElementService from "@/app/service/elementService";
import {Element, InsertableElement} from "@/app/models/Element";
import {ImageUtil} from "@/app/utils/ImageUtil";
import ImageInput from "@/app/components/imageInput";

export default function SectionVisu() {

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Chargement des informations de la page...");

    const [element, setElement] = useState<Element | null>(null);

    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);
    const [showPopupEditElementContent, setShowPopupEditElementContent] = useState(false);


    const [newElementContent, setNewElementContent] = useState<string>('');
    const [newElementFile, setNewElementFile] = useState<File | null>(null);

    const router = useRouter();
    const {websiteId, pageId, sectionId, elementId} = useParams();

    useEffect(() => {
        async function loadData() {
            setLoadingMessage("Chargement de l'élément...")
            const elemTmp = await ElementService.getElementById(parseInt(elementId as string))
            setElement(elemTmp)
            setNewElementContent(elemTmp.content)
        }

        loadData().catch((e) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }, [elementId]);

    function deleteElementAction() {
        setShowPopupDelete(false)
        if (!element) return;
        setLoading(true);
        setLoadingMessage("suppression de l'élément...");
        ElementService.deleteElement(element).then(() => {
            router.push('/secure/' + websiteId + '/' + pageId + '/' + sectionId);
        }).catch((e) => {
            setPopupTitle("Une erreur s'est produite lors de la suppression");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }


    async function updateElementAction() {
        setShowPopupEditElementContent(false);
        if (!element) return;



        const insertableElement: InsertableElement = {
            section_id: element.section_id,
            element_type: element.element_type,
            content: newElementContent,

        }
        const validation = FieldsUtil.checkElement(insertableElement)
        if (!validation.valid) {
            setPopupTitle("Il y a une erreur dans les données saisies");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        const updatedElement: Element = {
            ...insertableElement,
            id: element.id,
            position: element.position
        }

        if (element.element_type === 'image') {
            if (newElementFile) {
                updatedElement.content = await ImageUtil.uploadImage(newElementFile)
            } else {
                setPopupTitle("Données invalides");
                setPopupText("Vous avez selectionné le type 'image' mais n'avez importé aucune image.");
                setShowPopup(true);
                return;
            }
        }

        setLoading(true);
        setLoadingMessage("Mise à jour des données...");
        ElementService.updateElement(updatedElement).then(async () => {
            setLoadingMessage("Récuperation des informations...");
            setElement(await ElementService.getElementById(parseInt(elementId as string)));
        }).catch((error) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <MainPage pageAlignment={PageAlignmentEnum.tileStart} title={StringUtil.truncateString(element?.content || "", 30)}>



            <SectionElem title={"Type d'élément"}>
                <p>{element?.element_type}</p>
            </SectionElem>

            <SectionElem title={"Contenu de l'élément"}
                         actions={[{
                             text: "Modifier",
                             onClick: () => setShowPopupEditElementContent(true),
                             iconName: "edit",
                             actionType: ActionTypeEnum.safe
                         }]}>
                {
                    element?.element_type === "image" ?
                        <img src={element.content} alt={"element image"} className={"max-w-full h-auto rounded-lg"}/>
                        :
                        <p>{element?.content}</p>
                }
            </SectionElem>

    <SectionElem title={"Supprimer"} actions={[{
                text: "Supprimer",
                onClick: () => setShowPopupDelete(true),
                iconName: "trash",
                actionType: ActionTypeEnum.dangerous
            }]}>
        <p>Supprimer la section entraine la perte de l&apos;intégralité de ses éléments.</p>
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
            onClick: deleteElementAction
        }]}
    icon={"warning"}
    show={showPopupDelete}
    message={"Cette action est irreversible. Vous perdrez également les elements que cette section contient."}
    title={`Voulez-vous vraiment supprimer cette section ?`}
    closePopup={() => setShowPopupDelete(false)}
    />

    <Form onSubmitAction={updateElementAction}>
    <AdvancedPopup
        icon={'edit'}
    show={showPopupEditElementContent}
    message={"Entrez le nouveau contenu de l'élément :"}
    title={'Modifier le contenu'}
    actions={[
            {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
]}
    closePopup={() => setShowPopupEditElementContent(false)}
>
        {
            element?.element_type === "titre" ?
                <Input placeholder={"Titre"} value={newElementContent}
                       setValueAction={setNewElementContent}/> :
                element?.element_type === "texte" ?
                    <Textarea value={newElementContent} onChangeAction={setNewElementContent}/> :
                    element?.element_type === "lien" ?
                        <Input validatorAction={StringUtil.domainValidator} iconName={"globe"}
                               placeholder={"Lien"} value={newElementContent}
                               setValueAction={setNewElementContent}/> :
                        element?.element_type === "image" ?
                            <ImageInput setFileAction={setNewElementFile}/> :
                            <p>Type d&apos;élément inconnu.</p>
        }
    </AdvancedPopup>
    </Form>

    <LoadingPopup show={loading} message={loadingMessage}/>

    </MainPage>
);
}