
"use client";

import {login} from "@/app/controller/loginController";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export default function Home() {
    const [password, setPassword] = useState("");
    const router = useRouter();

    useEffect(() => {
        login(password).then((token) => {
            console.log(token);
            router.push("/secure/pages");
        }).catch((error) => {
            console.log("error : " + error);
        });
    }, [password, router]);

    function onClickLogin() {
        login(password).then((token) => {
            console.log(token);
            router.push("/secure/pages");
        }).catch((error) => {
            console.log("error : " + error);
        });
    }
  return (
    <div className={"flex flex-col h-[100vh] justify-center items-center gap-3"}>
        <h1 className={"text-center"}>Interface administrateur</h1>
        <h3 className={"text-center"}>Portfolio de Maël Garnier</h3>
            <input placeholder={"mot de passe"} type={"text"} value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={onClickLogin}>
                Valider
                <img src={"/ico/check.svg"} alt={"check"}/>
            </button>

    </div>
  );
}
