
"use client";

import {login} from "@/app/controller/loginController";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export default function Home() {
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        login(password).then((token) => {
            if (token){
                router.push("/secure/pages");
            } else {
                setLoading(false);
            }

        }).catch(() => {
            setLoading(false)
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
    <div className={"flex flex-col h-[100vh] justify-center items-center gap-3"}>
        <h1 className={"text-center"}>Portail administrateur</h1>
            <input placeholder={"mot de passe"} type={"text"} value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
        {
            loading ?
                <button disabled={true} className={"p-3"}>
                    <img src={"/ico/loader.gif"} className={"invert static"} alt={"chargement"}/>
                </button>
                :
                <button onClick={onClickLogin}>

                    Valider
                    <img src={"/ico/key.svg"} alt={"key"}/>
                </button>
        }


    </div>
  );
}
