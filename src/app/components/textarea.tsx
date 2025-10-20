
export default function Textarea({value, onChangeAction, placeholder}: {value: string, onChangeAction: (newValue: string) => void, placeholder?: string}) {

    return (
        <textarea
            className={"bg-background focus:bg-onBackgroundHover md:hover:bg-onBackgroundHover active:bg-onBackgroundHover rounded-lg outline-0 p-2 w-full h-64 min-h-64 max-h-64 resize-none"}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChangeAction(e.target.value)}
        />
    )
}