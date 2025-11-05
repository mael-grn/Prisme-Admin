import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";

export function TutorialCard({text, uniqueId}: { text: string, uniqueId: string }) {


    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    useEffect(() => {
        const dismissedTutorials = localStorage.getItem("dismissedTutorials");
        if (dismissedTutorials) {
            const dismissedTutorialsArray = JSON.parse(dismissedTutorials) as string[];
            if (!dismissedTutorialsArray.includes(uniqueId)) {
                setShowTutorial(true);
            }
        } else {
            setShowTutorial(true);
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
    }

    return (
        <AnimatePresence>
            {
                showTutorial &&
                <motion.div
                    initial={{opacity: 0, transform: "scale(0)"}}
                    animate={{opacity: 1, transform: "scale(1)"}}
                    exit={{opacity: 0, transform: "scale(0)"}}
                    className={`flex gap-4 items-center w-fit p-3 rounded-2xl bg-onBackgroundHover ${!showTutorial && "hidden"}`}>
                    <img src={"/ico/question.svg"} alt={"question"} className={"invert w-8 h-8"}/>
                    <p>{text}</p>
                    <button onClick={dismissTutorial}
                            className={"min-w-6 w-6 h-6 self-start flex items-center justify-center md:hover:bg-dangerousHover active:bg-dangerousHover active:scale-90 rounded-full"}>
                        <img src={"/ico/close.svg"} alt={"close"} className={"invert "}/>
                    </button>
                </motion.div>
            }
        </AnimatePresence>


    )
}