"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {deletePage, getPage, Page, updatePage} from "@/app/service/pageService";
import {
    addSection,
    changeSectionPosition,
    getSectionsForPage,
    getSectionTypes, normalizeSectionPositions,
    Section,
    SectionType
} from "@/app/service/sectionService";
import Popup from "@/app/components/popup";
import MainPage from "@/app/components/mainPage";
import SectionElem, {SectionWidth} from "@/app/components/sectionElem";
import List from "@/app/components/list";
import {ActionTypeEnum, ButtonProps} from "@/app/components/Button";
import LoadingPopup from "@/app/components/loadingPopup";
import AdvancedPopup from "@/app/components/advancedPopup";
import Input from "@/app/components/Input";
import DropDown from "@/app/components/DropDown";
import {getElementsFromSection, normalizeElementPositions} from "@/app/service/elementService";

export default function PageVisu() {
    const [loading, setLoading] = useState(true);
    const [sectionsLoading, setSectionsLoading] = useState(true);
    const [page, setPage] = useState<Page | null>(null);
    const [sectionTypes, setSectionTypes] = useState<SectionType[]>([]);
    const [sections, setSections] = useState<Section[] | null>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [showPopupNewSection, setShowPopupNewSection] = useState(false);
    const [showPopupEditPage, setShowPopupEditPage] = useState(false);
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);
    const [modifySectionOrder, setModifySectionOrder] = useState<boolean>(false);
    const [modifiedSections, setModifiedSections] = useState<number[]>([]);
    const [newPageTitle, setNewPageTitle] = useState<string>('');
    const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null);
    const [newSectionTitle, setNewSectionTitle] = useState<string>('');

    const router = useRouter();
    const {pageId} = useParams();

    useEffect(() => {
        async function loadData() {
            const tmpPage: Page | null = await getPage(parseInt(pageId as string))
            setPage(tmpPage)
            setNewPageTitle(tmpPage?.title || '');
            setLoading(false);
            setSections(await getSectionsForPage(parseInt(pageId as string)));
            setSectionTypes(await getSectionTypes());
            setSectionsLoading(false);
        }

        loadData();
    }, [pageId]);

    function deletePageAction() {
        setLoading(true);
        const id = parseInt(pageId as string);
        deletePage(id).then(() => {
            router.push('/secure/pages');
        }).catch((error: Error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error.message);
            setShowPopup(true);
        })
    }


    function updatePageAction(e: React.FormEvent) {
        e.preventDefault();
        const id = parseInt(pageId as string);
        if (newPageTitle === '') {
            return;
        }
        setShowPopupEditPage(false);
        setLoading(true);
        updatePage(id, newPageTitle).then(() => {
            const newPage: Page = {
                id: page?.id || -1,
                title: newPageTitle
            }
            setPage(newPage);
        }).catch((error) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    function addSectonAction(e: React.FormEvent) {
        e.preventDefault();
        if (newSectionTitle === '' || !selectedSectionType) {
            return;
        }
        console.log(newSectionTitle);
        console.log(selectedSectionType);
        setShowPopupNewSection(false);
        setLoading(true);
        addSection(parseInt(pageId as string), newSectionTitle, selectedSectionType?.id || 0).then(() => {
            getSectionsForPage(parseInt(pageId as string)).then(sections => {
                setSections(sections);
            }).finally(() => {
                setLoading(false);
            });
        }).catch((error) => {
            setLoading(false);
            setPopupTitle("Erreur");
            setPopupText(error);
            setShowPopup(true);
        })
    }

    function beginModifySectionOrder() {
        setSectionsLoading(true);

        async function loadData() {
            await normalizeSectionPositions(parseInt(pageId as string))
            setSections(await getSectionsForPage(parseInt(pageId as string)));
            setSectionsLoading(false);
        }

        loadData();
        setModifySectionOrder(true);
    }

    function cancelModifySectionOrder() {
        setSectionsLoading(true);

        async function loadData() {
            setSections(await getSectionsForPage(parseInt(pageId as string)));
            setSectionsLoading(false);
        }

        loadData();
        setModifySectionOrder(false);
    }

    function validateModifySectionOrder() {
        setSectionsLoading(true);

        async function loadData() {
            if (!sections) {
                return;
            }
            for (const sect of sections) {
                if (modifiedSections && modifiedSections.includes(sect.id)) {
                    await changeSectionPosition(sect.id, sect.position);
                }
            }
            setSections(await getSectionsForPage(parseInt(pageId as string)));
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

    if (loading || !page) {
        return (
            <div>
                <LoadingPopup show={true} message={"Récuperation des informations..."}/>
            </div>
        )
    }

    return (
        <MainPage title={page.title}>
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
                                 text: "Supprimer",
                                 iconName: "trash",
                                 onClick: () => setShowPopupDelete(true),
                                 actionType: ActionTypeEnum.dangerous
                             },
                             {
                                 text: "Modifier",
                                 iconName: "edit",
                                 onClick: () => setShowPopupEditPage(true),
                             },
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
                        text: sect.title,
                        onClick: () => router.push("/secure/pages/" + pageId + "/sections/" + sect.id),
                        actions: modifySectionOrder ? [{
                            iconName: "up",
                            onClick: () => moveSectionUp(sect)
                        }, {iconName: "down", onClick: () => moveSectionDown(sect)}] : undefined
                    }
                }) ?? []}/>

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

            <form onSubmit={updatePageAction}>
                <AdvancedPopup
                    icon={'edit'}
                    show={showPopupEditPage}
                    message={"Entrez le nouvel endpoint de la page ci-dessous :"}
                    title={'Modifier la page'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditPage(false)}
                >
                    <Input key={1} placeholder={"Endpoint"} value={newPageTitle} setValueAction={setNewPageTitle}
                           iconName={"globe"}/>
                </AdvancedPopup>
            </form>

            <form onSubmit={addSectonAction}>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupNewSection}
                    message={"Saisissez le type et le titre de la nouvelle section ci-dessous :"}
                    title={'Créer une section'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditPage(false)}
                >
                    <Input key={1} placeholder={"Nom"} value={newSectionTitle} setValueAction={setNewSectionTitle}/>
                    <DropDown
                        items={sectionTypes.map((sectionType) => sectionType.name)}
                        selectedItem={selectedSectionType?.name || 'Type de la section'}
                        setSelectedItemAction={(newValue) => setSelectedSectionType(sectionTypes.find((st) => st.name === newValue) || null)}
                    />
                </AdvancedPopup>
            </form>

        </MainPage>
    );
}