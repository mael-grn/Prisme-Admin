import ICON from "../../../public/ico/loader.json";
import {Player} from "@lordicon/react";
import {useEffect, useRef} from "react";

export default function LoadingIcon() {

    const playerRef = useRef<Player>(null);

    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, []);

    return (
        <Player
            ref={playerRef}
            icon={ ICON }
            onComplete={() => playerRef.current?.playFromBeginning()}
        />
    )
}