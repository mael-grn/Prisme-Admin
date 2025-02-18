
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
    const [error, setError] = useState<string | null>(null);

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
        }).catch((e : Error) => {
            if (e.message === "update or delete on table \"tag\" violates foreign key constraint \"section_tag_tag_id_fkey\" on table \"section_tag\""){
                setError("Ce tag est utilisé dans une section, impossible de le supprimer");
            } else {
                setError(e.message);

            }
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
                        className={"p-4 md:rounded-2xl rounded-t-2xl bg-dark flex flex-col gap-3 items-center justify-center md:w-fit md:h-fit w-full h-2/3"}>
                        <h3>Ajouter un nouveau tag</h3>
                        <div className={"flex flex-col gap-3 justify-center items-center p-4 rounded-xl bg-darkHover"}>
                            <p>Entrez le nouveau tag ci-dessous :</p>
                            <input placeholder={"nouveau tag"} type={"text"} value={newTag}
                                   onChange={handleValueChange}/>
                            <div className={"flex gap-3 flex-wrap"}>
                                {
                                    tags.map((tag) => {
                                        return (
                                            <div key={tag.id}
                                                 className={"cursor-pointer pt-1 pb-1 pl-2 pr-1 rounded-3xl bg-backgroundHover flex gap-2"}>
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

                        {
                            error && <p className={"bg-red-500 pt-1 pb-1 pl-2 pr-2 rounded-[100px]"}>{error}</p>
                        }

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