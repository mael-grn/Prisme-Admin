
"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/app/components/Input";
import SectionElem from "@/app/components/sectionElem";
import LoadingPopup from "@/app/components/loadingPopup";
import UserService from "@/app/service/UserService";
import SessionService from "@/app/service/SessionService";
import Popup from "@/app/components/popup";

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
    }, [password, router]);

    function onClickLogin() {
        setLoading(true)
        SessionService.createSession(email, password).then(() => {
            router.push("/secure/pages");

        }).catch((errorMsg) => {
            setPopupTitle("Une erreur s'est produite");
            setPopupText(errorMsg);
            setShowPopup(true);
        }).finally(() => {
            setLoading(false);

        })
    }
  return (
      <div className={"flex items-center justify-center min-h-screen"}>
          <SectionElem title="Connexion" actions={[{text: "Connexion", iconName: "key", onClick: onClickLogin, isLoading: loading}]}>
              <Input iconName={"mail"} type={"email"} placeholder={"adresse mail"} value={email} setValueAction={setEmail}/>
              <Input iconName={"lock"} type={"password"} placeholder={"mot de passe"} value={password} setValueAction={setPassword}/>
          </SectionElem>
          <LoadingPopup show={initialLoading} message={"Verification des accès..."}/>
          <Popup showPopup={showPopup} onClose={() => setShowPopup(false)} titre={popupTitle} texte={popupText}/>
      </div>
  );
}
