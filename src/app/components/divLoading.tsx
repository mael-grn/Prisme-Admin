"use client"

export default function DivLoading() {
    return (
        <div className={"flex items-center justify-center w-full p-12 bg-dark rounded-[10px]"}>
            <img src={"/ico/loader.gif"} alt={"loader"} className={"w-8 h-8"}/>
        </div>
    )
}