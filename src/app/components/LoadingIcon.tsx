import ICON from "../../../public/ico/loader.json";
import {Player} from "@lordicon/react";
import { motion } from "framer-motion";
import {useEffect, useRef} from "react";

export default function LoadingIcon({small = false, dark = false} : {small?: boolean, dark?: boolean}) {

    const playerRef = useRef<Player>(null);

    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, []);

    return (
        <motion.span
            initial={{ opacity: 0, transform: "scale(.5)", filter: "blur(10px)" }}
            animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
            exit={{ opacity: 0, transform: "scale(.5)", filter: "blur(10px)" }}
        >
            <Player
                colorize={dark ? "#000000" : "#ffffff"}
                size={small ? 17 : 30}
                ref={playerRef}
                icon={ ICON }
                onComplete={() => playerRef.current?.playFromBeginning()}
            />
        </motion.span>

    )
}