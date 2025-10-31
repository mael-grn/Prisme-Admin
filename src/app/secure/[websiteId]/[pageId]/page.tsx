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
import PageService from "@/app/service/pageService";
import {InsertablePage, Page} from "@/app/models/Page";
import SectionService from "@/app/service/sectionService";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {StringUtil} from "@/app/utils/stringUtil";
import Form from "@/app/components/form";
import Textarea from "@/app/components/textarea";
import SvgFromString from "@/app/components/SvgFromString";
import DropDown from "@/app/components/DropDown";

export default function PageVisu() {

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Chargement des informations de la page...");
    const [sectionsLoading, setSectionsLoading] = useState(true);

    const [page, setPage] = useState<Page | null>(null);
    const [sectionTypes, setSectionTypes] = useState<string[]>([]);
    const [sections, setSections] = useState<Section[] | null>([]);

    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const [showPopupNewSection, setShowPopupNewSection] = useState(false);
    const [showPopupEditTitle, setShowPopupEditTitle] = useState(false);
    const [showPopupEditPath, setShowPopupEditPath] = useState(false);
    const [showPopupEditDescription, setShowPopupEditDescription] = useState(false);
    const [showPopupEditIcon, setShowPopupEditIcon] = useState(false);
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);

    const [modifySectionOrder, setModifySectionOrder] = useState<boolean>(false);
    const [modifiedSections, setModifiedSections] = useState<number[]>([]);

    const [newTitle, setNewTitle] = useState<string>('');
    const [newPath, setNewPath] = useState<string>('');
    const [newDescription, setNewDescription] = useState<string>('');
    const [newIcon, setNewIcon] = useState<string>('');

    const [newSectionType, setNewSectionType] = useState<string>('');


    const router = useRouter();
    const {pageId} = useParams();

    useEffect(() => {
        async function loadData() {
            const tmpPage: Page = await PageService.getPageById(parseInt(pageId as string))
            setPage(tmpPage)
            setNewTitle(tmpPage.title);
            setNewPath(tmpPage.path);
            setNewDescription(tmpPage.description || '');
            setNewIcon(tmpPage.icon_svg || '');
            setSections(await SectionService.getSectionsForPageId(parseInt(pageId as string)));
            setSectionTypes(SectionService.getSectionTypes);
            setNewSectionType(SectionService.getSectionTypes()[0]);
            setSectionsLoading(false);
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

    }, [pageId]);

    function deletePageAction() {
        setLoading(true);
        setLoadingMessage("suppression de la page...");
        if (!page) return;
        PageService.deletePage(page).then(() => {
            router.push('/secure/' + page.website_id);
        }).catch((e) => {
            setPopupTitle("Une erreur s'est produite lors de la suppression");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }


    function updatePageAction() {
        setShowPopupEditTitle(false);
        setShowPopupEditPath(false);
        setShowPopupEditDescription(false);
        setShowPopupEditIcon(false);
        if (!page) return;
        const insertablePage: InsertablePage = {
            title: newTitle,
            website_id: page.website_id,
            path: newPath,
            icon_svg: newIcon,
            description: newDescription,
        }
        const validation = FieldsUtil.checkPage(insertablePage)
        if (!validation.valid) {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        const updatedPage: Page = {
            position: page.position,
            ...insertablePage,
            id: page.id
        }

        setLoading(true);
        setLoadingMessage("Mise à jour des données...");
        PageService.updatePage(updatedPage).then(async () => {
            setLoadingMessage("Récuperation des informations...");
            const tmp = await PageService.getPageById(parseInt(pageId as string))
            setPage(tmp);
            setNewTitle(tmp.title);
            setNewPath(tmp.path);
            setNewDescription(tmp.description || '');
            setNewIcon(tmp.icon_svg || '');
        }).catch((error) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    function addSectonAction() {
        setShowPopupNewSection(false);
        const newSection: InsertableSection = {
            page_id: parseInt(pageId as string),
            position: 0,
            section_type: newSectionType
        }
        const validation = FieldsUtil.checkSection(newSection)
        if (!validation.valid) {
            setPopupTitle("Données invalides");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        setLoading(true);
        setLoadingMessage("Ajout de la section...");
        SectionService.insertSection(newSection).then(async () => {
            setLoadingMessage("Chargement des sections...")
            setSections(await SectionService.getSectionsForPageId(parseInt(pageId as string)));
        }).catch((error) => {
            setPopupTitle("Erreur");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    function beginModifySectionOrder() {
        setModifySectionOrder(true);
    }

    async function cancelModifySectionOrder() {
        setModifySectionOrder(false);

        setSectionsLoading(true)
        setSections(await SectionService.getSectionsForPageId(parseInt(pageId as string)));
        setSectionsLoading(false);
    }

    function validateModifySectionOrder() {
        setSectionsLoading(true);

        async function loadData() {
            if (!sections) {
                return;
            }
            for (const sect of sections) {
                if (modifiedSections && modifiedSections.includes(sect.id)) {
                    try {
                        await SectionService.moveSection(sect);
                    } catch (e) {
                        setPopupTitle("Une erreur s'est produite");
                        setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
                        setShowPopup(true);
                        setSections(await SectionService.getSectionsForPageId(parseInt(pageId as string)));
                        setSectionsLoading(false);
                        return
                    }

                }
            }
            setSections(await SectionService.getSectionsForPageId(parseInt(pageId as string)));
            setSectionsLoading(false);
        }

        loadData();
        setModifySectionOrder(false);
    }

    function moveSectionUp(section: Section) {
        if (!sections) {
            return;
        }
        const newSections: Section[] = [...sections];
        if (section.position === 1) {
            return;
        }

        const modSect: number[] = [...modifiedSections];
        modSect?.push(newSections.find(s => s.position === section.position - 1)!.id);
        modSect?.push(section.id);
        setModifiedSections(modSect)

        newSections.find(s => s.position === section.position - 1)!.position++;
        newSections.find(s => s.id === section.id)!.position--;
        newSections.sort((a, b) => a.position - b.position);
        setSections(newSections);
    }

    function moveSectionDown(section: Section) {
        if (!sections) {
            return;
        }
        const newSections: Section[] = [...sections];
        if (section.position === sections.length) {
            return;
        }

        const modSect: number[] = [...modifiedSections];
        modSect?.push(newSections.find(s => s.position === section.position + 1)!.id);
        modSect?.push(section.id);
        setModifiedSections(modSect)

        newSections.find(s => s.position === section.position + 1)!.position--;
        newSections.find(s => s.id === section.id)!.position++;
        newSections.sort((a, b) => a.position - b.position);
        setSections(newSections);
    }

    if (!page) {
        return (
            <div>
                <LoadingPopup show={true} message={loadingMessage}/>
            </div>
        )
    }

    return (
        <MainPage pageAlignment={PageAlignmentEnum.tileStart} title={page.title}>
            <SectionElem loading={sectionsLoading} title={"Sections"} width={SectionWidth.FULL}
                         actions={modifySectionOrder ? [
                             {
                                 text: "Annuler",
                                 iconName: "close",
                                 onClick: cancelModifySectionOrder,
                                 actionType: ActionTypeEnum.dangerous
                             },
                             {
                                 text: "Valider",
                                 iconName: "check",
                                 onClick: validateModifySectionOrder,
                                 actionType: ActionTypeEnum.safe
                             }
                         ] : [
                             {
                                 text: "Réorganiser",
                                 iconName: "order",
                                 onClick: beginModifySectionOrder,
                             },
                             {
                                 text: "Ajouter",
                                 onClick: () => setShowPopupNewSection(true),
                                 iconName: "add",
                                 actionType: ActionTypeEnum.safe
                             }
                         ]}>

                <List elements={sections?.map((sect) => {
                    return {
                        text: sect.section_type,
                        onClick: () => router.push("/secure/" + page.website_id + "/" + pageId + "/" + sect.id),
                        actions: modifySectionOrder ? [{
                            iconName: "up",
                            onClick: () => moveSectionUp(sect)
                        }, {iconName: "down", onClick: () => moveSectionDown(sect)}] : undefined
                    }
                }) ?? []}/>

            </SectionElem>

            <SectionElem title={"Titre"}
                         actions={[{text: "Modifier", onClick: () => setShowPopupEditTitle(true), iconName: "edit"}]}>
                <p>{page?.title}</p>
            </SectionElem>

            <SectionElem title={"Chemin d'accès"}
                         actions={[{text: "Modifier", onClick: () => setShowPopupEditPath(true), iconName: "edit"}]}>
                <p>{page?.path}</p>
            </SectionElem>

            <SectionElem title={"Description"}
                         actions={[{text: "Modifier", onClick: () => setShowPopupEditDescription(true), iconName: "edit"}]}>
                <p>{page?.description || "Vous n'avez pas de description pour le moment."}</p>
            </SectionElem>

            <SectionElem title={"Icone"}
                         actions={[{text: "Modifier", onClick: () => setShowPopupEditIcon(true), iconName: "edit"}]}>
                {
                    page.icon_svg
                        ? <SvgFromString svg={page.icon_svg} alt="icone" className="w-12 h-12 invert" />
                        : <p>Vous n'avez pas d'icône pour le moment.</p>
                }
            </SectionElem>

            <SectionElem title={"Supprimer"} actions={[{
                text: "Supprimer",
                onClick: () => setShowPopupDelete(true),
                iconName: "trash",
                actionType: ActionTypeEnum.dangerous
            }]}>
                <p>Supprimer la page entraine la perte de l'intégralité de son contenu.</p>
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
                    onClick: deletePageAction
                }]}
                icon={"warning"}
                show={showPopupDelete}
                message={"Cette action est irreversible. Vous perdrez également les elements que cette page contient."}
                title={`Voulez-vous vraiment supprimer la page "${page.title}" ?`}
                closePopup={() => setShowPopupDelete(false)}
            />

            <Form onSubmitAction={updatePageAction}>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditTitle}
                    message={"Entrez le nouveau titre de la page :"}
                    title={'Modifier le titre de la page'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditTitle(false)}
                >
                    <Input placeholder={"Titre"} value={newTitle} setValueAction={setNewTitle}
                           />
                </AdvancedPopup>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditPath}
                    message={"Entrez le nouveau chemin d'accès de la page :"}
                    title={'Modifier le chemin d\'accès de la page'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditPath(false)}
                >
                    <Input validatorAction={StringUtil.pathStringValidator} placeholder={"Chemin d'accès"} value={newPath} setValueAction={setNewPath}
                    />
                </AdvancedPopup>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditDescription}
                    message={"Entrez la nouvelle description de la page :"}
                    title={'Modifier la description de la page'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditPath(false)}
                >
                    <Textarea placeholder={"Chemin d'accès"} value={newDescription} onChangeAction={setNewDescription}
                    />
                </AdvancedPopup>

                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditIcon}
                    message={"Entrez la nouvelle icone au format SVG :"}
                    title={'Modifier l\'icone de la page'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditIcon(false)}
                >
                    <Textarea placeholder={"Icone au format SVG"} value={newIcon} onChangeAction={setNewIcon}
                    />
                    <div className={"flex gap-2 items-center"}>
                        <img src={"/ico/question.svg"} alt={"tip"} className={"invert w-6 h-6"}/>
                        <p>Si vous ne savez pas où trouver d'icône, vous pouvez vous rendre sur le site <a className={"text-blue-600 underline"} target={"_blank"} href={"https://heroicons.com/"}>Hero Icon</a>, copier l'icône de votre choix au format SVG et la coller ici.</p>
                    </div>
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={addSectonAction}>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupNewSection}
                    message={"Selectionnez le type de section. Vous pourrez ajouter du contenu une fois celle-ci créée."}
                    title={'Créer une section'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupNewSection(false)}
                >

                    <DropDown items={sectionTypes} selectedItem={newSectionType} setSelectedItemAction={setNewSectionType} />

                    <div className={"flex gap-4 items-center"}>
                        <img src={"/ico/question.svg"} alt={"tip"} className={"invert w-10 h-10"}/>
                        {
                            newSectionType === "classic" ?
                                <p>Une section classique contenant divers éléments qui seront affichés les uns à la suite des autres.</p> :
                                newSectionType === "develop" ?
                                    <p>Ressemble à une section classique, à la différence que seul le titre est affiché par défaut. Il est nécessaire de cliquer dessus pour afficher le contenu au complet. Recommandé quand il y a beaucoup de contenu à afficher, pour éviter de surcharger la page.</p> :
                                    newSectionType === "tile" ?
                                        <p>Similaire à une section à développer, mais la mise en forme par défaut change : au lieu d'une liste où les éléments sont affichés les un à la suite des autres et prennent tous l'espace, les éléments sont des sortes de petit "carrés" avec une mise en page permettant d'optimiser l'espace.</p> :
                                        <p>Type de section inconnu.</p>
                        }                    </div>

                </AdvancedPopup>
            </Form>

            <LoadingPopup show={loading} message={loadingMessage}/>

        </MainPage>
    );
}