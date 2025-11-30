"use client"

import {useEffect, useState} from "react";
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
import LoadingPopup from "@/app/components/loadingPopup";

/**
 * Ne s'affiche que si section n'est pas null
 * ainsi, il est necessaire d'avoir une fonction pour rendre section null pour fermer ce composant
 * @param section
 * @param updateSectionAction
 * @param setSectionNull
 * @constructor
 */
export default function SectionAsPopup({section, updateSectionAction, deleteSectionAction, setSectionNullAction} : { section: Section | null, updateSectionAction: (section: Section) => Promise<void>, deleteSectionAction: () => void, setSectionNullAction: () => void}) {

    const [loading, setLoading] = useState(true);
    const [elementsLoading, setElementsLoading] = useState(true);
    const [addingElementLoading, setAddingElementLoading] = useState(false);
    const [titleAndTypeLoading, setTitleAndTypeLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);


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


    useEffect(() => {
        if (!section) return;

        async function loadData() {
            if (!section) return;
            setNewSectionType(section.section_type);
            setNewSectionTitle(section.title);
            setNewElementType(ElementService.getElementTypes()[0])
        }

        async function loadCategories() {
            if (!section) return;
            setAllRecursiveCategories(await CategoryService.getAllRecursiveCategories());
            const sectionSubcats = await SubcategoryService.getSubcategoriesFromSectionId(section.id);
            setSectionsSubcategories(sectionSubcats);
            setSelectedSubcategories(sectionSubcats);
        }

        async function loadElements() {
            if (!section) return;
            setElements(await ElementService.getElementsFromSectionId(section.id));
            setNewSectionType(ElementService.getElementTypes()[0]);
        }

        loadData().catch((e) => {
            setPopupTitle("Something went wrong");
            setPopupText(typeof e === 'string' ? e : 'Unknown error');
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })

        loadElements().catch((e) => {
            setPopupTitle("Something went wrong");
            setPopupText(typeof e === 'string' ? e : 'Unknown error');
            setShowPopup(true);
        }).finally(() => {
            setElementsLoading(false);
        })

        loadCategories().catch((e) => {
            setPopupTitle("Something went wrong");
            setPopupText(typeof e === 'string' ? e : 'unknown error');
            setShowPopup(true);
        }).finally(() => {
            setCategoriesLoading(false);
        })

    }, [section]);




    async function updateSection() {
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
            setPopupTitle("Something is wrong with the data");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        setTitleAndTypeLoading(true);

        try {
            await updateSectionAction({
                id: section.id,
                title: newSectionTitle,
                page_id: section.page_id,
                position: section.position,
                section_type: newSectionType
            })
        } catch(error) {
            setPopupTitle("Something went wrong");
            setPopupText(error as string || 'Unknown error');
            setShowPopup(true);
        } finally {
            setTitleAndTypeLoading(false);
        }
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
            setPopupTitle("Invalid data");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        setAddingElementLoading(true);

        if (newElementType === 'image') {
            if (newElementFile) {
                newElement.content = await ImageUtil.uploadImage(newElementFile)
            } else {
                setPopupTitle("invalid data");
                setPopupText("You have selected the 'image' type but have not uploaded any image.");
                setShowPopup(true);
                return;
            }
        }

        ElementService.insertElement(newElement).then(async () => {
            setElements(await ElementService.getElementsFromSectionId(section.id));
        }).catch((error) => {
            setPopupTitle("Something went wrong");
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
        if (!section) return;
        setModifyElementOrder(false);

        setElementsLoading(true)
        setElements(await ElementService.getElementsFromSectionId(section.id));
        setElementsLoading(false);
    }

    function validateModifyElementOrder() {
        setElementsLoading(true);

        async function loadData() {
            if (!elements || !section) {
                return;
            }
            for (const elem of elements) {
                if (modifiedElements && modifiedElements.includes(elem.id)) {
                    try {
                        await ElementService.moveElement(elem);
                    } catch (e) {
                        setPopupTitle("Something went wrong");
                        setPopupText(typeof e === 'string' ? e : 'Unknown error');
                        setShowPopup(true);
                        setElements(await ElementService.getElementsFromSectionId(section.id));
                        setElementsLoading(false);
                        return
                    }

                }
            }
            setElements(await ElementService.getElementsFromSectionId(section.id));
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
            setPopupTitle("Invalid data");
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
            setPopupTitle("Something went wrong");
            setPopupText(typeof e === 'string' ? e : 'unknown error');
            setShowPopup(true);
        } finally {
            setCategoriesLoading(false);
            setShowPopupAddSubcategoryToSection(true)
        }
    }

    async function insertNewSubcategoryAction() {
        setShowPopupNewSubcategory(false);
        if (newSubcategoryParentCategoryId === null) {
            setPopupTitle("Invalid data");
            setPopupText("You must select a parent category.");
            setShowPopup(true);
            return;
        }
        const validation = FieldsUtil.checkSubCategory({
            name: newSubcategoryName,
            category_id: newSubcategoryParentCategoryId
        });
        if (!validation.valid) {
            setPopupTitle("Invalid data");
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
            setPopupTitle("Something went wrong");
            setPopupText(typeof e === 'string' ? e : 'Unknown error');
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
            const updatedSubcategories = await SubcategoryService.getSubcategoriesFromSectionId(section.id);
            setSectionsSubcategories(updatedSubcategories);
            setSelectedSubcategories(updatedSubcategories);
        } catch (e) {
            setPopupTitle("Something went wrong");
            setPopupText(typeof e === 'string' ? e : 'Unknown error');
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
            setElements(await ElementService.getElementsFromSectionId(element.section_id));
        }).catch((e) => {
            setPopupTitle("Something went wrong");
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
            setPopupTitle("Invalid data");
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
                setPopupTitle("Invalid data");
                setPopupText("You have selected the 'image' type but have not uploaded any image.");
                setShowPopup(true);
                return;
            }
        }

        setElementsLoading(true);
        ElementService.updateElement(updatedElement).then(async () => {
            setElementToEdit(null)
            setEditedElementContent("")
            setEditedElementFile(null)
            setElements(await ElementService.getElementsFromSectionId(updatedElement.section_id));
        }).catch((error) => {
            setPopupTitle("Something went wrong");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setElementsLoading(false);
        })
    }

    return (
        <>

            <AdvancedPopup
                icon={"section"}
                show={section !== null}
                closePopup={setSectionNullAction}
                title={section?.title || "ERROR!!!"}
                message={"Manage your section settings below."}
                actions={[
                    {
                        text    : "Delete",
                        iconName: "trash",
                        onClick : () => setShowPopupDelete(true),
                        actionType: ActionTypeEnum.dangerous
                    }
                ]}
            >



                <TutorialCard
                    text={"You can manage the elements in your section here. Add, rearrange, or delete elements to customize your page content. You can also manage the categories associated with this section. Categories are useful for sorting and organizing your website's content."}
                    uniqueId={"section-page"}/>
                <SectionElem loading={elementsLoading} title={"Section's content"} width={SectionWidth.FULL}
                             actions={modifyElementOrder ? [
                                 {
                                     text: "Cancel",
                                     iconName: "close",
                                     onClick: cancelModifyElementOrder,
                                     actionType: ActionTypeEnum.dangerous
                                 },
                                 {
                                     text: "Validate",
                                     iconName: "check",
                                     onClick: validateModifyElementOrder,
                                     actionType: ActionTypeEnum.safe
                                 }
                             ] : [
                                 {
                                     text: "Reorder",
                                     iconName: "order",
                                     onClick: beginModifyElementOrder,
                                 },
                                 {
                                     isLoading: addingElementLoading,
                                     text: "Create",
                                     onClick: () => setShowPopupNewElement(true),
                                     iconName: "add",
                                     actionType: ActionTypeEnum.safe
                                 }
                             ]}>

                    <TutorialCard
                        text={"Here you can manage the different elements contained in your section."}
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

                <SectionElem title={"Categories"}
                             loading={categoriesLoading}
                             width={SectionWidth.FULL}
                             actions={[
                                 {
                                     text: "Edit",
                                     onClick: () => setShowPopupAddSubcategoryToSection(true),
                                     iconName: "edit",
                                     actionType: ActionTypeEnum.safe
                                 }
                             ]}>
                    {
                        allRecursiveCategories.length  === 0 ?
                            <p>There is no category as of now.</p> :
                            sectionsSubcategories.length === 0 ?
                                <p>You have not selected any categories yet.</p> :
                                <div className={"flex flex-wrap gap-2"}>
                                    {
                                        sectionsSubcategories.map((subcat, index) => {
                                            return <p className={"pb-1 pt-1 pl-2 pr-2 rounded-full bg-onBackgroundHover"} key={index}>{subcat.name}</p>
                                        })
                                    }
                                </div>

                    }
                </SectionElem>

                <SectionElem title={"Title & type"}
                             width={SectionWidth.FULL}
                             actions={[{
                                 isLoading: titleAndTypeLoading,
                                 text: "Edit",
                                 onClick: () => setShowPopupEditSectionType(true),
                                 iconName: "edit",
                                 actionType: ActionTypeEnum.safe
                             }]}>
                    <p>Title : {section?.title}</p>
                    <p>Type : {section?.section_type}</p>
                </SectionElem>

                <LoadingPopup show={loading}/>
            </AdvancedPopup>

            <AdvancedPopup
                show={showPopup}
                message={popupText}
                title={popupTitle}
                closePopup={() => setShowPopup(false)}
            />

            <AdvancedPopup
                actions={[{
                    iconName: "trash",
                    text: "Delete",
                    actionType: ActionTypeEnum.dangerous,
                    onClick: () => {
                        setShowPopupDelete(false)
                        deleteSectionAction()
                    }
                }]}
                icon={"warning"}
                show={showPopupDelete}
                message={"This action is irreversible. You will also lose the items contained in this section."}
                title={`Do you really want to delete this section?`}
                closePopup={() => setShowPopupDelete(false)}
            />

            <AdvancedPopup
                formAction={updateSection}
                icon={'edit'}
                show={showPopupEditSectionType}
                message={"Enter the new title and type of the section:"}
                title={'Edit section\'s title and type'}
                actions={[
                    {text: "Edit", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupEditSectionType(false)}
            >
                <Input placeholder={"title"} value={newSectionTitle} setValueAction={setNewSectionTitle} />
                <DropDown items={SectionService.getSectionTypes()} selectedItem={newSectionType}
                          setSelectedItemAction={setNewSectionType}/>
            </AdvancedPopup>

            <AdvancedPopup
                formAction={insertNewCategoryAction}
                icon={'add'}
                show={showPopupNewCategory}
                message={"Enter the new category's name :"}
                title={'Create a new category'}
                actions={[
                    {text: "Create", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupNewCategory(false)}
            >
                <Input placeholder={"name"} value={newCategoryName} setValueAction={setNewCategoryName}/>
            </AdvancedPopup>

            <AdvancedPopup
                formAction={insertNewSubcategoryAction}
                icon={'add'}
                show={showPopupNewSubcategory}
                message={"the new subcategory's name for " + (newSubcategoryParentCategoryId ? allRecursiveCategories.find((cat) => cat.id === newSubcategoryParentCategoryId)?.name : 'UNKNOWN') + " : "}
                title={'Create a subcategory for ' + (newSubcategoryParentCategoryId ? allRecursiveCategories.find((cat) => cat.id === newSubcategoryParentCategoryId)?.name : 'UNKNOWN')}
                actions={[
                    {text: "Create", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupNewSubcategory(false)}
            >
                <Input placeholder={"name"} value={newSubcategoryName} setValueAction={setNewSubcategoryName}/>
            </AdvancedPopup>

            <AdvancedPopup
                formAction={addSubcategoriesToSectionAction}
                icon={'add'}
                show={showPopupAddSubcategoryToSection}
                message={"Select or deselect the subcategories to associate with this section:"}
                title={'Manage categories'}
                actions={[
                    {text: "Validate", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
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
                message={"Fill in the information to create a new element."}
                title={'Create a new element'}
                actions={[
                    {text: "Create", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupNewElement(false)}
            >

                <DropDown items={ElementService.getElementTypes()} selectedItem={newElementType}
                          setSelectedItemAction={setNewElementType}/>

                <div className={"flex gap-4 items-center"}>
                    <img src={"/ico/question.svg"} alt={"tip"} className={"invert w-10 h-10"}/>
                    {
                        newElementType === "title" ?
                            <p>A title will be displayed in large, bold text; in short, it will be clearly visible!</p> :
                            newElementType === "text" ?
                                <p>Text will be displayed in the usual way, like a paragraph. Note that line breaks will not be recognized; to achieve this effect, you will need to add multiple paragraphs.</p> :
                                newElementType === "link" ?
                                    <p>Enter a link, and it will be clickable.</p> :
                                    newElementType === "image" ?
                                        <p>Upload an image, and it will be stored in the cloud and displayed
                                            naturally!</p> :
                                        <p>Unknown element type</p>
                    }
                </div>

                {
                    newElementType === "title" ?
                        <Input placeholder={"title"} value={newElementContent}
                               setValueAction={setNewElementContent}/> :
                        newElementType === "text" ?
                            <Textarea value={newElementContent} onChangeAction={setNewElementContent}/> :
                            newElementType === "link" ?
                                <Input validatorAction={StringUtil.domainValidator} iconName={"globe"}
                                       placeholder={"link"} value={newElementContent}
                                       setValueAction={setNewElementContent}/> :
                                newElementType === "image" ?
                                    <ImageInput setFileAction={setNewElementFile}/> :
                                    <p>unknown element type</p>
                }

            </AdvancedPopup>

            <AdvancedPopup
                actions={[{
                    iconName: "trash",
                    text: "Delete",
                    actionType: ActionTypeEnum.dangerous,
                    onClick: deleteElementAction
                }]}
                icon={"warning"}
                show={showPopupDeleteElement}
                message={"This action is irreversible. This item will be permanently deleted."}
                title={`Do you really want to remove this item?`}
                closePopup={() => setShowPopupDeleteElement(false)}
            />

            <AdvancedPopup
                formAction={updateElementAction}
                icon={'edit'}
                show={showPopupEditElementContent}
                message={"Enter the new content for the element:"}
                title={'Edit element content'}
                actions={[
                    {text: "Edit", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupEditElementContent(false)}
            >
                {
                    elements?.find((el) => el.id === elementToEdit)?.element_type === "title" ?
                        <Input placeholder={"title"} value={editedElementContent}
                               setValueAction={setEditedElementContent}/> :
                        elements?.find((el) => el.id === elementToEdit)?.element_type === "text" ?
                            <Textarea value={editedElementContent} onChangeAction={setEditedElementContent}/> :
                            elements?.find((el) => el.id === elementToEdit)?.element_type === "link" ?
                                <Input validatorAction={StringUtil.domainValidator} iconName={"globe"}
                                       placeholder={"link"} value={editedElementContent}
                                       setValueAction={setEditedElementContent}/> :
                                elements?.find((el) => el.id === elementToEdit)?.element_type === "image" ?
                                    <ImageInput setFileAction={setEditedElementFile}/> :
                                    <p>Unknown element type</p>
                }
            </AdvancedPopup>
        </>

    );
}