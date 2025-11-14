"use client";

import MainPage from "@/app/components/mainPage";
import {useEffect, useState} from "react";
import {User} from "@/app/models/User";
import UserService from "@/app/service/UserService";
import AdvancedPopup from "@/app/components/advancedPopup";
import SectionElem from "@/app/components/sectionElem";
import List from "@/app/components/list";
import {DisplayWebsite, InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import DisplayWebsiteService from "@/app/service/DisplayWebsiteService";
import {useRouter} from "next/navigation";
import Input from "../components/Input";
import {StringUtil} from "@/app/utils/stringUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {ImageUtil} from "@/app/utils/ImageUtil";
import ImageInput from "@/app/components/imageInput";
import {ActionTypeEnum} from "@/app/components/Button";
import {TutorialCard} from "@/app/components/tutorialCard";
import Toggle from "@/app/components/toggle";

export default function Home() {

    const [user, setUser] = useState<User | null>(null);
    const [websites, setWebsites] = useState<DisplayWebsite[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [websiteLoading, setWebsiteLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const [showPopupCreateWebsite, setShowPopupCreateWebsite] = useState<boolean>(false);
    const [websiteTitle, setWebsiteTitle] = useState<string>('');
    const [usingCustomWebsiteDomain, setUsingCustomWebsiteDomain] = useState<boolean>(false);
    const [newWebsiteDomain, setNewWebsiteDomain] = useState<string>('');
    const [newWebsiteHeroTitle, setNewWebsiteHeroTitle] = useState<string>('');
    const [newSelectedFileHeroImage, setNewSelectedFileHeroImage] = useState<File | null>(null);

    useEffect(() => {

        UserService.getMyUser().then((user) => {
            setUser(user);
        }).catch((e) => {
            setPopupTitle("Une erreur s'est produite lors de la récupération de votre profil");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => setLoading(false));

        DisplayWebsiteService.getMyWebsites().then((websites) => {
            setWebsites(websites);
        }).catch((e) => {
            setPopupTitle("Une erreur s'est produite lors de la récupération de vos pages web");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => setWebsiteLoading(false));
    }, [])

    const router = useRouter();


    const createWebsite = async () => {

        setShowPopupCreateWebsite(false);

        const displayWebsite: InsertableDisplayWebsite = {
            owner_id: user!.id,
            title: websiteTitle,
            website_domain: usingCustomWebsiteDomain ? newWebsiteDomain : undefined,
            hero_title: newWebsiteHeroTitle,
        };

        const validation = FieldsUtil.checkDisplayWebsite(displayWebsite);
        if (!validation.valid) {
            setPopupTitle("Erreur lors de la saisie des informations");
            setPopupText(validation.errors.join(", "));
            setShowPopup(true);
            return;
        }
        setLoading(true);
        if (newSelectedFileHeroImage) {
            displayWebsite.hero_image_url = await ImageUtil.uploadImage(newSelectedFileHeroImage) || undefined;
        }

        try {
            await DisplayWebsiteService.createNewWebsite(displayWebsite)
        } catch (e) {
            setPopupTitle("Une erreur s'est produite lors de la création de votre pages web");
            setPopupText(e as string || "Pas de détails disponibles.");
            setShowPopup(true);
        } finally {
            setLoading(false);
        }

        setWebsiteLoading(true);
        setWebsites(await DisplayWebsiteService.getMyWebsites());
        setWebsiteLoading(false);
    }

    return (
        <>
            <MainPage loading={loading}>
                <div className={"w-full flex flex-col gap-4 items-center justify-center mb-12"}>
                    <img src={"/img/icon.png"} alt={"icon"} className={"md:w-52 w-32"}/>
                    <h1>Bonjour, {user?.first_name || "jeune inconnu"}</h1>
                </div>
                <TutorialCard
                    text={`
                    Vous pouvez créer des sites internet personnalisées pour présenter vos projets, votre portfolio ou toute autre information que vous souhaitez partager en ligne. Utilisez le bouton "Ajouter une page web" pour commencer à créer votre première page !
                `}
                    uniqueId={"welcome-page"}
                />
                <SectionElem title={"Vos sites internet"}
                             loading={websiteLoading}

                             actions={[
                                 {
                                     text: "Créer un site internet",
                                     iconName: "add",
                                     onClick: () => setShowPopupCreateWebsite(true),
                                     actionType: ActionTypeEnum.safe
                                 },
                             ]}
                >

                    <List elements={websites.map((website) => {
                        return {
                            actions: [{
                                iconName: "redirect", type: ActionTypeEnum.safe, onClick: () => {
                                    if (website.website_domain) {
                                        router.push("https://" + website.website_domain)
                                    } else {
                                        router.push("https://prisme.maelg.fr/" + website.title.replace(" ", "%20"))
                                    }
                                }
                            }], text: `${website.title}`, onClick: () => router.push("/secure/" + website.id)
                        }
                    })}/>

                </SectionElem>





            </MainPage>

            <AdvancedPopup show={showPopup} closePopup={() => setShowPopup(false)} title={popupTitle}
                           message={popupText}/>

            <AdvancedPopup
                formAction={createWebsite}
                show={showPopupCreateWebsite}
                closePopup={() => setShowPopupCreateWebsite(false)}
                title={"Créer une nouvelle page web"}
                message={"Remplissez les informations ci-dessous pour créer une nouvelle page web."}
                actions={[
                    {text: "Créer", isForm: true, iconName: "add", actionType: ActionTypeEnum.safe},
                ]}
            >

                <Input placeholder={"Nom du site"} value={websiteTitle} setValueAction={setWebsiteTitle}/>

                <div className={"flex gap-2 items-center"}>
                    <p>Utiliser un domaine personalisé</p>
                    <Toggle checked={usingCustomWebsiteDomain} onChangeAction={setUsingCustomWebsiteDomain}/>
                </div>


                {
                    usingCustomWebsiteDomain && <>
                        <Input placeholder={"Domaine"} iconName={"web"} value={newWebsiteDomain}
                               setValueAction={setNewWebsiteDomain} validatorAction={StringUtil.domainValidator}/>
                        <div className={"bg-dangerous rounded-xl p-3 flex gap-2 items-center"}>
                            <img src={"/ico/warning.svg"} alt={'warning'} className={"invert w-12 h-fit"}/>
                            <p>Attention, ne modifiez le domaine de votre site seulement si vous savez ce que vous
                                faites, car celui-ci risque d&apos;être inaccessible.</p>
                        </div>
                    </>
                }

                <div
                    className={"flex gap-4 flex-col justify-center w-full p-3 rounded-xl border-2 border-onBackgroundHover items-center"}>
                    <h3>Contenu de la page d&apos;accueil</h3>
                    <Input placeholder={"Titre"} value={newWebsiteHeroTitle}
                           setValueAction={setNewWebsiteHeroTitle}/>
                    <ImageInput setFileAction={setNewSelectedFileHeroImage}/>
                </div>


            </AdvancedPopup>
        </>

    )
}