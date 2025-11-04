'use client';

export interface ListElementProps {
    text: string;
    onClick: () => void;
    actions?: ListElementActionProps[];
}

export interface ListElementActionProps {
    iconName: string;
    onClick: () => void;
}

function ListElement({props, isFirst, isLast}: { props: ListElementProps, isFirst: boolean, isLast: boolean }) {
    return (
        <div className="flex w-full gap-4">

            {props.actions && props.actions.length > 0 &&
                <div className={"flex gap-2 items-center"}>
                    {
                        props.actions.map((action, index) =>
                            <div
                                key={index}
                                className={"h-10 w-10 flex items-center justify-center rounded-full md:hover:bg-onBackground bg-background active:bg-onBackground cursor-pointer"}
                            >

                                <img src={`/ico/${action.iconName}.svg`}
                                     alt={action.iconName}
                                     className={"h-5 w-5 invert"}
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         action.onClick();
                                     }}/>
                            </div>)}
                </div>
            }
            <div
                className={` flex justify-between w-full p-4 rounded-lg ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl" : ""} md:hover:bg-onBackgroundHover bg-background active:rounded-3xl active:bg-onBackgroundHover cursor-pointer`}
                onClick={props.onClick}>
                <p>{props.text}</p>
            </div>


        </div>

    )
}

export default function List({elements}: { elements: ListElementProps[] }) {

    return (
        <div className={"flex flex-col gap-1 w-full items-end"}>
            {elements.length === 0 ?
                <div className={"flex items-center justify-center w-full p-6 flex-col gap-6"}>
                    <img src={"/ico/question.svg"} className={"w-10 invert"} alt={"question"}/>
                    <p>Il n&apos;y a rien à afficher</p>
                </div> :
                <>
                    {elements.map((element, index) => <ListElement key={index} props={element} isFirst={index === 0}
                                                                   isLast={index === elements.length - 1}/>)}
                    <p className={"italic text-sm text-onBackgroundHover mt-2 mr-2"}>{elements.length} éléments</p>
                </>
            }

        </div>
    );


}
