
"use client";

import {login} from "@/app/service/loginService";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import MainPage from "@/app/components/mainPage";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import SectionElem from "@/app/components/sectionElem";
import PageLoading from "@/app/components/pageLoading";
import LoadingPopup from "@/app/components/loadingPopup";

export default function Home() {
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        login(password).then((token) => {
            if (token){
                router.push("/secure/pages");
            } else {
                setInitialLoading(false);
            }

        }).catch(() => {
            setInitialLoading(false)
        })
    }, [password, router]);

    function onClickLogin() {
        setLoading(true)
        login(password).then((token) => {
            if (token){
                router.push("/secure/pages");
            } else {
                setLoading(false);
            }
        }).catch(() => {
            setLoading(false)
        });
    }
  return (
      <div className={"flex items-center justify-center min-h-screen"}>
          <SectionElem title="Connexion" actions={[{text: "Connexion", iconName: "key", onClick: onClickLogin, isLoading: loading}]}>
              <Input iconName={"lock"} type={"password"} placeholder={"mot de passe"} value={password} setValueAction={setPassword}/>
          </SectionElem>
          <LoadingPopup show={initialLoading} message={"Verification des accès..."}/>
      </div>
  );
}
