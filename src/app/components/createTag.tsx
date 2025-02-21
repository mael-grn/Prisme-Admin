
import {useEffect, useState} from "react";
import {addTag, deleteTag, getTagsNotInSection, Tag} from "@/app/controller/tagController";
import PageLoading from "@/app/components/pageLoading";

interface PopupProps {
    onValidate: (newTags : Tag[]) => void;
    onCancel: () => void;
    sectionId: number;
}


export default function CreateTag({onValidate, onCancel, sectionId}: PopupProps) {
    const [newTag, setNewTag] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [addNewTag, setAddNewTag] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            setTags(await getTagsNotInSection(sectionId));
        }
        loadData().finally(() => {
            setLoading(false);
        })
    }, [sectionId]);

    function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
        setNewTag(e.target.value);
    }

    function deleteTagAction(id: number) {
        setLoading(true)
        deleteTag(id).then(async () => {
            setTags(await getTagsNotInSection(sectionId));
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

    function addNewTagAction() {
        setLoading(true)
        addTag(newTag).then(async () => {
            setTags(await getTagsNotInSection(sectionId));
            setNewTag("");
        }).catch((e : Error) => {
            setError(e.message);
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <div
            className={"z-50 fixed top-0 left-1/6 w-2/3 h-[100vh] bg-backgroundTransparent backdrop-blur flex justify-center md:items-center items-end"}>
            {
                loading ? <PageLoading/> :
                    <div
                        className={"p-4 md:rounded-2xl rounded-t-2xl bg-dark flex flex-col gap-3 items-center justify-center md:w-fit md:h-fit w-full h-2/3"}>
                        <h3>Ajouter des tags</h3>

                        {
                            addNewTag ?
                                <>
                                    <p>Ajouter un nouveau tag à la liste :</p>
                                    <div className={"flex gap-3"}>
                                        <input placeholder={"nouveau tag"} type={"text"} value={newTag}
                                               onChange={handleValueChange}/>
                                        <button onClick={addNewTagAction}>
                                            Créer
                                            <img src={"/ico/check.svg"} alt={"check"}/>
                                        </button>
                                    </div>
                                </> :
                                <button onClick={() => setAddNewTag(true)}>
                                    Créer un nouveau tag
                                    <img src={"/ico/plus.svg"} alt={"plus"}/>
                                </button>

                        }

                        <div className={"flex flex-col gap-3 justify-center items-center p-4 rounded-xl bg-darkHover"}>

                            <div className={"flex gap-3 flex-wrap"}>
                                {
                                    tags.map((tag) => {
                                        return (
                                            <div key={tag.id}
                                                 className={`cursor-pointer pt-1 pb-1 pl-2 pr-1 rounded-3xl ${selectedTags.find(t => t.id === tag.id) ? "bg-dark" : "bg-backgroundHover"} flex gap-2`}>
                                                <p
                                                    onClick={() => {
                                                        if (selectedTags.find(t => t.id === tag.id)) {
                                                            setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
                                                        } else {
                                                            setSelectedTags([...selectedTags, tag]);
                                                        }
                                                    }}
                                                >{tag.name}</p>
                                                <img src={`/ico/${selectedTags.find(t => t.id === tag.id) ? "check" : "trash"}.svg`} alt={"trash"}
                                                     className={`p-1 h-6 invert rounded-3xl ${selectedTags.find(t => t.id === tag.id) ? "cursor-default" : "hover:bg-foreground"} `}
                                                     onClick={() => !selectedTags.find(t => t.id === tag.id) && deleteTagAction(tag.id)}/>
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
                            <button className={"bg-red-500 hover:bg-red-400"} onClick={() => onCancel()}>
                                Annuler
                                <img src={"/ico/close.svg"} alt={"close"}/>
                            </button>
                            <button
                                disabled={selectedTags.length === 0}
                                onClick={() => onValidate(selectedTags)}>Ajouter
                                <img src={"/ico/plus.svg"} alt={"plus"}/>
                            </button>
                        </div>

                    </div>
            }

        </div>
    )
}