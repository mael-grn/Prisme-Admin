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
import PageService from "@/app/service/pageService";
import {InsertablePage, Page} from "@/app/models/Page";
import SectionService from "@/app/service/sectionService";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {StringUtil} from "@/app/utils/stringUtil";
import Textarea from "@/app/components/textarea";
import SvgFromString from "@/app/components/SvgFromString";
import DropDown from "@/app/components/DropDown";
import {TutorialCard} from "@/app/components/tutorialCard";
import SectionAsPopup from "@/app/components/SectionAsPopup";

export default function PageVisu() {

    const [loading, setLoading] = useState(true);
    const [sectionsLoading, setSectionsLoading] = useState(true);

    const [sectionToVisualize, setSectionToVisualize] = useState<Section | null>(null);

    const [editTitleLoading, setEditTitleLoading] = useState(false);
    const [editPathLoading, setEditPathLoading] = useState(false);
    const [editDescriptionLoading, setEditDescriptionLoading] = useState(false);
    const [editIconLoading, setEditIconLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [addSectionLoading, setAddSectionLoading] = useState(false);

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
    const [newSectionTitle, setNewSectionTitle] = useState<string>('');


    const router = useRouter();
    const {websiteId, pageId} = useParams();

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
            setPopupTitle("Something went wrong");
            setPopupText(typeof e === 'string' ? e : 'Unknown error');
            setShowPopup(true);
        } finally {
            setLoading(false);
        }

    }, [websiteId, pageId]);

    function deletePageAction() {
        setShowPopupDelete(false)
        setDeleteLoading(true);
        if (!page) return;
        PageService.deletePage(page).then(() => {
            router.push('/secure/' + page.website_id);
        }).catch((e) => {
            setPopupTitle("Something went wrong");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => {
            setDeleteLoading(false);
        })
    }

    async function deleteSectionAction() {
        if (!sectionToVisualize) return;
        const sectToDelete = sectionToVisualize;
        setSectionsLoading(true);
        setSectionToVisualize(null);

        try {
            await SectionService.deleteSection(sectToDelete);
            await setSections(await SectionService.getSectionsForPageId(parseInt(pageId as string)));
        } catch (err) {
            setPopupTitle("Something went wrong");
            setPopupText(typeof err === 'string' ? err : 'Unknown error');
            setShowPopup(true);
        } finally {
            setSectionsLoading(false);
        }
    }

    async function updateSectionAction(section : Section) {
        await SectionService.updateSection(section);
        const sections = await SectionService.getSectionsForPageId(parseInt(pageId as string));
        setSections(sections);
        setSectionToVisualize(sections.find(s => s.id === section.id) || null);
    }


    function updatePageAction() {
        const editingTitle = showPopupEditTitle;
        const editingPath = showPopupEditPath;
        const editingDescription = showPopupEditDescription;
        const editingIcon = showPopupEditIcon;

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
            setPopupTitle("Something went wrong");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        const updatedPage: Page = {
            position: page.position,
            ...insertablePage,
            id: page.id
        }

        setEditTitleLoading(editingTitle);
        setEditPathLoading(editingPath);
        setEditDescriptionLoading(editingDescription);
        setEditIconLoading(editingIcon);
        PageService.updatePage(updatedPage).then(async () => {
            const tmp = await PageService.getPageById(parseInt(pageId as string))
            setPage(tmp);
            setNewTitle(tmp.title);
            setNewPath(tmp.path);
            setNewDescription(tmp.description || '');
            setNewIcon(tmp.icon_svg || '');
        }).catch((error) => {
            setPopupTitle("Something went wrong");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setEditTitleLoading(false);
            setEditPathLoading(false);
            setEditDescriptionLoading(false);
            setEditIconLoading(false);
        })
    }

    function addSectonAction() {
        setShowPopupNewSection(false);
        const newSection: InsertableSection = {
            title: newSectionTitle,
            page_id: parseInt(pageId as string),
            position: 0,
            section_type: newSectionType
        }
        const validation = FieldsUtil.checkSection(newSection)
        if (!validation.valid) {
            setPopupTitle("Invalid section data");
            setPopupText(validation.errors.join(', '));
            setShowPopup(true);
            return;
        }

        setAddSectionLoading(true);
        SectionService.insertSection(newSection).then(async () => {
            setSections(await SectionService.getSectionsForPageId(parseInt(pageId as string)));
        }).catch((error) => {
            setPopupTitle("Something went wrong");
            setPopupText(error);
            setShowPopup(true);
        }).finally(() => {
            setAddSectionLoading(false);
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
                        setPopupTitle("Something went wrong");
                        setPopupText(typeof e === 'string' ? e : 'Unknown error');
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

    return (
        <>
            <MainPage pageAlignment={PageAlignmentEnum.tileStart} loading={loading}>
                <TutorialCard
                    text={"On this page, you can manage the different sections of your page, as well as its main information such as the title, path, description, and icon. Feel free to add, edit, or delete sections to customize your page's content to suit your needs."}
                    uniqueId={"page-visualization-tutorial"}
                />
                <SectionElem loading={sectionsLoading} title={"Page's content"} width={SectionWidth.FULL}
                             actions={modifySectionOrder ? [
                                 {
                                     text: "Cancel",
                                     iconName: "close",
                                     onClick: cancelModifySectionOrder,
                                     actionType: ActionTypeEnum.dangerous
                                 },
                                 {
                                     text: "Validate",
                                     iconName: "check",
                                     onClick: validateModifySectionOrder,
                                     actionType: ActionTypeEnum.safe
                                 }
                             ] : [
                                 {
                                     text: "Reorder",
                                     iconName: "order",
                                     onClick: beginModifySectionOrder,
                                 },
                                 {
                                     text: "Create",
                                     isLoading: addSectionLoading,
                                     onClick: () => setShowPopupNewSection(true),
                                     iconName: "add",
                                     actionType: ActionTypeEnum.safe
                                 }
                             ]}>

                    <TutorialCard text={"Your page content is separated into several sections; you can manage them here."} uniqueId={"tips-sections-for-page"}/>

                    <List elements={sections?.map((sect) => {
                        return {
                            text: sect.title + " (" + sect.section_type + ")",
                            onClick: () => setSectionToVisualize(sect),
                            actions: modifySectionOrder ? [{
                                iconName: "up",
                                onClick: () => moveSectionUp(sect)
                            }, {iconName: "down", onClick: () => moveSectionDown(sect)}] : undefined
                        }
                    }) ?? []}/>

                </SectionElem>

                <SectionElem title={"Title"}
                             actions={[{isLoading: editTitleLoading, text: "Edit", onClick: () => setShowPopupEditTitle(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>
                    <p>{page?.title}</p>
                </SectionElem>

                <SectionElem title={"Path"}
                             actions={[{isLoading: editPathLoading, text: "Edit", onClick: () => setShowPopupEditPath(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>
                    <p>{page?.path}</p>
                </SectionElem>

                <SectionElem title={"Description"}
                             actions={[{ isLoading: editDescriptionLoading, text: "Edit", onClick: () => setShowPopupEditDescription(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>
                    <p>{page?.description || "Your page does not have any description for the moment."}</p>
                </SectionElem>

                <SectionElem title={"Icon"}
                             actions={[{isLoading: editIconLoading, text: "Edi ", onClick: () => setShowPopupEditIcon(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>
                    {
                        page?.icon_svg
                            ? <SvgFromString svg={page!.icon_svg} alt="icone" className="w-12 h-12 invert" />
                            : <p>Your page does not have any icone for the moment.</p>
                    }
                </SectionElem>

                <SectionElem title={"Delete"} actions={[{
                    isLoading: deleteLoading,
                    text: "Delete",
                    onClick: () => setShowPopupDelete(true),
                    iconName: "trash",
                    actionType: ActionTypeEnum.dangerous
                }]}>
                    <p>Deleting this page will cause the loss of all it&apos;s content.</p>
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
                    text: "Delete",
                    actionType: ActionTypeEnum.dangerous,
                    onClick: deletePageAction
                }]}
                icon={"warning"}
                show={showPopupDelete}
                message={"This action is irreversible. All the content of this page will be lost."}
                title={`Do you really want to delete "${page?.title}" ?`}
                closePopup={() => setShowPopupDelete(false)}
            />

            <AdvancedPopup
                formAction={updatePageAction}
                icon={'edit'}
                show={showPopupEditTitle}
                message={"Provide the new title of the page :"}
                title={"Edit page's title"}
                actions={[
                    {text: "Edit", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupEditTitle(false)}
            >
                <Input placeholder={"title"} value={newTitle} setValueAction={setNewTitle}
                />
            </AdvancedPopup>
            <AdvancedPopup
                formAction={updatePageAction}
                icon={'edit'}
                show={showPopupEditPath}
                message={"Provide the new path of the page :"}
                title={"Edit page's path"}
                actions={[
                    {text: "Edit", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupEditPath(false)}
            >
                <Input validatorAction={StringUtil.pathStringValidator} placeholder={"path"} value={newPath} setValueAction={setNewPath}
                />
            </AdvancedPopup>
            <AdvancedPopup
                formAction={updatePageAction}
                icon={'edit'}
                show={showPopupEditDescription}
                message={"Provide the new description of the page :"}
                title={"Edit page's description"}
                actions={[
                    {text: "Edit", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupEditDescription(false)}
            >
                <Textarea placeholder={"description"} value={newDescription} onChangeAction={setNewDescription}
                />
            </AdvancedPopup>

            <AdvancedPopup
                formAction={updatePageAction}
                icon={'edit'}
                show={showPopupEditIcon}
                message={"Provide the new SVG icon of the page :"}
                title={"Edit page's icon"}
                actions={[
                    {text: "Edit", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupEditIcon(false)}
            >
                <Textarea placeholder={"SVG icon"} value={newIcon} onChangeAction={setNewIcon}
                />
                <div className={"flex gap-2 items-center"}>
                    <img src={"/ico/question.svg"} alt={"tip"} className={"invert w-6 h-6"}/>
                    <p>To find an icon for your page, you can use <a className={"text-blue-600 underline"} target={"_blank"} href={"https://heroicons.com/"}>Hero Icon</a>. Copy the icon of your choice and paste it right there.</p>
                </div>
            </AdvancedPopup>

            <AdvancedPopup
                formAction={addSectonAction}
                icon={'add'}
                show={showPopupNewSection}
                message={"The title will not be visible to users, but will allow you to find the section more easily when making changes."}
                title={'Create a section'}
                actions={[
                    {text: "Create", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
                ]}
                closePopup={() => setShowPopupNewSection(false)}
            >
                <Input placeholder={"title"} value={newSectionTitle} setValueAction={setNewSectionTitle} />

                <DropDown items={sectionTypes} selectedItem={newSectionType} setSelectedItemAction={setNewSectionType} />
                <div className={"flex gap-4 items-center"}>
                    <img src={"/ico/question.svg"} alt={"tip"} className={"invert w-10 h-10"}/>
                    {
                        newSectionType === "classic" ?
                            <p>A classic section containing various elements that will be displayed one after the other.</p> :
                            newSectionType === "develop" ?
                                <p>This resembles a standard section, except that only the title is displayed by default. You need to click on it to see the full content. This is recommended when there is a lot of content to display, to avoid overloading the page.</p> :
                                newSectionType === "tile" ?
                                    <p>Similar to an expanded section, but the default formatting changes: instead of a list where items are displayed one after the other and take up all the space, the items are sort of like small &apos;squares&apos; with a layout that optimizes space.</p> :
                                    <p>Unknown section type.</p>
                    }                    </div>



            </AdvancedPopup>

            <SectionAsPopup section={sectionToVisualize} deleteSectionAction={deleteSectionAction} updateSectionAction={updateSectionAction} setSectionNullAction={() => setSectionToVisualize(null)}/>
        </>
    );
}