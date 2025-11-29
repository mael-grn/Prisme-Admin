import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import Button, {ActionTypeEnum} from "@/app/components/Button";
import { HexColorPicker } from "react-colorful";
import Input from "@/app/components/Input";
import {StringUtil} from "@/app/utils/stringUtil";

export default function ColorItem({ colorHexCode, colorName, onChangeAction }: { colorHexCode?: string, colorName?: string, onChangeAction?: (c:string) => void }) {

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [newColor, setNewColor] = useState(colorHexCode || "");

    useEffect(() => {
        setNewColor(colorHexCode ?? "");
    }, [colorHexCode]);

    return (
        <div className="relative">
            <div className={`flex gap-2 item-center p-1 pr-3 rounded-xl ${onChangeAction ? 'cursor-pointer border-2 border-background bg-background md:hover:border-foreground active:border-foreground' : ''}`} onClick={() => onChangeAction && setShowColorPicker(!showColorPicker)} >
                <div style={{backgroundColor: newColor || colorHexCode || "black"}} className={`w-6 min-w-6 h-6 min-h-6 rounded-lg flex items-center justify-center`}>
                    {!colorHexCode && <p>?</p>}
                </div>
                <p className={"flex items-center justify-center"}>{colorName || colorHexCode || "Aucune couleur"}</p>


            </div>
            <AnimatePresence>
                {
                    showColorPicker && onChangeAction &&
                    <motion.div
                        key={"color-picker" + newColor}
                        initial={{ opacity: 0, transform: "scale(.6)", filter: "blur(10px)", transformOrigin: "top left" }}
                        animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)", transformOrigin: "top left" }}
                        exit={{ opacity: 0, transform: "scale(.6)", filter: "blur(10px)", transformOrigin: "top left" }}
                        className={"absolute mb-6 flex flex-col justify-between top-10 left-0 z-10 rounded-lg bg-onBackground border-2 border-onBackgroundHover"}
                    >
                        <div className={"p-2 flex flex-col justify-center w-full items-center gap-4"}>
                            <HexColorPicker color={newColor} onChange={setNewColor} />
                            <Input validatorAction={StringUtil.hexColorValidator} iconName={"paint"} placeholder={"Couleur au format HEX"} value={newColor} setValueAction={setNewColor}/>
                        </div>
                        <div className={"flex justify-end items-center p-2 border-t-2 border-onBackgroundHover gap-2"}>
                            <Button iconName={"close"} text={"Annuler"} onClick={() => {setShowColorPicker(false); setNewColor(colorHexCode || "black")}}/>
                            <Button actionType={ActionTypeEnum.safe} iconName={"check"} text={"Valider"} onClick={() => { onChangeAction(newColor); setShowColorPicker(false); }} />
                        </div>
                    </motion.div>
                }
            </AnimatePresence>
        </div>

    )
}