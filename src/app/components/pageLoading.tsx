"use client"

export default function PageLoading() {
    return (
        <div className={"z-10 flex items-center justify-center w-full h-[100vh] fixed top-0 left-0"}>
            <img src={"/ico/loader.gif"} alt={"loader"} className={"w-14 h-14"}/>
        </div>
    )
}