import {FormEvent} from "react";

export default function Form({onSubmit, children}: {onSubmit: () => void, children: React.ReactNode}) {
    return (
        <form onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSubmit();
        }}>
            {children}
        </form>
    )
}