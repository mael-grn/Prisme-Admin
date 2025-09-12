import {AnimatePresence, motion} from "framer-motion";

export default function LoadingPopup({show, message} : {show: boolean, message?: string}) {
    return (
        <AnimatePresence>
            {
                show &&
                <motion.div
                    initial={{ opacity: 0}}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={"fixed top-0 left-0 w-full h-full flex items-center justify-center bg-backgroundOpacity backdrop-blur z-50 gap-6 flex-col"}>
                    <motion.img
                        initial={{transform: "scale(0)"}}
                        animate={{transform: "scale(1)"}}
                        exit={{transform: "scale(0)"}}
                        src={"/ico/loader-light.gif"}
                        alt={"loader-light"}
                        className={"w-10"} />
                    {
                        message &&
                        <motion.p
                            initial={{ opacity: 0, transform: "translateY(50px)"}}
                            animate={{ opacity: 1, transform: "translateY(0)"}}
                            exit={{ opacity: 0, transform: "translateY(-50px)"}}
                            className={"text-center"}
                        >
                            {message}
                        </motion.p>
                    }
                </motion.div>
            }

        </AnimatePresence>
    );

}