
"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/app/components/Input";
import SectionElem from "@/app/components/sectionElem";
import LoadingPopup from "@/app/components/loadingPopup";
import UserService from "@/app/service/UserService";
import SessionService from "@/app/service/SessionService";
import Form from "@/app/components/form";
import AdvancedPopup from "@/app/components/advancedPopup";

export default function Home() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const router = useRouter();
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupText, setPopupText] = useState<string>('');
    const [popupTitle, setPopupTitle] = useState<string>('');


    useEffect(() => {
        UserService.getMyUser().then((user) => {
            if (user){
                router.push("/secure/");
            } else {
                setInitialLoading(false);
            }

        }).catch(() => {
            setInitialLoading(false)
        })
    }, [router]);

    function onClickLogin() {
        setLoading(true)
        SessionService.createSession(email, password).then(() => {
            router.push("/secure/");

        }).catch((errorMsg) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(errorMsg);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);

        })
    }
  return (
      <div className={"flex items-center gap-2 flex-col justify-center min-h-screen"}>

          <img src={"/img/icon.png"} alt={"icon"} className={"h-36 w-fit"}/>
          <h1 className={"mb-10"}>Prisme</h1>
          <Form onSubmitAction={onClickLogin}>
              <SectionElem title="Connexion" actions={[
                  {text: "Pas encore de compte ?", iconName: "add", onClick: () => router.push("/register"), isSecondary: true },
                  {text: "Connexion", iconName: "key", isLoading: loading, isForm: true}
              ]}>
                  <Input iconName={"mail"} type={"email"} placeholder={"adresse mail"} value={email} setValueAction={setEmail}/>
                  <Input iconName={"lock"} type={"password"} placeholder={"mot de passe"} value={password} setValueAction={setPassword}/>
              </SectionElem>
          </Form>

          <LoadingPopup show={initialLoading}/>
          <AdvancedPopup show={showPopup} closePopup={() => setShowPopup(false)} title={popupTitle} message={popupText}/>
      </div>
  );
}
