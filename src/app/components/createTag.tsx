
//si on renvoie onValidate avec null alors on a cancel l'ajout
import {useEffect, useState} from "react";
import {deleteTag, getTags, getTagsForSection, Tag} from "@/app/controller/tagController";
import PageLoading from "@/app/components/pageLoading";

interface PopupProps {
    onValidate: (newTag : string | null) => void;
    sectionId: number;
}


export default function CreateTag({onValidate, sectionId}: PopupProps) {
    const [newTag, setNewTag] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [tagIsNew, setTagIsNew] = useState<boolean>(true);
    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        async function loadData() {
            const tags = await getTags()
            const sectionTag = await getTagsForSection(sectionId);
            setTags(tags.filter(t => !sectionTag.find(st => st.id === t.id)));
        }
        loadData().finally(() => {
            setLoading(false);
        })
    }, [sectionId]);

    function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
        setNewTag(e.target.value);
        if (tags.find(t => t.name === e.target.value)) {
            setTagIsNew(false);
        } else {
            setTagIsNew(true);
        }
    }

    function deleteTagAction(id: number) {
        setLoading(true)
        deleteTag(id).then(() => {
            setTags(tags.filter(t => !tags.find(st => st.id === t.id)));
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <div
            className={"z-50 fixed top-0 left-0 w-full h-[100vh] bg-backgroundTransparent backdrop-blur flex justify-center md:items-center items-end"}>
            {
                loading ? <PageLoading/> :
                    <div
                        className={"p-6 md:rounded-2xl rounded-t-2xl bg-background flex flex-col gap-3 items-center justify-center md:w-2/3 md:h-fit w-full h-2/3"}>
                        <h2>Ajouter un nouveau tag</h2>
                        <div className={"flex flex-col gap-3 justify-center items-center p-4 rounded-xl bg-dark"}>
                            <p>Entrez le nouveau tag ci-dessous :</p>
                            <input placeholder={"nouveau tag"} type={"text"} value={newTag}
                                   onChange={handleValueChange}/>
                            <div className={"flex gap-3 flex-wrap"}>
                                {
                                    tags.map((tag) => {
                                        return (
                                            <div key={tag.id}
                                                 className={"cursor-pointer pt-2 pb-2 pl-4 pr-4 rounded-3xl bg-darkHover flex gap-2"}>
                                                <p
                                                    onClick={() => {
                                                        setNewTag(tag.name);
                                                        setTagIsNew(false)
                                                    }}
                                                >{tag.name}</p>
                                                <img src={"/ico/trash.svg"} alt={"trash"}
                                                     className={"p-1 h-6 invert rounded-3xl hover:bg-foreground"}
                                                     onClick={() => deleteTagAction(tag.id)}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>


                        <div className={"flex gap-3"}>
                            <button className={"bg-red-500 hover:bg-red-400"} onClick={() => onValidate(null)}>
                                Annuler
                                <img src={"/ico/close.svg"} alt={"close"}/>
                            </button>
                            <button
                                disabled={newTag === ""}
                                onClick={() => onValidate(newTag)}>{tagIsNew ? "Créer" : "Ajouter"}
                                <img src={"/ico/plus.svg"} alt={"plus"}/>
                            </button>
                        </div>

                    </div>
            }

        </div>
    )
}