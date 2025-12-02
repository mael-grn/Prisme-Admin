
"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/app/components/Input";
import SectionElem from "@/app/components/sectionElem";
import UserService from "@/app/service/UserService";
import {InsertableUser} from "@/app/models/User";
import {ActionTypeEnum, ButtonProps} from "@/app/components/Button";
import AdvancedPopup from "@/app/components/advancedPopup";
import Form from "@/app/components/form";
import {StringUtil} from "@/app/utils/stringUtil";

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
            setPopupTitle("Welcome, new member!");
            setPopupText("Your account has been successfully created. You may now log in.");
            setPopupIconName("check");
            setPopupActions([{text: "Log in", iconName: "redirect", actionType: ActionTypeEnum.safe, onClick: () => router.push("/")}]);
            setShowPopup(true);

        }).catch((errorMsg) => {
            setPopupTitle("Something went wrong");
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

                <SectionElem title="Register" actions={[
                    {text: "Login", iconName: "lock", onClick: () => router.push("/"), isSecondary: true },
                    {text: "Register", iconName: "add", isLoading: loading, isForm: true}
                ]}>
                    <Input iconName={"user"} type={"text"} placeholder={"first name"} value={firstName} setValueAction={setFirstName} />
                    <Input iconName={"user"} type={"text"} placeholder={"last name"} value={lastName} setValueAction={setLastName} />
                    <Input validatorAction={StringUtil.emailStringValidator} iconName={"mail"} type={"email"} placeholder={"email"} value={email} setValueAction={setEmail}/>
                    <Input validatorAction={StringUtil.passwordStringValidator} iconName={"lock"} type={"password"} placeholder={"password"} value={password} setValueAction={setPassword}/>
                </SectionElem>
            </Form>

    <AdvancedPopup show={showPopup} closePopup={() => setShowPopup(false)} title={popupTitle} message={popupText} actions={popupActions} icon={popupIconName}/>
    </div>
);
}
