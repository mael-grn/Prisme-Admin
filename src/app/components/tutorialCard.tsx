import AdvancedPopup from "@/app/components/advancedPopup";
import {useEffect, useState} from "react";
import {ActionTypeEnum} from "@/app/components/Button";

export default function TutorialCard({text, uniqueId}: { text: string, uniqueId: string }) {

    const [showPopup, setShowPopup] = useState<boolean>(false);

    const [showTutorial, setShowTutorial] = useState<boolean>(true);

    useEffect(() => {
        const dismissedTutorials = localStorage.getItem("dismissedTutorials");
        if (dismissedTutorials) {
            const dismissedTutorialsArray = JSON.parse(dismissedTutorials) as string[];
            if (dismissedTutorialsArray.includes(uniqueId)) {
                setShowTutorial(false);
            }
        }
    }, [uniqueId])

    function dismissTutorial() {
        const dismissedTutorials = localStorage.getItem("dismissedTutorials");
        let dismissedTutorialsArray: string[] = [];
        if (dismissedTutorials) {
            dismissedTutorialsArray = JSON.parse(dismissedTutorials) as string[];
        }
        dismissedTutorialsArray.push(uniqueId)
        localStorage.setItem("dismissedTutorials", JSON.stringify(dismissedTutorialsArray))
        setShowTutorial(false);
        setShowPopup(false);
    }

    if (!showTutorial) {
        return null;
    }

    return (
        <div className={`flex gap-4 items-center w-full p-3 rounded-2xl bg-onBackgroundHover ${!showTutorial && "hidden"}`}>
            <img src={"/ico/question.svg"} alt={"question"} className={"invert w-8 h-8"}/>
            <p>{text}</p>
            <button onClick={() => setShowPopup(true)} className={"min-w-6 w-6 h-6 self-start flex items-center justify-center md:hover:bg-dangerousHover active:bg-dangerousHover active:scale-90 rounded-full"}>
                <img src={"/ico/close.svg"} alt={"close"} className={"invert "}/>
            </button>
            <AdvancedPopup
                show={showPopup}
                message={"Avez-vous vraiment lu ces informations ? Celles-ci sont très utiles, et vous n'y aurez plus accès une fois supprimées"}
                title={"Supprimer les conseils ?"}
                actions={[
                    {text: "Valider", iconName: "check", actionType: ActionTypeEnum.dangerous, onClick: dismissTutorial}
                ]}
                closePopup={() => setShowPopup(false)}/>
        </div>
    )
}