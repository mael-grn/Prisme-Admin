"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import MainPage, {PageAlignmentEnum} from "@/app/components/mainPage";
import SectionElem, {SectionWidth} from "@/app/components/sectionElem";
import List from "@/app/components/list";
import AdvancedPopup from "@/app/components/advancedPopup";
import Input from "@/app/components/Input";
import {DisplayWebsite} from "@/app/models/DisplayWebsite";
import {InsertablePage, Page} from "@/app/models/Page";
import DisplayWebsiteService from "@/app/service/DisplayWebsiteService";
import PageService from "@/app/service/pageService";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {StringUtil} from "@/app/utils/stringUtil";
import {ActionTypeEnum} from "@/app/components/Button";
import Textarea from "@/app/components/textarea";
import ImageInput from "@/app/components/imageInput";
import {ImageUtil} from "@/app/utils/ImageUtil";
import {TutorialCard} from "@/app/components/tutorialCard";
import { getDefaultColors, InsertableWebsiteColors, WebsiteColors} from "@/app/models/WebsiteColors";
import ColorItem from "@/app/components/ColorItem";
import ColorUtil from "@/app/utils/colorUtil";

export default function Pages() {

    const [pages, setPages] = useState<Page[]>([]);
    const [website, setWebsite] = useState<DisplayWebsite | null>(null);
    const [colors, setColors] = useState<WebsiteColors | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [pagesLoading, setPagesLoading] = useState<boolean>(true);
    const [addPageLoading, setAddPageLoading] = useState<boolean>(false);
    const [titleLoading, setTitleLoading] = useState<boolean>(false);
    const [domainLoading, setDomainLoading] = useState<boolean>(false);
    const [heroLoading, setHeroLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [colorsLoading, setColorsLoading] = useState<boolean>(true);

    const [showPopupForm, setShowPopupForm] = useState<boolean>(false);

    const [showPopupDelete, setShowPopupDelete] = useState<boolean>(false);

    const [showPopupEditTitle, setShowPopupEditTitle] = useState<boolean>(false);

    const [showPopupEditDomain, setShowPopupEditDomain] = useState<boolean>(false);

    const [showPopupEditHero, setShowPopupEditHero] = useState<boolean>(false);

    const [showPopupEditColors, setShowPopupEditColors] = useState<boolean>(false);


    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const [newPageTitle, setNewPageTitle] = useState<string>('');
    const [newPagePath, setNewPagePath] = useState<string>('');
    const [newPageIcon, setNewPageIcon] = useState<string>('');
    const [newPageDescription, setNewPageDescription] = useState<string>('');
    const [newWebsiteTitle, setNewWebsiteTitle] = useState<string>('');

    const [newWebsiteDomain, setNewWebsiteDomain] = useState<string | null>(null);

    const [newWebsiteHeroTitle, setNewWebsiteHeroTitle] = useState<string>('');
    const [newWebsiteHeroFile, setNewWebsiteHeroFile] = useState<File | null>(null);

    const [newColors, setNewColors] = useState<InsertableWebsiteColors | null>(null);

    const [modifyPageOrder, setModifyPageOrder] = useState<boolean>(false);
    const [modifiedPages, setModifiedPages] = useState<number[]>([]);

    const router = useRouter();
    const {websiteId} = useParams();


    useEffect(() => {
        DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string))
            .then((website) => {
                setWebsite(website)
                setNewWebsiteDomain(website.website_domain || null)
                setNewWebsiteTitle(website.title)
                setNewWebsiteHeroTitle(website.hero_title)
            }).catch((e) => {
                setPopupTitle("Something went wrong");
                setPopupText(e);
                setShowPopup(true);
            }).finally(() => setLoading(false   ));

        DisplayWebsiteService.getColors(parseInt(websiteId as string))
            .then((c) => {
                setColors(c);
                setNewColors(c)
            })
            .catch((e) => {
                console.log(e);
                setColors(null);
                setNewColors(() => getDefaultColors(parseInt(websiteId as string)));
            }).finally(() => setColorsLoading(false));

        PageService.getMyPagesFromWebsite(parseInt(websiteId as string))
            .then((p) => setPages(p))
            .catch((e) => {
                setPopupTitle("Something went wrong");
                setPopupText(e);
                setShowPopup(true);
            }).finally(() => setPagesLoading(false));
    }, [websiteId]);

    async function deleteWebsiteAction() {
        setShowPopupDelete(false);

        setDeleteLoading(true);

        try {
            await DisplayWebsiteService.deleteWebsite(parseInt(websiteId as string))
            router.push("/secure");
        } catch (e) {
            setPopupTitle("Something went wrong");
            setPopupText(String(e));
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    }

    async function addPageAction() {

        setShowPopupForm(false);

        const newPage: InsertablePage = {
            title: newPageTitle,
            website_id: website!.id,
            path: newPagePath,
        }

        const validation = FieldsUtil.checkPage(newPage)
        if (!validation.valid) {
            setShowPopup(true)
            setPopupTitle("Page information are not valid");
            setPopupText(validation.errors.join(", "));
            return;
        }

        setAddPageLoading(true);

        try {
            await PageService.insertPage(newPage)
            setLoading(false);
            setPages(await PageService.getMyPagesFromWebsite(parseInt(websiteId as string)))
        } catch (error) {
            setPopupTitle("Something went wrong");
            setPopupText(String(error));
            setShowPopup(true);
        } finally {
            setAddPageLoading(false);
        }

    }

    const editTitleAction = async () => {
        setShowPopupEditTitle(false);
        if (!newWebsiteTitle || newWebsiteTitle.length === 0) return;
        setTitleLoading(true);

        try {
            const newWebsite: DisplayWebsite = {...website!, title: newWebsiteTitle};
            await DisplayWebsiteService.updateWebsite(newWebsite)
            setWebsite(await DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string)));
        } catch (error) {
            setPopupTitle("Something went wrong");
            setPopupText(String(error));
            setShowPopup(true);
        } finally {
            setTitleLoading(false);
        }
    }

    const editDomainAction = async () => {
        setShowPopupEditDomain(false);
        if (newWebsiteDomain&&StringUtil.domainValidator(newWebsiteDomain)) {
            setShowPopup(true);
            setPopupTitle("Invalid domain");
            setPopupText("Please enter a valid domain.");
            return;
        }
        setDomainLoading(true);

        try {
            const newWebsite: DisplayWebsite = {...website!, website_domain: newWebsiteDomain || undefined};
            await DisplayWebsiteService.updateWebsite(newWebsite)
            setWebsite(await DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string)));
        } catch (error) {
            setPopupTitle("Something went wrong");
            setPopupText(String(error));
            setShowPopup(true);
        } finally {
            setDomainLoading(false);
        }
    }

    const editHeroAction = async () => {
        setShowPopupEditHero(false);

        if (!newWebsiteHeroTitle || newWebsiteHeroTitle.length === 0) {
            setShowPopup(true);
            setPopupTitle("Missing information");
            setPopupText("Please provide a title for the homepage.");
            return;
        }

        const newWebsite: DisplayWebsite = {...website!, hero_title: newWebsiteHeroTitle};

        setHeroLoading(true);

        if (newWebsiteHeroFile) {
            newWebsite.hero_image_url = await ImageUtil.uploadImage(newWebsiteHeroFile)
        }

        const validation = FieldsUtil.checkDisplayWebsite(newWebsite)
        if (!validation.valid) {
            setShowPopup(true)
            setPopupTitle("The landing page information are not valid");
            setPopupText(validation.errors.join(", "));
            setLoading(false);
            return;
        }


        try {
            await DisplayWebsiteService.updateWebsite(newWebsite)
            setWebsite(await DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string)));
        } catch (error) {
            setPopupTitle("Something went wrong");
            setPopupText(String(error));
            setShowPopup(true);
        } finally {
            setHeroLoading(false);
        }
    }

    async function editWebsiteColorsAction() {
        setShowPopupEditColors(false);
        if (!newColors)  {
            setShowPopup(true)
            setPopupTitle("Invalid colors");
            setPopupText("Specified colors are invalid.");
            return;
        }
        const validation = FieldsUtil.checkWebsiteColors(newColors)
        if (!validation.valid) {
            setShowPopup(true)
            setPopupTitle("Specified colors are not valid");
            setPopupText(validation.errors.join(", "));
            return;
        }

        setColorsLoading(true);

        newColors.website_id = parseInt(websiteId as string);

        try {
            if (colors) {
                await DisplayWebsiteService.updateColors(website!.id, newColors);
            } else {
                await DisplayWebsiteService.insertColors(website!.id, newColors);
            }
            const updatedColors = await DisplayWebsiteService.getColors(parseInt(websiteId as string));
            setColors(updatedColors);
            setNewColors(updatedColors);
        } catch (error) {
            setPopupTitle("Something went wrong");
            setPopupText(String(error));
            setShowPopup(true);
        } finally {
            setColorsLoading(false);
        }
    }

    function beginModifyPageOrder() {
        setModifyPageOrder(true);
    }

    async function cancelModifyPageOrder() {
        setModifyPageOrder(false);

        setPagesLoading(true)
        setPages(await PageService.getMyPagesFromWebsite(parseInt(websiteId as string)));
        setPagesLoading(false);
    }

    function validateModifyPageOrder() {
        setPagesLoading(true)

        async function loadData() {
            if (!pages) {
                return;
            }
            for (const page of pages) {
                if (modifiedPages && modifiedPages.includes(page.id)) {
                    try {
                        await PageService.movePage(page);
                    } catch (e) {
                        setPages(await PageService.getMyPagesFromWebsite(parseInt(websiteId as string)));
                        setPagesLoading(false);
                        setPopupTitle("Something went wrong");
                        setPopupText(String(e));
                        setShowPopup(true);
                        break;
                    }

                }
            }
            setPages(await PageService.getMyPagesFromWebsite(parseInt(websiteId as string)));
            setPagesLoading(false);
        }

        loadData();
        setModifyPageOrder(false);
    }

    function movePageUp(page: Page) {
        if (!pages) {
            return;
        }
        const newPages: Page[] = [...pages];
        if (page.position === 1) {
            return;
        }

        const modSect: number[] = [...modifiedPages];
        modSect?.push(newPages.find(s => s.position === page.position - 1)!.id);
        modSect?.push(page.id);
        setModifiedPages(modSect)

        newPages.find(s => s.position === page.position - 1)!.position++;
        newPages.find(s => s.id === page.id)!.position--;
        newPages.sort((a, b) => a.position - b.position);
        setPages(newPages);
    }

    function movePageDown(page: Page) {
        if (!pages) {
            return;
        }
        const newPages: Page[] = [...pages];
        if (page.position === pages.length) {
            return;
        }

        const modSect: number[] = [...modifiedPages];
        modSect?.push(newPages.find(s => s.position === page.position + 1)!.id);
        modSect?.push(page.id);
        setModifiedPages(modSect)

        newPages.find(s => s.position === page.position + 1)!.position--;
        newPages.find(s => s.id === page.id)!.position++;
        newPages.sort((a, b) => a.position - b.position);
        setPages(newPages);
    }

    return (
        <>
            <MainPage pageAlignment={PageAlignmentEnum.tileStart} loading={loading}>
                <TutorialCard
                    text={"Here you can manage your website. Easily add, edit, or rearrange your site's pages through this interface. You can also change your site's domain and homepage content."}
                    uniqueId={"gestion-website"}/>
                <SectionElem
                    width={SectionWidth.FULL}
                    loading={pagesLoading}
                    title={"Pages from your website"}
                    actions={
                        modifyPageOrder ?
                            [
                                {
                                    text: "Cancel",
                                    iconName: "close",
                                    onClick: cancelModifyPageOrder,
                                    actionType: ActionTypeEnum.dangerous
                                },
                                {
                                    text: "Done",
                                    iconName: "check",
                                    onClick: validateModifyPageOrder,
                                    actionType: ActionTypeEnum.safe
                                }
                            ] :
                            [

                                {
                                    text: "Reorder",
                                    iconName: "order",
                                    onClick: beginModifyPageOrder,
                                },
                                {isLoading: addPageLoading, text: "Create", onClick: () => setShowPopupForm(true), iconName: "add", actionType: ActionTypeEnum.safe},
                            ]
                    }>

                    <List elements={pages.map((page) => {
                        return {
                            text: page.title,
                            onClick: () => router.push(`/secure/${websiteId}/${page.id}`),
                            actions: modifyPageOrder ? [{
                                iconName: "up",
                                onClick: () => movePageUp(page)
                            }, {iconName: "down", onClick: () => movePageDown(page)}] : undefined
                        }
                    })}/>

                </SectionElem>

                <SectionElem title={"Title"}
                             actions={[{isLoading: titleLoading, text: "Edit", onClick: () => setShowPopupEditTitle(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>

                    <p>{website?.title}</p>
                </SectionElem>

                <SectionElem title={"Domain"}
                             actions={[{isLoading: domainLoading, text: "Edit", onClick: () => setShowPopupEditDomain(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>

                    {
                        website?.website_domain ?
                            <p>{website?.website_domain}</p>
                            :
                            <p>Your website doesn&apos;t have any custom domain for the moment.</p>
                    }
                </SectionElem>

                <SectionElem title={"Landing page's content"}
                             actions={[{isLoading: heroLoading, text: "edit", onClick: () => setShowPopupEditHero(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>

                    <p>{website?.hero_title}</p>
                    {website?.hero_image_url ?
                        <img src={website?.hero_image_url} alt={"Image de la landing page"}
                             className={"max-w-full h-auto mb-4 rounded-lg"}/> :
                        <p className={"text-onForeground italic"}>No image</p>
                    }
                </SectionElem>

                <SectionElem title={"Colors"}
                             loading={colorsLoading}
                             actions={[{isLoading: colorsLoading, text: colors ? "Edit" : "Create", onClick: () => setShowPopupEditColors(true), iconName: colors ? "edit" : "add", actionType: ActionTypeEnum.safe}]}>

                    {
                        colors ?
                            <>
                                <ColorItem colorHexCode={colors.primary_color} colorName={"Primary"} />
                                <ColorItem colorHexCode={colors.primary_variant} colorName={"Primary 2"} />
                                <ColorItem colorHexCode={colors.secondary_color} colorName={"Secondary"} />
                                <ColorItem colorHexCode={colors.secondary_variant} colorName={"Secondary 2"} />
                                <ColorItem colorHexCode={colors.background_color} colorName={"Background"} />
                                <ColorItem colorHexCode={colors.background_variant} colorName={"Background 2"} />
                                <ColorItem colorHexCode={colors.background_variant_variant} colorName={"Background 3"} />
                                <ColorItem colorHexCode={colors.text_color} colorName={"Text"} />
                                <ColorItem colorHexCode={colors.text_variant} colorName={"Text 2"} />
                                <ColorItem colorHexCode={colors.text_variant_variant} colorName={"Text 3"} />
                            </> :
                            <div className={"flex gap-2 justify-center flex-col items-center"}>
                                <img src={"/ico/question.svg"} alt={"interrogation"} className={"w-6 invert"}/>
                                <p>You haven&apos;t selected any custom colors for the moment.</p>
                            </div>
                    }
                </SectionElem>

                <SectionElem title={"Delete this website"} actions={[{
                    isLoading: deleteLoading,
                    text: "Delete",
                    onClick: () => setShowPopupDelete(true),
                    iconName: "trash",
                    actionType: ActionTypeEnum.dangerous
                }]}>
                    <p>Deleting this website will cause the lost of all linked data.</p>
                </SectionElem>




            </MainPage>

            <AdvancedPopup show={showPopup} message={popupText} title={popupTitle}
                           closePopup={() => setShowPopup(false)}/>

            <AdvancedPopup
                show={showPopupDelete}
                message={"The content of this site will be permanently deleted. This action cannot be undone."}
                title={"Do you really want to delete this website ?"}
                icon={"trash"}
                actions={[
                    {
                        text: "Delete",
                        actionType: ActionTypeEnum.dangerous,
                        iconName: "trash",
                        onClick: deleteWebsiteAction
                    },
                ]}
                closePopup={() => setShowPopupDelete(false)}/>

            <AdvancedPopup show={showPopupForm}
                           formAction={addPageAction}
                           message={"Enter the information of the new page below :"}
                           title={"Créer a new page"}
                           icon={"add"}
                           actions={[
                               {text: "Create", isForm: true, iconName: "check", actionType: ActionTypeEnum.safe}
                           ]}
                           closePopup={() => setShowPopupForm(false)}>
                <Input placeholder={"path"} value={newPagePath} setValueAction={setNewPagePath}
                       validatorAction={StringUtil.pathStringValidator}
                       iconName={"globe"}/>
                <Input placeholder={"title"} value={newPageTitle} setValueAction={setNewPageTitle}/>

                <Textarea value={newPageDescription} onChangeAction={setNewPageDescription}
                          placeholder={"description"}/>

                <Textarea value={newPageIcon} onChangeAction={setNewPageIcon}
                          placeholder={"svg icon (not necessary)"}/>

            </AdvancedPopup>

            <AdvancedPopup icon={"edit"} show={showPopupEditTitle} title={"Edit website title"}
                           formAction={editTitleAction}
                           message={"Enter the new title"} actions={[{
                text: "Edit",
                isForm: true,
                iconName: "check",
                actionType: ActionTypeEnum.safe
            }]} closePopup={() => setShowPopupEditTitle(false)}>

                <Input
                    placeholder={"new title"} value={newWebsiteTitle}
                    setValueAction={setNewWebsiteTitle}/>
            </AdvancedPopup>

            <AdvancedPopup formAction={editDomainAction} icon={"edit"} show={showPopupEditDomain} title={"Edit website domain"}
                           message={"Enter the new domain"} actions={[{
                text: "Edit",
                isForm: true,
                iconName: "check",
                actionType: ActionTypeEnum.safe
            }]} closePopup={() => setShowPopupEditDomain(false)}>

                <Input iconName={"globe"} validatorAction={StringUtil.emptyableDomainValidator}
                       placeholder={"new domain"} value={newWebsiteDomain || ""}
                       setValueAction={setNewWebsiteDomain}/>
                {
                    website?.website_domain ?
                        <div className={"bg-onBackgroundHover rounded-xl p-3 flex gap-2 items-center"}>
                            <img src={"/ico/info.svg"} alt={'info'} className={"invert w-12 h-fit"}/>
                            <p>If you enter an empty domain, your website will still be accessible through prism&apos;s domain.</p>
                        </div> :
                        <div className={"bg-dangerous rounded-xl p-3 flex gap-2 items-center"}>
                            <img src={"/ico/warning.svg"} alt={'warning'} className={"invert w-12 h-fit"}/>
                            <p>Careful, you need to have properly configured your project to use a custom domain.</p>
                        </div>
                }

            </AdvancedPopup>

            <AdvancedPopup icon={"edit"} formAction={editHeroAction} show={showPopupEditHero} title={"Edit landing page content"}
                           message={"Enter the new information for your landing page below :"}
                           actions={[{
                               text: "Edit",
                               isForm: true,
                               iconName: "check",
                               actionType: ActionTypeEnum.safe
                           }]} closePopup={() => setShowPopupEditHero(false)}>
                <Input placeholder={"title"} value={newWebsiteHeroTitle} setValueAction={setNewWebsiteHeroTitle}/>
                <ImageInput setFileAction={setNewWebsiteHeroFile}/>
            </AdvancedPopup>

            <AdvancedPopup icon={colors ? "edit" : "add"} formAction={editWebsiteColorsAction} show={showPopupEditColors} title={"Edit website colors"}
                           message={"You can select the main colors of your website below :"}
                           actions={[{
                               text: "Done",
                               isForm: true,
                               iconName: "check",
                               actionType: ActionTypeEnum.safe
                           }]} closePopup={() => setShowPopupEditColors(false)}>
                <ColorItem colorHexCode={newColors?.primary_color} colorName={"Primary"} changeColorAction={(newColor) => {
                    setNewColors(ColorUtil.setPrimaryColorAuto(newColors!, newColor))
                }}/>
                <ColorItem colorHexCode={newColors?.secondary_color} colorName={"Secondary"} changeColorAction={(newColor) => {
                    setNewColors(ColorUtil.setSecondaryColorAuto(newColors!, newColor))
                }}/>
                <ColorItem colorHexCode={newColors?.background_color} colorName={"Background"} changeColorAction={(newColor) => {
                    setNewColors(ColorUtil.setBackgroundColorAuto(newColors!, newColor))
                }}/>
                <ColorItem colorHexCode={newColors?.text_color} colorName={"Text"} changeColorAction={(newColor) => {
                    setNewColors(ColorUtil.setTextColorAuto(newColors!, newColor))
                }}/>

                <div className={"flex gap-2 items-center"}>
                    <img src={"/ico/question.svg"} alt={"question"} className={"w-8 invert"}/>
                    <p>Variants will be automatically generated.</p>
                </div>
            </AdvancedPopup>
        </>

    )
}