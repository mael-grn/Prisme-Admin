
"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/app/components/Input";
import SectionElem from "@/app/components/sectionElem";
import UserService from "@/app/service/UserService";
import {InsertableUser} from "@/app/models/User";
import {ButtonProps} from "@/app/components/Button";
import AdvancedPopup from "@/app/components/advancedPopup";
import Form from "@/app/components/form";
import {StringUtil} from "@/app/utils/stringUtil";
import {error} from "next/dist/build/output/log";

export default function Home() {
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');
    const [popupActions, setPopupActions] = useState<ButtonProps[]>([])
    const [popupIconName, setPopupIconName] = useState<string>("warning")

    function onClickRegister() {
        setLoading(true)
        const userToInsert : InsertableUser = {
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName
        }
        UserService.insertUser(userToInsert).then(() => {
            setPopupTitle("Inscription réussie");
            setPopupText("Votre compte a bien été créé. Vous pouvez maintenant vous connecter.");
            setPopupIconName("check");
            setPopupActions([{text: "Connexion", iconName: "redirect", onClick: () => router.push("/")}]);
            setShowPopup(true);

        }).catch((errorMsg) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(errorMsg);
            setPopupIconName("warning");
            setPopupActions([])
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);
        })
    }
    return (
        <div className={"flex items-center justify-center min-h-screen"}>
            <Form onSubmitAction={onClickRegister}>

                <SectionElem title="Créer un compte" actions={[
                    {text: "Déjà un compte ?", iconName: "lock", onClick: () => router.push("/"), isSecondary: true },
                    {text: "S'enregistrer", iconName: "add", isLoading: loading, isForm: true}
                ]}>
                    <Input iconName={"user"} type={"text"} placeholder={"Nom"} value={lastName} setValueAction={setLastName} />
                    <Input iconName={"user"} type={"text"} placeholder={"Prénom"} value={firstName} setValueAction={setFirstName} />
                    <Input validatorAction={StringUtil.emailStringValidator} iconName={"mail"} type={"email"} placeholder={"Adresse mail"} value={email} setValueAction={setEmail}/>
                    <Input validatorAction={StringUtil.passwordStringValidator} iconName={"lock"} type={"password"} placeholder={"Mot de passe"} value={password} setValueAction={setPassword}/>
                </SectionElem>
            </Form>

    <AdvancedPopup show={showPopup} closePopup={() => setShowPopup(false)} title={popupTitle} message={popupText} actions={popupActions} icon={popupIconName}/>
    </div>
);
}
