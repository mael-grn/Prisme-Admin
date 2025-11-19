"use client";

import {useState} from "react";

export default function ImageInput({setFileAction}: {setFileAction: (file: File) => void}) {

    const [newFile, setNewFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDragEnter = () => {
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setFileAction(file);
            setNewFile(file);
            const tempUrl = URL.createObjectURL(file);
            setImageSrc(tempUrl);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setFileAction(file);
            setNewFile(file);
            const tempUrl = URL.createObjectURL(file);
            setImageSrc(tempUrl);
        }
    };

    return (
        <div>
            <label htmlFor={"file-input"}>
                <div

                    className={`h-fit w-full relative p-3 rounded-lg flex bg-background justify-center items-center gap-3 cursor-pointer border-2 border-background hover:border-foreground ${isDragging ? "border-foreground pt-10 pb-10" : "border-background"}`}>

                    {
                        newFile ?

                            <>
                                <img src={imageSrc ||  ""} alt={"new image"} className={"h-12 rounded-lg"}/>
                                <p>{newFile.name}</p>
                            </>


                            :

                            <>
                                <img className={"invert w-6 h-6"} src={"/ico/cloud.svg"} alt={"cloud"}/>
                                <p>Choisir une image</p>
                            </>


                    }
                    <span
                        className={"absolute w-full h-full top-0 left-0 bg-transparent"}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    />
                </div>
            </label>
            <input
                className={"hidden"}
                type={"file"}
                id={"file-input"}
                onChange={handleFileChange}
                accept={"image/*"}/>
        </div>
    )
}