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
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {ImageUtil} from "@/app/utils/ImageUtil";
import ImageInput from "@/app/components/imageInput";
import {ActionTypeEnum} from "@/app/components/Button";
import {TutorialCard} from "@/app/components/tutorialCard";

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
    const [newWebsiteHeroTitle, setNewWebsiteHeroTitle] = useState<string>('');
    const [newSelectedFileHeroImage, setNewSelectedFileHeroImage] = useState<File | null>(null);

    useEffect(() => {

        UserService.getMyUser().then((user) => {
            setUser(user);
        }).catch((e) => {
            setPopupTitle("Something went wrong while fetching your user data");
            setPopupText(e);
            setShowPopup(true);
        }).finally(() => setLoading(false));

        DisplayWebsiteService.getMyWebsites().then((websites) => {
            setWebsites(websites);
        }).catch((e) => {
            setPopupTitle("Something went wrong while fetching your websites");
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
            website_domain: undefined,
            hero_title: newWebsiteHeroTitle,
        };

        const validation = FieldsUtil.checkDisplayWebsite(displayWebsite);
        if (!validation.valid) {
            setPopupTitle("Wrong input data");
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
            setPopupTitle("Something went wrong while creating your website");
            setPopupText(e as string || "No additional information.");
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
                    <h1>Welcome, {user?.first_name || "young fella"}</h1>
                </div>
                <TutorialCard
                    text={`
                    Here, you can manage your websites. You can create new websites, and edit existing ones.
                    Just click on "Create a website" to get started!
                `}
                    uniqueId={"welcome-page"}
                />
                <SectionElem title={"Your websites"}
                             loading={websiteLoading}

                             actions={[
                                 {
                                     text: "Create",
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
                title={"Create a new website"}
                message={"Please fill in the details below to create your new website."}
                actions={[
                    {text: "Create", isForm: true, iconName: "add", actionType: ActionTypeEnum.safe},
                ]}
            >

                <Input placeholder={"Website name"} value={websiteTitle} setValueAction={setWebsiteTitle}/>

                <div
                    className={"flex gap-4 flex-col justify-center w-fit p-5 px-10 rounded-xl bg-onBackgroundHover mt-8 items-center"}>
                    <h3>Home page&apos;s content</h3>
                    <Input placeholder={"title"} value={newWebsiteHeroTitle}
                           setValueAction={setNewWebsiteHeroTitle}/>
                    <ImageInput setFileAction={setNewSelectedFileHeroImage}/>
                </div>


            </AdvancedPopup>
        </>

    )
}