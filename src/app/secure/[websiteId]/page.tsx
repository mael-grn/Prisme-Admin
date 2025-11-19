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
                setPopupTitle("Une erreur s'est produite");
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
                setPopupTitle("Une erreur s'est produite");
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
            setPopupTitle("Une erreur s'est produite");
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
            setPopupTitle("La nouvelle page n'est pas valide");
            setPopupText(validation.errors.join(", "));
            return;
        }

        setAddPageLoading(true);

        try {
            await PageService.insertPage(newPage)
            setLoading(false);
            setPages(await PageService.getMyPagesFromWebsite(parseInt(websiteId as string)))
        } catch (error) {
            setPopupTitle("Une erreur s'est produite");
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
            setPopupTitle("Une erreur s'est produite");
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
            setPopupTitle("Domaine invalide");
            setPopupText("Le domaine saisi n'est pas valide.");
            return;
        }
        setDomainLoading(true);

        try {
            const newWebsite: DisplayWebsite = {...website!, website_domain: newWebsiteDomain || undefined};
            await DisplayWebsiteService.updateWebsite(newWebsite)
            setWebsite(await DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string)));
        } catch (error) {
            setPopupTitle("Une erreur s'est produite");
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
            setPopupTitle("Informations manquantes");
            setPopupText("Veuillez renseigner un titre et une image pour la landing page.");
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
            setPopupTitle("Le contenu de la landing page n'est pas valide");
            setPopupText(validation.errors.join(", "));
            setLoading(false);
            return;
        }


        try {
            await DisplayWebsiteService.updateWebsite(newWebsite)
            setWebsite(await DisplayWebsiteService.getWebsiteById(parseInt(websiteId as string)));
        } catch (error) {
            setPopupTitle("Une erreur s'est produite");
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
            setPopupTitle("Données invalides");
            setPopupText("Les couleurs spécifiées sont invalides.");
            return;
        }
        const validation = FieldsUtil.checkWebsiteColors(newColors)
        if (!validation.valid) {
            setShowPopup(true)
            setPopupTitle("Les couleurs spécifiées sont invalides");
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
            setPopupTitle("Une erreur s'est produite");
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
                        setPopupTitle("Une erreur s'est produite");
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
                    text={"Vous pouvez ici gérer votre site internet. Ajoutez, modifiez ou réorganisez les pages de votre site facilement via cette interface. Vous pouvez également modifier le domaine et le contenu de la page d'accueil de votre site."}
                    uniqueId={"gestion-website"}/>
                <SectionElem
                    width={SectionWidth.FULL}
                    loading={pagesLoading}
                    title={"Pages de votre site"}
                    actions={
                        modifyPageOrder ?
                            [
                                {
                                    text: "Annuler",
                                    iconName: "close",
                                    onClick: cancelModifyPageOrder,
                                    actionType: ActionTypeEnum.dangerous
                                },
                                {
                                    text: "Valider",
                                    iconName: "check",
                                    onClick: validateModifyPageOrder,
                                    actionType: ActionTypeEnum.safe
                                }
                            ] :
                            [

                                {
                                    text: "Réorganiser",
                                    iconName: "order",
                                    onClick: beginModifyPageOrder,
                                },
                                {isLoading: addPageLoading, text: "Ajouter", onClick: () => setShowPopupForm(true), iconName: "add", actionType: ActionTypeEnum.safe},
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

                <SectionElem title={"Titre"}
                             actions={[{isLoading: titleLoading, text: "Modifier", onClick: () => setShowPopupEditTitle(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>

                    <p>{website?.title}</p>
                </SectionElem>

                <SectionElem title={"Domaine"}
                             actions={[{isLoading: domainLoading, text: "Modifier", onClick: () => setShowPopupEditDomain(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>

                    {
                        website?.website_domain ?
                            <p>{website?.website_domain}</p>
                            :
                            <p>Vous n&apos;avez pas spécifié de domaine personnalisé pour votre site</p>
                    }
                </SectionElem>

                <SectionElem title={"Contenu de la page d'accueil"}
                             actions={[{isLoading: heroLoading, text: "Modifier", onClick: () => setShowPopupEditHero(true), iconName: "edit", actionType: ActionTypeEnum.safe}]}>

                    <p>{website?.hero_title}</p>
                    {website?.hero_image_url ?
                        <img src={website?.hero_image_url} alt={"Image de la landing page"}
                             className={"max-w-full h-auto mb-4 rounded-lg"}/> :
                        <p className={"text-onForeground italic"}>Aucune image</p>
                    }
                </SectionElem>

                <SectionElem title={"Couleurs"}
                             loading={colorsLoading}
                             actions={[{isLoading: colorsLoading, text: colors ? "Modifier" : "Créer", onClick: () => setShowPopupEditColors(true), iconName: colors ? "edit" : "add", actionType: ActionTypeEnum.safe}]}>

                    {
                        colors ?
                            <>
                                <ColorItem colorHexCode={colors.primary_color} colorName={"Primaire"} />
                                <ColorItem colorHexCode={colors.primary_variant} colorName={"Primaire 2"} />
                                <ColorItem colorHexCode={colors.secondary_color} colorName={"Secondaire"} />
                                <ColorItem colorHexCode={colors.secondary_variant} colorName={"Secondaire 2"} />
                                <ColorItem colorHexCode={colors.background_color} colorName={"Arrière plan"} />
                                <ColorItem colorHexCode={colors.background_variant} colorName={"Arrière plan 2"} />
                                <ColorItem colorHexCode={colors.background_variant_variant} colorName={"Arrière plan 3"} />
                                <ColorItem colorHexCode={colors.text_color} colorName={"Texte"} />
                                <ColorItem colorHexCode={colors.text_variant} colorName={"Texte 2"} />
                                <ColorItem colorHexCode={colors.text_variant_variant} colorName={"Texte 3"} />
                            </> :
                            <div className={"flex gap-2 justify-center flex-col items-center"}>
                                <img src={"/ico/question.svg"} alt={"interrogation"} className={"w-6 invert"}/>
                                <p>Vous n&apos;avez défini aucune couleurs pour l&apos;instant.</p>
                            </div>
                    }
                </SectionElem>

                <SectionElem title={"Supprimer le site"} actions={[{
                    isLoading: deleteLoading,
                    text: "Supprimer",
                    onClick: () => setShowPopupDelete(true),
                    iconName: "trash",
                    actionType: ActionTypeEnum.dangerous
                }]}>
                    <p>Supprimer le site entraine la perte de l&apos;intégralité de son contenu.</p>
                </SectionElem>




            </MainPage>

            <AdvancedPopup show={showPopup} message={popupText} title={popupTitle}
                           closePopup={() => setShowPopup(false)}/>

            <AdvancedPopup
                show={showPopupDelete}
                message={"L'entièreté de son contenu sera également supprimé."}
                title={"Voulez-vous vraiment supprimer ce site ?"}
                icon={"trash"}
                actions={[
                    {
                        text: "Supprimer",
                        actionType: ActionTypeEnum.dangerous,
                        iconName: "trash",
                        onClick: deleteWebsiteAction
                    },
                ]}
                closePopup={() => setShowPopupDelete(false)}/>

            <AdvancedPopup show={showPopupForm}
                           formAction={addPageAction}
                           message={"Saisissez les informations requises ci-dessous afin d'ajouter une nouvelle page à votre site :"}
                           title={"Créer une nouvelle page"}
                           icon={"add"}
                           actions={[
                               {text: "Valider", isForm: true, iconName: "check", actionType: ActionTypeEnum.safe}
                           ]}
                           closePopup={() => setShowPopupForm(false)}>
                <Input placeholder={"Chemin de la page"} value={newPagePath} setValueAction={setNewPagePath}
                       validatorAction={StringUtil.pathStringValidator}
                       iconName={"globe"}/>
                <Input placeholder={"Titre"} value={newPageTitle} setValueAction={setNewPageTitle}/>

                <Textarea value={newPageDescription} onChangeAction={setNewPageDescription}
                          placeholder={"Description"}/>

                <Textarea value={newPageIcon} onChangeAction={setNewPageIcon}
                          placeholder={"Icone au format SVG (facultatif)"}/>

            </AdvancedPopup>

            <AdvancedPopup icon={"edit"} show={showPopupEditTitle} title={"Modifier le nom du site"}
                           formAction={editTitleAction}
                           message={"Saisissez le nouveau nom de votre site ci-dessous :"} actions={[{
                text: "Valider",
                isForm: true,
                iconName: "check",
                actionType: ActionTypeEnum.safe
            }]} closePopup={() => setShowPopupEditTitle(false)}>

                <Input
                    placeholder={"Nouveau titre"} value={newWebsiteTitle}
                    setValueAction={setNewWebsiteTitle}/>
            </AdvancedPopup>

            <AdvancedPopup formAction={editDomainAction} icon={"edit"} show={showPopupEditDomain} title={"Modifier le domaine du site"}
                           message={"Saisissez le nouveau domaine de votre site ci-dessous :"} actions={[{
                text: "Valider",
                isForm: true,
                iconName: "check",
                actionType: ActionTypeEnum.safe
            }]} closePopup={() => setShowPopupEditDomain(false)}>

                <Input iconName={"globe"} validatorAction={StringUtil.emptyableDomainValidator}
                       placeholder={"Nouveau domaine"} value={newWebsiteDomain || ""}
                       setValueAction={setNewWebsiteDomain}/>
                {
                    website?.website_domain ?
                        <div className={"bg-onBackgroundHover rounded-xl p-3 flex gap-2 items-center"}>
                            <img src={"/ico/info.svg"} alt={'info'} className={"invert w-12 h-fit"}/>
                            <p>Vous pouvez supprimer le domaine, Votre site sera alors hébergé sur la plateforme Prisme.</p>
                        </div> :
                        <div className={"bg-dangerous rounded-xl p-3 flex gap-2 items-center"}>
                            <img src={"/ico/warning.svg"} alt={'warning'} className={"invert w-12 h-fit"}/>
                            <p>Attention, ne modifiez le domaine de votre site seulement si vous savez ce que vous
                                faites, car celui-ci risque d&apos;être inaccessible.</p>
                        </div>
                }

            </AdvancedPopup>

            <AdvancedPopup icon={"edit"} formAction={editHeroAction} show={showPopupEditHero} title={"Modifier le contenu de la landing page"}
                           message={"Saisissez le contenu de la landing page de votre site ci-dessous :"}
                           actions={[{
                               text: "Valider",
                               isForm: true,
                               iconName: "check",
                               actionType: ActionTypeEnum.safe
                           }]} closePopup={() => setShowPopupEditHero(false)}>
                <Input placeholder={"Titre"} value={newWebsiteHeroTitle} setValueAction={setNewWebsiteHeroTitle}/>
                <ImageInput setFileAction={setNewWebsiteHeroFile}/>
            </AdvancedPopup>

            <AdvancedPopup icon={colors ? "edit" : "add"} formAction={editWebsiteColorsAction} show={showPopupEditColors} title={"Modifier les couleurs de votre site"}
                           message={"Selectionnez les couleurs utilisées sur votre site ci-dessous :"}
                           actions={[{
                               text: "Valider",
                               isForm: true,
                               iconName: "check",
                               actionType: ActionTypeEnum.safe
                           }]} closePopup={() => setShowPopupEditColors(false)}>
                <ColorItem colorHexCode={newColors?.primary_color} colorName={"Primaire"} onChangeAction={(newColor) => {
                    setNewColors(ColorUtil.setPrimaryColorAuto(newColors!, newColor))
                }}/>
                <ColorItem colorHexCode={newColors?.secondary_color} colorName={"Secondaire"} onChangeAction={(newColor) => {
                    setNewColors(ColorUtil.setSecondaryColorAuto(newColors!, newColor))
                }}/>
                <ColorItem colorHexCode={newColors?.background_color} colorName={"Arrière-plan"} onChangeAction={(newColor) => {
                    setNewColors(ColorUtil.setBackgroundColorAuto(newColors!, newColor))
                }}/>
                <ColorItem colorHexCode={newColors?.text_color} colorName={"Texte"} onChangeAction={(newColor) => {
                    setNewColors(ColorUtil.setTextColorAuto(newColors!, newColor))
                }}/>

                <div className={"flex gap-2 items-center"}>
                    <img src={"/ico/question.svg"} alt={"question"} className={"w-8 invert"}/>
                    <p>Des variantes des couleurs sélectionnées seront automatiquement générées.</p>
                </div>
            </AdvancedPopup>
        </>

    )
}