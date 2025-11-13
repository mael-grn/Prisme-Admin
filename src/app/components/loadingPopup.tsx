import {AnimatePresence, motion} from "framer-motion";
import LoadingIcon from "@/app/components/LoadingIcon";

export default function LoadingPopup({show} : {show: boolean}) {
    return (
        <AnimatePresence>
            {
                show &&
                <motion.div
                    initial={{ opacity: 0}}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={"fixed top-0 left-0 w-full h-full flex items-center justify-center bg-backgroundOpacity backdrop-blur z-30 gap-6 flex-col"}>
                    <LoadingIcon/>
                </motion.div>
            }

        </AnimatePresence>
    );

}