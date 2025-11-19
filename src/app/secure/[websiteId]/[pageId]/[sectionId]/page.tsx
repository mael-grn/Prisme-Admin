"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import MainPage, {PageAlignmentEnum} from "@/app/components/mainPage";
import SectionElem, {SectionWidth} from "@/app/components/sectionElem";
import List from "@/app/components/list";
import {ActionTypeEnum} from "@/app/components/Button";
import AdvancedPopup from "@/app/components/advancedPopup";
import Input from "@/app/components/Input";
import {InsertableSection, Section} from "@/app/models/Section";
import SectionService from "@/app/service/sectionService";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {StringUtil} from "@/app/utils/stringUtil";
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
import {TutorialCard} from "@/app/components/tutorialCard";
import CategorySelection from "@/app/components/categorySelection";

export default function SectionVisu() {

    const [loading, setLoading] = useState(true);
    const [elementsLoading, setElementsLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [addingElementLoading, setAddingElementLoading] = useState(false);
    const [titleAndTypeLoading, setTitleAndTypeLoading] = useState(false);
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

    const [selectedSubcategories, setSelectedSubcategories] = useState<Subcategory[]>([]);

    const router = useRouter();
    const {websiteId, pageId, sectionId} = useParams();

    useEffect(() => {
        async function loadData() {
            const tmpSection: Section = await SectionService.getSectionById(parseInt(sectionId as string))
            setSection(tmpSection)
            setNewSectionType(tmpSection.section_type);
            setNewSectionTitle(tmpSection.title);
            setNewElementType(ElementService.getElementTypes()[0])
        }

        async function loadCategories() {
            setAllRecursiveCategories(await CategoryService.getAllRecursiveCategories());
            const sectionSubcats = await SubcategoryService.getSubcategoriesFromSectionId(parseInt(sectionId as string));
            setSectionsSubcategories(sectionSubcats);
            setSelectedSubcategories(sectionSubcats);
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
        setShowPopupDelete(false)
        setDeleteLoading(true);
        if (!section) return;
        SectionService.deleteSection(section).then(() => {
            router.push('/secure/' + websiteId + '/' + pageId);
        }).catch((e) => {
            setPopupTitle("Une erreur s'est produite lors de la suppression");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => {
            setDeleteLoading(false);
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

        setTitleAndTypeLoading(true);
        SectionService.updateSection(updatedSection).then(async () => {
            const tmp = await SectionService.getSectionById(parseInt(sectionId as string))
            setSection(tmp);
            setNewSectionType(tmp.section_type);
        }).catch((error) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setTitleAndTypeLoading(false);
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

        setAddingElementLoading(true);

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
            setElements(await ElementService.getElementsFromSectionId(parseInt(sectionId as string)));
        }).catch((error) => {
            setPopupTitle("Erreur");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setAddingElementLoading(false);
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
            setShowPopupAddSubcategoryToSection(true)
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
            setShowPopupAddSubcategoryToSection(true)
        }
    }

    async function addSubcategoriesToSectionAction() {
        setShowPopupAddSubcategoryToSection(false);
        if (!section) return;
        if (selectedSubcategories === sectionsSubcategories) {
            return;
        }

        setCategoriesLoading(true);

        try {
            for (const subcategory of selectedSubcategories) {
                if (sectionsSubcategories.findIndex((s) => s.id === subcategory.id) === -1) {
                    await SectionService.addSubcategory(section, subcategory);
                }
            }
            for (const subcategory of sectionsSubcategories) {
                if (selectedSubcategories.findIndex((s) => s.id === subcategory.id) === -1) {
                    await SectionService.removeSubcategory(section, subcategory);
                }
            }
            const updatedSubcategories = await SubcategoryService.getSubcategoriesFromSectionId(parseInt(sectionId as string));
            setSectionsSubcategories(updatedSubcategories);
            setSelectedSubcategories(updatedSubcategories);
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
        <>

            <MainPage pageAlignment={PageAlignmentEnum.tileStart} loading={loading}>

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
                                     isLoading: addingElementLoading,
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
                                     text: "Modifier",
                                     onClick: () => setShowPopupAddSubcategoryToSection(true),
                                     iconName: "edit",
                                     actionType: ActionTypeEnum.safe
                                 }
                             ]}>
                    {
                        allRecursiveCategories.length  === 0 ?
                            <p>Il n&apos;éxiste aucune catégories pour le moment.</p> :
                            sectionsSubcategories.length === 0 ?
                                <p>Vous n&apos;avez encore ajouté aucune catégorie</p> :
                                <div className={"flex flex-wrap gap-2"}>
                                    {
                                        sectionsSubcategories.map((subcat, index) => {
                                            return <p className={"pb-1 pt-1 pl-2 pr-2 rounded-full bg-onBackgroundHover"} key={index}>{subcat.name}</p>
                                        })
                                    }
                                </div>

                    }
                </SectionElem>

                <SectionElem title={"Titre & Type"}
                             actions={[{
                                 isLoading: titleAndTypeLoading,
                                 text: "Modifier",
                                 onClick: () => setShowPopupEditSectionType(true),
                                 iconName: "edit",
                                 actionType: ActionTypeEnum.safe
                             }]}>
                    <p>Titre : {section?.title}</p>
                    <p>Type : {section?.section_type}</p>
                </SectionElem>

                <SectionElem title={"Supprimer"} actions={[{
                    isLoading: deleteLoading,
                    text: "Supprimer",
                    onClick: () => setShowPopupDelete(true),
                    iconName: "trash",
                    actionType: ActionTypeEnum.dangerous
                }]}>
                    <p>Supprimer la section entraine la perte de l&apos;intégralité de ses éléments.</p>
                </SectionElem>


            </MainPage>

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

            <AdvancedPopup
                formAction={updateSectionAction}
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

            <AdvancedPopup
                formAction={insertNewCategoryAction}
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

            <AdvancedPopup
                formAction={insertNewSubcategoryAction}
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

            <AdvancedPopup
                formAction={addSubcategoriesToSectionAction}
                icon={'add'}
                show={showPopupAddSubcategoryToSection}
                message={"Sélectionnez ou désélectionnez les sous-catégories à associer à cette section :"}
                title={'Gérer les catégories'}
                actions={[
                    {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupAddSubcategoryToSection(false)}
            >
                <CategorySelection
                    recursiveCategoryList={allRecursiveCategories}
                    preSelectedSubcategories={sectionsSubcategories}
                    onSelectSubcategoryAction={(subcat) => setSelectedSubcategories([...selectedSubcategories, subcat])}
                    onDeselectSubcategoryAction={(subcat) => setSelectedSubcategories(selectedSubcategories.filter((s) => s.id !== subcat.id))}
                    onCreateNewCategoryPressedAction={() => {
                        setShowPopupAddSubcategoryToSection(false)
                        setShowPopupNewCategory(true)
                    } }
                    onCreateSubcategoryPressedAction={(category) => {
                        setShowPopupAddSubcategoryToSection(false)
                        setNewSubcategoryParentCategoryId(category.id)
                        setShowPopupNewSubcategory(true)
                    }}
                />
            </AdvancedPopup>

            <AdvancedPopup
                formAction={addElementAction}
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

            <AdvancedPopup
                formAction={updateElementAction}
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
        </>

    );
}