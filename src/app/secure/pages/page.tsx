"use client"

import {useEffect, useState} from "react";
import {addPage, getPages, Page} from "@/app/service/pageService";
import {useRouter} from "next/navigation";
import MainPage from "@/app/components/mainPage";
import SectionElem, {SectionWidth} from "@/app/components/sectionElem";
import List from "@/app/components/list";
import AdvancedPopup from "@/app/components/advancedPopup";
import Input from "@/app/components/Input";
import {ActionTypeEnum, ButtonProps} from "@/app/components/Button";

export default function Pages() {

    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [popupActions, setPopupActions] = useState<ButtonProps[]>([]);
    const [title, setTitle] = useState<string>('');

    const router = useRouter();

    useEffect(() => {
        getPages().then((pages) => {
            setPages(pages);
            setLoading(false);
        });
    }, []);

    function onNewPageClicked() {
        setPopupText("Entrez l'endpoint de la nouvelle page ci-dessous :");
        setPopupTitle('Nouvelle page');
        setPopupActions([
            {text: "Valider", iconName: "check", isForm: true, actionType: ActionTypeEnum.safe},
        ]);
        setShowPopup(true);
    }

    function addPageAction(e : React.FormEvent) {
        e.preventDefault();
        if (title === '') {
            return;
        }
        setLoading(true);
        let newTitle = title.startsWith('/') ? title : '/' + title
        addPage(newTitle).then(() => {
            setShowPopup(false);
            getPages().then((pages) => {
                setPages(pages);

            }).finally(() => {
                setLoading(false);
            })
        }).catch((error) => {
            setLoading(false);
            setPopupTitle("Une erreur s'est produite");
            setPopupText(error);
        })
    }

    return (
        <MainPage title={"Pages"}>
            <SectionElem width={SectionWidth.FULL} loading={loading} title={"Vos pages"} actions={[{text: "Ajouter", onClick: onNewPageClicked, iconName: "add"}]}>

                <List elements={pages.map((page) => { return {text: page.title, onClick: () => router.push("/secure/pages/" + page.id)}})}/>

            </SectionElem>

            <form onSubmit={ addPageAction }>
                <AdvancedPopup show={showPopup} message={popupText} title={popupTitle} actions={popupActions} closePopup={ () => setShowPopup(false)}>
                    <Input placeholder={"Endpoint"} value={title} setValueAction={setTitle} iconName={"globe"}/>
                </AdvancedPopup>
            </form>

        </MainPage>
    )
}