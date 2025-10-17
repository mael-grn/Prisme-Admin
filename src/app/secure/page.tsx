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
import {put} from "@vercel/blob";
import Form from "@/app/components/form";
import Input from "../components/Input";
import {StringUtil} from "@/app/utils/stringUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";

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
    const [newHeroImageSrc, setNewHeroImageSrc] = useState<string | null>(null);
    const [isDraggingNewWebsite, setIsDraggingNewWebsite] = useState<boolean>(false);

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
        })
    }, [])

    const router = useRouter();

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDragEnter = () => {
        setIsDraggingNewWebsite(true);
    };

    const handleDragLeave = () => {
        setIsDraggingNewWebsite(false);
    };

    async function uploadImage() : Promise<string | null> {
        if (!newSelectedFileHeroImage) {
            return null;
        }
        const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        try {
            const blobRes = await put(newSelectedFileHeroImage.name, newSelectedFileHeroImage, {
                access: 'public',
                token: token,
            });
            return blobRes.url;
        } catch (error) {
            setPopupTitle("Erreur");
            setPopupText((error as Error).message);
            setShowPopup(true);
            return null;
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setNewSelectedFileHeroImage(file);
            const tempUrl = URL.createObjectURL(file);
            setNewHeroImageSrc(tempUrl);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDraggingNewWebsite(false);
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setNewSelectedFileHeroImage(file);
            const tempUrl = URL.createObjectURL(file);
            setNewHeroImageSrc(tempUrl);
        }
    };

    const createWebsite = () => {

        setShowPopupCreateWebsite(false);

        let displayWebsite : InsertableDisplayWebsite = {
            owner_id: user!.id,
            website_domain: newWebsiteDomain,
            hero_title: newWebsiteHeroTitle,
            hero_image_url: newWebsiteDomain, // temporaire, sera mis à jour après l'upload de l'image
        };

        const validation = FieldsUtil.checkDisplayWebsite(displayWebsite);
        if (!validation.valid) {
            setPopupTitle("Erreur lors de la saisie des informations");
            setPopupText(validation.errors.map((e) => "- " + e).join("\n"));
            setShowPopup(true);
            return;
        }

        setLoading(true);
        setLoadingMessage("Envoie de l'image...");
        uploadImage().then((imageUrl) => {
            if (imageUrl) {
                displayWebsite.hero_image_url = imageUrl
                setLoadingMessage("Création de la page web...");
                DisplayWebsiteService.createNewWebsite(displayWebsite).then(() =>{
                    setWebsiteLoading(true);
                    DisplayWebsiteService.getMyWebsites().then((websites) => {
                        setWebsites(websites);
                    }).catch((e) => {
                        setPopupTitle("Une erreur s'est produite lors de la récupération de vos pages web");
                        setPopupText(e);
                        setShowPopup(true);
                    }).finally(() => setWebsiteLoading(false));
                }).catch((e) => {
                    setPopupTitle("Une erreur s'est produite lors de la création de votre pages web");
                    setPopupText(e);
                    setShowPopup(true);
                }).finally(() => setLoading(false));
            } else {
                setLoading(false);
                return;
            }
        })
    }

    return (
        <MainPage title={user ? `Bonjour, ${user.first_name}` : "Accueil"}>
            <SectionElem title={"Vos pages web"}
            actions={[
                {text: "Ajouter une page web", iconName: "add", onClick: () => setShowPopupCreateWebsite(true) },
            ]}
            >

                <List elements={websites.map((website) => { return {text: website.website_domain, onClick: () => router.push("/secure/websites/" + website.id)}})}/>

            </SectionElem>
            <LoadingPopup show={loading} message={"Chargement du profil..."}/>
            <AdvancedPopup show={showPopup} closePopup={() => setShowPopup(false)} title={popupTitle} message={popupText}/>

            <Form onSubmitAction={createWebsite}>
                <AdvancedPopup
                    show={showPopupCreateWebsite}
                    closePopup={() => setShowPopupCreateWebsite(false)}
                    title={"Créer une nouvelle page web"}
                    message={"Remplissez les informations ci-dessous pour créer une nouvelle page web."}
                    actions={[
                        {text: "Créer", isForm: true, iconName: "add"},
                    ]}
                >

                    <Input placeholder={"Domaine"} iconName={"web"} value={newWebsiteDomain} setValueAction={setNewWebsiteDomain} validatorAction={StringUtil.httpsDomainValidator}/>

                    <Input placeholder={"Titre"} value={newWebsiteHeroTitle} setValueAction={setNewWebsiteHeroTitle}/>

                    <div>
                        <label htmlFor={"file-input"}>
                            <div

                                className={`h-fit w-full relative p-3 rounded-lg flex justify-center items-center gap-3 cursor-pointer hover:bg-onBackgroundHover ${isDraggingNewWebsite ? "bg-onBackgroundHover pt-10 pb-10" : "bg-background"}`}>

                                {
                                    newSelectedFileHeroImage ?

                                        <>
                                            <img src={newHeroImageSrc ||  ""} alt={"new image"} className={"h-12 rounded-lg"}/>
                                            <p>{newSelectedFileHeroImage.name}</p>
                                        </>


                                        :

                                        <>
                                            <img className={"invert w-6 h-6"} src={"/ico/cloud.svg"} alt={"cloud"}/>
                                            <p>Choisir une image</p>
                                        </>


                                }
                                <span
                                    className={"absolute w-full h-full top-0 left-0 bg-transparent"}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                />
                            </div>
                        </label>
                        <input
                            className={"hidden"}
                            type={"file"}
                            id={"file-input"}
                            onChange={handleFileChange}
                            accept={"image/*"}/>
                    </div>
                </AdvancedPopup>
            </Form>
        </MainPage>
    )
}