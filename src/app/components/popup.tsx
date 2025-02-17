

interface PopupProps {
    showPopup: boolean;
    onClose: () => void;
    titre: string;
    texte: string;
}

export default function Popup({showPopup, onClose, titre, texte}: PopupProps) {
    return (
        <div>
            {
                showPopup &&
                    <div className={"z-50 fixed top-0 left-0 w-full h-[100vh] bg-backgroundTransparent backdrop-blur flex justify-center md:items-center items-end"}>
                        <div className={"p-6 md:rounded-2xl rounded-t-2xl bg-background flex flex-col gap-3 items-center justify-center md:w-2/3 md:h-fit w-full h-2/3"}>
                            <h2>{titre}</h2>
                            <p>{texte}</p>
                            <button onClick={onClose}>Fermer</button>
                        </div>
                    </div>
            }
        </div>
    )
}