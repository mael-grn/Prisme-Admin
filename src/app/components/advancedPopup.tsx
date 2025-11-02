import {AnimatePresence, motion} from "framer-motion";
import Button, { ButtonProps} from "@/app/components/Button";

export default function AdvancedPopup({show, icon="info", title, message, closePopup, actions, children} : {show: boolean, icon?: string, message: string, title: string, closePopup: () => void, actions?: ButtonProps[], children?: React.ReactNode}) {
    return (
        <AnimatePresence>
            {
                show && <motion.div
                    className={"fixed top-0 left-0 w-full h-full flex items-center justify-center bg-background-opacity backdrop-blur z-50"}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                >
                    <motion.div
                        className={"bg-onBackground border-2 border-onBackgroundHover rounded-2xl md:w-1/2 max-h-[80vh] overflow-y-auto"}
                        initial={{transform: "scale(0.5)"}}
                        animate={{transform: "scale(1)"}}
                        exit={{transform: "scale(0.5)"}}
                    >
                        <div className={"flex flex-col items-center justify-center gap-4 p-6"}>
                            <img src={`/ico/${icon}.svg`} alt={"popup"} className={"w-16 invert"} />
                            <h2 className={"text-center"}>{title}</h2>
                            <p className={"text-center"}>{message}</p>

                            {children}
                        </div>

                        <div className={"flex flex-1 gap-2 items-center justify-end border-t-2 border-onBackgroundHover w-full p-3"}>
                            <Button iconName={"close"} text={"Fermer"} onClick={closePopup} />
                            {
                                actions && actions.map((action, index) => (
                                    <Button
                                        key={index}
                                        iconName={action.iconName}
                                        text={action.text}
                                        onClick={action.onClick}
                                        actionType={action.actionType}
                                        isForm={action.isForm}
                                        isLoading={action.isLoading}
                                        isDisabled={action.isDisabled}
                                    />
                                ))
                            }
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    );

}