"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import MainPage, {PageAlignmentEnum} from "@/app/components/mainPage";
import SectionElem, {SectionWidth} from "@/app/components/sectionElem";
import List from "@/app/components/list";
import Button, {ActionTypeEnum} from "@/app/components/Button";
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
import {Element, InsertableElement} from "@/app/models/Element";
import {ImageUtil} from "@/app/utils/ImageUtil";
import ImageInput from "@/app/components/imageInput";
import {RecursiveCategory} from "@/app/models/Category";
import {Subcategory} from "@/app/models/Subcategory";
import CategoryService from "@/app/service/categoryService";
import SubcategoryService from "@/app/service/subCategoryService";
import {AnimatePresence, motion} from "framer-motion";
import {TutorialCard} from "@/app/components/tutorialCard";
import {DisplayWebsite} from "@/app/models/DisplayWebsite";
import DisplayWebsiteService from "@/app/service/DisplayWebsiteService";
import PageService from "@/app/service/pageService";
import {Page} from "@/app/models/Page";

export default function SectionVisu() {

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Chargement des informations de la page...");
    const [elementsLoading, setElementsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [website, setWebsite] = useState<DisplayWebsite | null>(null);
    const [page, setPage] = useState<Page | null>(null);

    const [section, setSection] = useState<Section | null>(null);
    const [elements, setElements] = useState<Element[] | null>([]);

    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const [showPopupNewElement, setShowPopupNewElement] = useState(false);
    const [showPopupEditSectionType, setShowPopupEditSectionType] = useState(false);
    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);
    const [showPopupNewCategory, setShowPopupNewCategory] = useState<boolean>(false);
    const [showPopupNewSubcategory, setShowPopupNewSubcategory] = useState<boolean>(false);
    const [showPopupAddSubcategoryToSection, setShowPopupAddSubcategoryToSection] = useState<boolean>(false);
    const [showPopupDeleteElement, setShowPopupDeleteElement] = useState<boolean>(false);
    const [showPopupEditElementContent, setShowPopupEditElementContent] = useState(false);

    const [modifyElementOrder, setModifyElementOrder] = useState<boolean>(false);
    const [modifiedElements, setModifiedElements] = useState<number[]>([]);

    const [newElementContent, setNewElementContent] = useState<string>('');
    const [newElementFile, setNewElementFile] = useState<File | null>(null);

    const [newElementType, setNewElementType] = useState<string>('');

    const [elementToDelete, setElementToDelete] = useState<number | null>(null);

    const [elementToEdit, setElementToEdit] = useState<number | null>(null);
    const [editedElementContent, setEditedElementContent] = useState<string>('');
    const [editedElementFile, setEditedElementFile] = useState<File | null>(null);

    const [newSectionTitle, setNewSectionTitle] = useState<string>('');
    const [newSectionType, setNewSectionType] = useState<string>('');

    const [allRecursiveCategories, setAllRecursiveCategories] = useState<RecursiveCategory[]>([]);
    const [sectionsSubcategories, setSectionsSubcategories] = useState<Subcategory[]>([]);

    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const [newSubcategoryName, setNewSubcategoryName] = useState<string>('');
    const [newSubcategoryParentCategoryId, setNewSubcategoryParentCategoryId] = useState<number | null>(null);

    const [subcategoriesToAdd, setSubcategoriesToAdd] = useState<Subcategory[]>([]);

    const router = useRouter();
    const {websiteId, pageId, sectionId} = useParams();

    useEffect(() => {
        async function loadData() {
            setLoadingMessage("chargement du site...")
            setWebsite(await DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string)))
            setLoadingMessage("chargement de la page...")
            setPage(await PageService.getPageById(parseInt(pageId as string)))
            setLoadingMessage("Chargement de la section...")
            const tmpSection: Section = await SectionService.getSectionById(parseInt(sectionId as string))
            setSection(tmpSection)
            setNewSectionType(tmpSection.section_type);
            setNewSectionTitle(tmpSection.title);
            setNewElementType(ElementService.getElementTypes()[0])
        }

        async function loadCategories() {
            setAllRecursiveCategories(await CategoryService.getAllRecursiveCategories());
            setSectionsSubcategories(await SubcategoryService.getSubcategoriesFromSectionId(parseInt(sectionId as string)));
        }

        async function loadElements() {
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
            setNewSectionType(ElementService.getElementTypes()[0]);
        }

        loadData().catch((e) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })

        loadElements().catch((e) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        }).finally(() => {
            setElementsLoading(false);
        })

        loadCategories().catch((e) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        }).finally(() => {
            setCategoriesLoading(false);
        })

    }, [websiteId, pageId, sectionId]);

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
            title: newSectionTitle,
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

        setElementsLoading(true);

        if (newElementType === 'image') {
            if (newElementFile) {
                newElement.content = await ImageUtil.uploadImage(newElementFile)
            } else {
                setPopupTitle("Données invalides");
                setPopupText("Vous avez selectionné le type 'image' mais n'avez importé aucune image.");
                setShowPopup(true);
                return;
            }
        }

        ElementService.insertElement(newElement).then(async () => {
            setLoadingMessage("Chargement des elements...")
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
        }).catch((error) => {
            setPopupTitle("Erreur");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setElementsLoading(false);
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

    async function insertNewCategoryAction() {
        setShowPopupNewCategory(false);
        const validation = FieldsUtil.checkCategory({name: newCategoryName});
        if (!validation.valid) {
            setPopupTitle("Données invalides");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        setCategoriesLoading(true);

        try {
            await CategoryService.createCategory({name: newCategoryName});
            setAllRecursiveCategories(await CategoryService.getAllRecursiveCategories())
            setNewCategoryName('');
        } catch (e) {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        } finally {
            setCategoriesLoading(false);
        }
    }

    async function insertNewSubcategoryAction() {
        setShowPopupNewSubcategory(false);
        if (newSubcategoryParentCategoryId === null) {
            setPopupTitle("Données invalides");
            setPopupText("Vous devez sélectionner une catégorie parente.");
            setShowPopup(true);
            return;
        }
        const validation = FieldsUtil.checkSubCategory({
            name: newSubcategoryName,
            category_id: newSubcategoryParentCategoryId
        });
        if (!validation.valid) {
            setPopupTitle("Données invalides");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        setCategoriesLoading(true);

        try {
            await SubcategoryService.createSubCategoryForCategory({
                name: newSubcategoryName,
                category_id: newSubcategoryParentCategoryId as number
            });
            setAllRecursiveCategories(await CategoryService.getAllRecursiveCategories())
            setNewSubcategoryName('');
            setNewSubcategoryParentCategoryId(null);
        } catch (e) {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        } finally {
            setCategoriesLoading(false);
        }
    }

    async function addSubcategoriesToSectionAction() {
        setShowPopupAddSubcategoryToSection(false);
        if (!section) return;
        if (subcategoriesToAdd.length === 0) {
            setPopupTitle("Aucune sous-catégorie sélectionnée");
            setPopupText("Veuillez sélectionner au moins une sous-catégorie à ajouter à la section.");
            setShowPopup(true);
            return;
        }

        setCategoriesLoading(true);

        try {
            for (const subcategory of subcategoriesToAdd) {
                await SectionService.addSubcategory(section, subcategory);
            }
            setSectionsSubcategories(await SubcategoryService.getSubcategoriesFromSectionId(parseInt(sectionId as string)));
            setSubcategoriesToAdd([]);
        } catch (e) {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        } finally {
            setCategoriesLoading(false);
        }
    }

    async function removeSubcategoryFromSectionAction(subcategory: Subcategory) {
        if (!section) return;

        setCategoriesLoading(true);

        try {
            await SectionService.removeSubcategory(section, subcategory);
            setSectionsSubcategories(await SubcategoryService.getSubcategoriesFromSectionId(parseInt(sectionId as string)));
        } catch (e) {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(typeof e === 'string' ? e : 'Erreur inconnue');
            setShowPopup(true);
        } finally {
            setCategoriesLoading(false);
        }
    }

    async function deleteElementAction() {
        setShowPopupDeleteElement(false)
        if (!elementToDelete) return;
        setElementsLoading(true);
        const element = elements?.find((el) => el.id === elementToDelete);
        if (!element) return;
        ElementService.deleteElement(element).then(async () => {
            setElementToDelete(null)
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
        }).catch((e) => {
            setPopupTitle("Une erreur s'est produite lors de la suppression");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => {
            setElementsLoading(false);
        })
    }

    async function updateElementAction() {
        setShowPopupEditElementContent(false);
        if (!elementToEdit) return;
        const element = elements?.find((el) => el.id === elementToEdit);
        if (!element) return;
        const insertableElement: InsertableElement = {
            section_id: element.section_id,
            element_type: element.element_type,
            content: editedElementContent,

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
            if (editedElementFile) {
                updatedElement.content = await ImageUtil.uploadImage(editedElementFile)
            } else {
                setPopupTitle("Données invalides");
                setPopupText("Vous avez selectionné le type 'image' mais n'avez importé aucune image.");
                setShowPopup(true);
                return;
            }
        }

        setElementsLoading(true);
        ElementService.updateElement(updatedElement).then(async () => {
            setElementToEdit(null)
            setEditedElementContent("")
            setEditedElementFile(null)
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
        }).catch((error) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setElementsLoading(false);
        })
    }

    return (
        <MainPage pageAlignment={PageAlignmentEnum.tileStart} title={StringUtil.truncateString(website?.hero_title || "", 30)}>

            <div className={"w-full flex flex-col gap-1"}>
                <p className={"text-onForegroundHover"}>Gestion de votre section</p>
                <h1>{section?.title}</h1>
                <p className={"text-onForegroundHover"}>Vous gérez ici la section de type {section?.section_type} numéro {section?.position} de la page {page?.path}, sur votre site {website?.website_domain}.</p>
            </div>

            <TutorialCard
                text={"Vous pouvez gérer les éléments de votre section ici. Ajoutez, réorganisez ou supprimez des éléments pour personnaliser le contenu de votre page. Vous pouvez également gérer les catégories associées à cette section. Les catégories sont utiles pour trier et organiser le contenu de votre site web."}
                uniqueId={"section-page"}/>
            <SectionElem loading={elementsLoading} title={"Contenu de votre section"} width={SectionWidth.FULL}
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

                <TutorialCard
                    text={"Vous pouvez ici gérer les différents elements contenus dans votre section."}
                    uniqueId={"elements-in-section-tutorial"}
                />

                <List elements={elements?.map((elem) => {
                    return {
                        text: elem.element_type === "image" ? elem.content : StringUtil.truncateString(elem.content, 50),
                        isImage: elem.element_type === "image",
                        actions: modifyElementOrder ? [{
                            iconName: "up",
                            onClick: () => moveElementUp(elem)
                        }, {iconName: "down", onClick: () => moveElementDown(elem)}] : [
                            {iconName: "edit", type: ActionTypeEnum.safe, onClick: () => {
                                setElementToEdit(elem.id);
                                console.log(elem.content)
                                if (elem.element_type !== "image") {
                                    console.log("test")
                                    setEditedElementContent(elem.content);
                                }
                                setShowPopupEditElementContent(true);
                            }},
                            {iconName: "trash", type: ActionTypeEnum.dangerous, onClick: () => {
                                    setElementToDelete(elem.id);
                                    setShowPopupDeleteElement(true);
                                }}
                        ]
                    }
                }) ?? []}/>

            </SectionElem>

            <SectionElem title={"Catégories"}
                         loading={categoriesLoading}
                         actions={[
                             {
                                 text: "Ajouter",
                                 onClick: () => setShowPopupAddSubcategoryToSection(true),
                                 iconName: "add",
                                 actionType: ActionTypeEnum.safe
                             }
                         ]}>
                {
                    allRecursiveCategories.length === 0 ?
                    <div className={"flex gap-2 items-center"}>
                        <img src={"/ico/info.svg"} alt={"info"} className={"w-8 invert"}/>
                        <p>Il n&apos;existe aucune catégories pour le moment.</p>
                    </div> :
                    sectionsSubcategories.length === 0 &&
                        <div className={"flex gap-2 items-center"}>
                            <img src={"/ico/info.svg"} alt={"info"} className={"w-8 invert"}/>
                            <p>Vous n&apos;avez pas encore selectionné de sous-catégories pour votre section.</p>
                        </div>
                }
                {
                    allRecursiveCategories.filter(cat => cat.subcategories.some(subcat => sectionsSubcategories.some(subcat2 => subcat2.id === subcat.id))).map((cat) => {
                        return <div key={"cat" + cat.id} className={"flex flex-col gap-2 p-3 rounded-xl bg-onBackgroundHover"}>
                            <h3>{cat.name}</h3>
                            <div className={"flex gap-2 flex-wrap"}>
                                {
                                    cat.subcategories.filter(sub1 => sectionsSubcategories.some(sub2 => sub2.id === sub1.id)).map((subcat) => {
                                        return <div
                                            onClick={() => removeSubcategoryFromSectionAction(subcat)}
                                            key={"sub" + subcat.id}
                                            className={`rounded-full relative overflow-hidden cursor-pointer pt-1 pb-1 pl-2 pr-2 flex gap-1 items-center justify-center bg-background md:hover:bg-onBackground active:bg-onBackground`}
                                        >
                                            <p>{subcat.name}</p>
                                            <span className={"absolute top-0 left-0 w-full h-full bg-dangerous opacity-0 md:hover:opacity-80 active:opacity-100 flex items-center justify-center"}>
                                                <img src={"/ico/trash.svg"} alt={"trash"} className={"invert w-4"}/>
                                            </span>
                                        </div>
                                    })
                                }
                            </div>

                        </div>
                    })
                }
            </SectionElem>

            <SectionElem title={"Type de section"}
                         actions={[{
                             text: "Modifier",
                             onClick: () => setShowPopupEditSectionType(true),
                             iconName: "edit",
                             actionType: ActionTypeEnum.safe
                         }]}>
                <p>{section?.section_type}</p>
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
                    message={"Saisissez le nouveau titre et type de la section :"}
                    title={'Modifier le type'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditSectionType(false)}
                >
                    <Input placeholder={"Titre"} value={newSectionTitle} setValueAction={setNewSectionTitle} />
                    <DropDown items={SectionService.getSectionTypes()} selectedItem={newSectionType}
                              setSelectedItemAction={setNewSectionType}/>
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={insertNewCategoryAction}>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupNewCategory}
                    message={"Entrez le nom de la nouvelle catégorie :"}
                    title={'Créer une catégorie'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupNewCategory(false)}
                >
                    <Input placeholder={"Nom"} value={newCategoryName} setValueAction={setNewCategoryName}/>
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={insertNewSubcategoryAction}>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupNewSubcategory}
                    message={"Entrez le nom de la nouvelle sous-catégorie à créer pour " + (newSubcategoryParentCategoryId ? allRecursiveCategories.find((cat) => cat.id === newSubcategoryParentCategoryId)?.name : 'CATEGORIE NON TROUVEE') + " : "}
                    title={'Créer une sous-catégorie pour ' + (newSubcategoryParentCategoryId ? allRecursiveCategories.find((cat) => cat.id === newSubcategoryParentCategoryId)?.name : 'CATEGORIE NON TROUVEE')}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupNewSubcategory(false)}
                >
                    <Input placeholder={"Nom"} value={newSubcategoryName} setValueAction={setNewSubcategoryName}/>
                </AdvancedPopup>
            </Form>

            <Form onSubmitAction={addSubcategoriesToSectionAction}>
                <AdvancedPopup
                    icon={'add'}
                    show={showPopupAddSubcategoryToSection}
                    message={"Selectionnez les sous-catégories à ajouter à cette section :"}
                    title={'Ajouter des sous-catégorie'}
                    actions={[
                        {
                            text: "Créer une catégorie", iconName: "add", onClick: () => {
                                setShowPopupAddSubcategoryToSection(false)
                                setShowPopupNewCategory(true)
                            }
                        },
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupAddSubcategoryToSection(false)}
                >
                    {
                        allRecursiveCategories.length === 0 &&
                        <div className={"flex gap-2 items-center"}>
                            <img src={"/ico/info.svg"} alt={"info"} className={"w-8 invert"}/>
                            <p>Il n&apos;existe aucune catégories pour le moment.</p>
                        </div>
                    }
                    {
                        allRecursiveCategories.map((cat) => {
                            return <div key={"cat" + cat.id} className={"flex flex-col gap-2 w-full p-3 rounded-xl bg-onBackgroundHover"}>
                                <h3>{cat.name}</h3>
                                {
                                    cat.subcategories.length === 0 &&
                                    <div className={"flex gap-2 items-center"}>
                                        <img src={"/ico/info.svg"} alt={"info"} className={"w-8 invert"}/>
                                        <p>Cette catégorie ne contient aucune sous-catégorie pour le moment.</p>
                                    </div>
                                }
                                <div className={"flex gap-2 flex-wrap"}>
                                    {
                                        cat.subcategories.filter(sub1 => !sectionsSubcategories.some(sub2 => sub2.id === sub1.id)).map((subcat) => {
                                            return <div key={"sub" + subcat.id}
                                                className={`rounded-full cursor-pointer pt-1 pb-1 pl-2 pr-2 flex gap-1 items-center justify-center ${subcategoriesToAdd.includes(subcat) ? 'bg-safe md:hover:bg-safeHover active:bg-safeHover' : 'bg-background md:hover:bg-onBackground active:bg-onBackground'}`}
                                                onClick={() => {
                                                    if (subcategoriesToAdd.includes(subcat)) {
                                                        setSubcategoriesToAdd(subcategoriesToAdd.filter((s) => s !== subcat));
                                                    } else {
                                                        setSubcategoriesToAdd([...subcategoriesToAdd, subcat]);
                                                    }
                                                }}
                                            >
                                                <p>{subcat.name}</p>
                                                <AnimatePresence>
                                                    {
                                                        subcategoriesToAdd.includes(subcat) &&
                                                        <motion.img
                                                            initial={{opacity: 0, translateX: -10}}
                                                            animate={{opacity: 1, translateX: 0}}
                                                            exit={{opacity: 0, translateX: -10}}
                                                            src={"/ico/check.svg"}
                                                            alt={"check"}
                                                            className={"w-4 invert"}/>
                                                    }
                                                </AnimatePresence>

                                            </div>
                                        })
                                    }
                                </div>

                                <Button iconName={"add"} text={"Créer une sous-catégorie"} onClick={() => {
                                    setNewSubcategoryParentCategoryId(cat.id)
                                    setShowPopupAddSubcategoryToSection(false)
                                    setShowPopupNewSubcategory(true)
                                }}/>

                            </div>
                        })
                    }
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

                    <DropDown items={ElementService.getElementTypes()} selectedItem={newElementType}
                              setSelectedItemAction={setNewElementType}/>

                    <div className={"flex gap-4 items-center"}>
                        <img src={"/ico/question.svg"} alt={"tip"} className={"invert w-10 h-10"}/>
                        {
                            newElementType === "titre" ?
                                <p>Un titre sera affiché en gros, en gras, bref il sera bien visible !</p> :
                                newElementType === "texte" ?
                                    <p>Un texte sera affiché de manière classique, comme un paragraphe. Attention, les
                                        retours à la ligne ne seront pas pris en compte, pour obtenir cet effet il
                                        faudra ajouter plusieurs paragraphes.</p> :
                                    newElementType === "lien" ?
                                        <p>Saisissez un lien, et celui-ci sera cliquable.</p> :
                                        newElementType === "image" ?
                                            <p>Déposer une image, et celle-ci sera stocké dans le cloud et affichée
                                                naturellement !</p> :
                                            <p>Type d&apos;élément inconnu.</p>
                        }
                    </div>

                    {
                        newElementType === "titre" ?
                            <Input placeholder={"Titre"} value={newElementContent}
                                   setValueAction={setNewElementContent}/> :
                            newElementType === "texte" ?
                                <Textarea value={newElementContent} onChangeAction={setNewElementContent}/> :
                                newElementType === "lien" ?
                                    <Input validatorAction={StringUtil.domainValidator} iconName={"globe"}
                                           placeholder={"Lien"} value={newElementContent}
                                           setValueAction={setNewElementContent}/> :
                                    newElementType === "image" ?
                                        <ImageInput setFileAction={setNewElementFile}/> :
                                        <p>Type d&apos;élément inconnu.</p>
                    }

                </AdvancedPopup>
            </Form>

            <AdvancedPopup
                actions={[{
                    iconName: "trash",
                    text: "Supprimer",
                    actionType: ActionTypeEnum.dangerous,
                    onClick: deleteElementAction
                }]}
                icon={"warning"}
                show={showPopupDeleteElement}
                message={"Cette action est irreversible. Cet élément sera définitivement supprimé."}
                title={`Voulez-vous vraiment supprimer cet element ?`}
                closePopup={() => setShowPopupDeleteElement(false)}
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
                        elements?.find((el) => el.id === elementToEdit)?.element_type === "titre" ?
                            <Input placeholder={"Titre"} value={editedElementContent}
                                   setValueAction={setEditedElementContent}/> :
                            elements?.find((el) => el.id === elementToEdit)?.element_type === "texte" ?
                                <Textarea value={editedElementContent} onChangeAction={setEditedElementContent}/> :
                                elements?.find((el) => el.id === elementToEdit)?.element_type === "lien" ?
                                    <Input validatorAction={StringUtil.domainValidator} iconName={"globe"}
                                           placeholder={"Lien"} value={editedElementContent}
                                           setValueAction={setEditedElementContent}/> :
                                    elements?.find((el) => el.id === elementToEdit)?.element_type === "image" ?
                                        <ImageInput setFileAction={setEditedElementFile}/> :
                                        <p>Type d&apos;élément inconnu.</p>
                    }
                </AdvancedPopup>
            </Form>

            <LoadingPopup show={loading} message={loadingMessage}/>

        </MainPage>
    );
}