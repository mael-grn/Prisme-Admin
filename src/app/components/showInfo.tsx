export default function ShowInfo({title, data, separator=false}: { data: string | undefined; title: string, separator?: boolean }) {
    return (
        <div className={"flex flex-col gap-3"}>
            <div className="flex gap-3 justify-between">
                <p className="font-bold">{title} :</p>
                <p className={`${!data && "italic text-on-foreground-hover"}`}>{data || "Cette information n'est pas disponible"}</p>
            </div>
            {separator && <hr className={"border-0 h-[1px] w-full bg-onBackgroundHover"}/>}
        </div>
    );
}