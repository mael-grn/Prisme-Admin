"use client";

import MainPage from "@/app/components/mainPage";
import {useEffect, useState} from "react";
import {User} from "@/app/models/User";
import UserService from "@/app/service/UserService";
import LoadingPopup from "@/app/components/loadingPopup";
import AdvancedPopup from "@/app/components/advancedPopup";
import SectionElem from "@/app/components/sectionElem";
import List from "@/app/components/list";
import {DisplayWebsite, InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import DisplayWebsiteService from "@/app/service/DisplayWebsiteService";
import {useRouter} from "next/navigation";
import Form from "@/app/components/form";
import Input from "../components/Input";
import {StringUtil} from "@/app/utils/stringUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {ImageUtil} from "@/app/utils/ImageUtil";
import ImageInput from "@/app/components/imageInput";
import {ActionTypeEnum} from "@/app/components/Button";
import {TutorialCard} from "@/app/components/tutorialCard";

export default function Home() {

    const [user, setUser] = useState<User | null>(null);
    const [websites, setWebsites] = useState<DisplayWebsite[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>('Récupération des informations du profil...');
    const [websiteLoading, setWebsiteLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');

    const [showPopupCreateWebsite, setShowPopupCreateWebsite] = useState<boolean>(false);
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

        const displayWebsite : InsertableDisplayWebsite = {
            owner_id: user!.id,
            website_domain: newWebsiteDomain,
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
        setLoadingMessage("Création de la page web...");
        if (newSelectedFileHeroImage) {
            setLoadingMessage("Envoie de l'image...");
            displayWebsite.hero_image_url =await ImageUtil.uploadImage(newSelectedFileHeroImage) || undefined;
        }

        setLoadingMessage("Création de la page web...");
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
        <MainPage title={user ? `Bonjour, ${user.first_name}` : "Accueil"}>
            <div className={"w-full flex flex-col gap-1"}>
                <p className={"text-onForegroundHover"}>Gestion de vos sites web</p>
                <h1>Bienvenue !</h1>
                <p className={"text-onForegroundHover"}>Vous voyez ici tous vos sites web créés sur notre plateforme.</p>
            </div>
            <TutorialCard
                text={`
                    Vous pouvez créer des pages web personnalisées pour présenter vos projets, votre portfolio ou toute autre information que vous souhaitez partager en ligne. Utilisez le bouton "Ajouter une page web" pour commencer à créer votre première page !
                `}
                uniqueId={"welcome-page"}
            />
            <SectionElem title={"Vos pages web"}
                         loading={websiteLoading}
            actions={[
                {text: "Ajouter une page web", iconName: "add", onClick: () => setShowPopupCreateWebsite(true), actionType: ActionTypeEnum.safe },
            ]}
            >
                <TutorialCard text={"Vous voyez-ci vos pages web. Pour en créer une, il faut avoir dans un premier temps créé un nouveau projet template et le lier à un nom de domaine, que vous devrez saisir ici. Si vous ne savez pas faire, demandez à Maël."} uniqueId={"tutorial-create-website"}/>

                <List elements={websites.map((website) => { return {text: `${website.hero_title} - ${website.website_domain}`, onClick: () => router.push("/secure/" + website.id)}})}/>

            </SectionElem>
            <LoadingPopup show={loading} message={loadingMessage}/>
            <AdvancedPopup show={showPopup} closePopup={() => setShowPopup(false)} title={popupTitle} message={popupText}/>

            <Form onSubmitAction={createWebsite}>
                <AdvancedPopup
                    show={showPopupCreateWebsite}
                    closePopup={() => setShowPopupCreateWebsite(false)}
                    title={"Créer une nouvelle page web"}
                    message={"Remplissez les informations ci-dessous pour créer une nouvelle page web."}
                    actions={[
                        {text: "Créer", isForm: true, iconName: "add", actionType: ActionTypeEnum.safe},
                    ]}
                >

                    <Input placeholder={"Domaine"} iconName={"web"} value={newWebsiteDomain} setValueAction={setNewWebsiteDomain} validatorAction={StringUtil.domainValidator}/>

                    <Input placeholder={"Titre"} value={newWebsiteHeroTitle} setValueAction={setNewWebsiteHeroTitle}/>

                    <p>Vous pouvez déposer l&apos;image de la page d&apos;accueil du site :</p>
                    <ImageInput setFileAction={setNewSelectedFileHeroImage}/>

                </AdvancedPopup>
            </Form>
        </MainPage>
    )
}