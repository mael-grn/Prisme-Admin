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

export default function SectionVisu() {

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Chargement des informations de la page...");
    const [elementsLoading, setElementsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

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

    const [modifyElementOrder, setModifyElementOrder] = useState<boolean>(false);
    const [modifiedElements, setModifiedElements] = useState<number[]>([]);

    const [newElementContent, setNewElementContent] = useState<string>('');
    const [newElementFile, setNewElementFile] = useState<File | null>(null);

    const [newElementType, setNewElementType] = useState<string>('');

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
            setLoadingMessage("Chargement de la section...")
            const tmpSection: Section = await SectionService.getSectionById(parseInt(sectionId as string))
            setSection(tmpSection)
            setNewSectionType(tmpSection.section_type);
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

    return (
        <MainPage pageAlignment={PageAlignmentEnum.tileStart} title={StringUtil.truncateString(section?.section_type || "", 30)}>
            <SectionElem loading={elementsLoading} title={"Elements de votre section"} width={SectionWidth.FULL}
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
                    message={"Selectionnez le nouveau type de la section :"}
                    title={'Modifier le type'}
                    actions={[
                        {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                    ]}
                    closePopup={() => setShowPopupEditSectionType(false)}
                >
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
                                    <Input validatorAction={StringUtil.httpsDomainValidator} iconName={"globe"}
                                           placeholder={"Lien"} value={newElementContent}
                                           setValueAction={setNewElementContent}/> :
                                    newElementType === "image" ?
                                        <ImageInput setFileAction={setNewElementFile}/> :
                                        <p>Type d&apos;élément inconnu.</p>
                    }

                </AdvancedPopup>
            </Form>

            <LoadingPopup show={loading} message={loadingMessage}/>

        </MainPage>
    );
}