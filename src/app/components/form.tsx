
import {FormEvent, useRef} from "react";

export default function Form({onSubmitAction, children}: {onSubmitAction: () => void, children: React.ReactNode}) {

    const formRef = useRef<HTMLFormElement>(null);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmitAction();
    }
    return (
        <form ref={formRef} onSubmit={onSubmit}>
            {children}
        </form>
    )
}