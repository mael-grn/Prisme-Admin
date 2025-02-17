import {useState} from "react";


interface PopupProps {
    showValidationPopup: boolean;
    onClose: (deleteValidation : boolean) => void;
    objectToDelete: string;
}

export default function ValidationPopup({showValidationPopup, onClose, objectToDelete}: PopupProps) {
    const [value, setValue] = useState<string>('');
    return (
        <div>
            {
                showValidationPopup &&
                <div className={"z-50 fixed top-0 left-0 w-full h-[100vh] bg-backgroundTransparent backdrop-blur flex justify-center md:items-center items-end"}>
                    <div className={"p-6 md:rounded-2xl rounded-t-2xl bg-background flex flex-col gap-12 items-center justify-center md:w-2/3 md:h-fit w-full h-2/3"}>
                        <h2>Voulez-vous vraiment supprimer {objectToDelete} ?</h2>
                        <div className={"flex flex-col justify-center items-center p-4 rounded-xl bg-dark gap-3"}>
                            <p>Cette action sera irréversible. Pour continuer, entrez le nom de l&apos;élément à
                                supprimer ci-dessous : </p>
                            <input placeholder={objectToDelete} type={"text"} value={value}
                                   onChange={(e) => setValue(e.target.value)}/>
                        </div>
                        <div className={"flex gap-3"}>
                            <button onClick={() => onClose(false)}>
                                Annuler
                                <img src={"/ico/arrow-back.svg"} alt={"back"}/>
                            </button>
                            <button disabled={objectToDelete !== value} className={"bg-red-500 hover:bg-red-400"}
                                    onClick={() => onClose(true)}>
                                Supprimer
                                <img src={"/ico/trash.svg"} alt={"trash"}/>
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}