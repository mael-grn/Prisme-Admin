"use client";

import {KeyboardEvent, useEffect, useState} from "react";
import {motion} from "framer-motion";

type ToggleProps = {
    checked?: boolean;
    onChangeAction?: (v: boolean) => void;
    leftLabel?: string;
    rightLabel?: string;
    className?: string;
    disabled?: boolean;
};

export default function Toggle({
                                   checked = false,
                                   onChangeAction,
                                   leftLabel,
                                   rightLabel,
                                   className = "",
                                   disabled = false,
                               }: ToggleProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleToggle = () => {
        if (disabled) return;
        onChangeAction?.(!checked);
    };

    const handleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChangeAction?.(!checked);
        }
    };

    // Affiche un état initial cohérent jusqu'à ce que le composant soit monté côté client
    if (!isMounted) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                {leftLabel && <span className="text-xs text-onBackground">{leftLabel}</span>}
                <div className="relative bg-onBackgroundHover w-14 h-8 rounded-full"/>
                {rightLabel && <span className="text-xs text-onBackground">{rightLabel}</span>}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {leftLabel && <span className="text-xs text-onBackground">{leftLabel}</span>}

            <button
                type={"button"}
                role="switch"
                aria-checked={checked}
                aria-label="toggle"
                onClick={handleToggle}
                onKeyDown={handleKey}
                disabled={disabled}
                className={`relative flex items-center w-14 h-8 rounded-full focus:outline-none transition-colors duration-200
                        ${checked ? 'bg-safe' : 'bg-onBackgroundHover'}
                        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
                <motion.span
                    layout
                    transition={{type: "tween", ease: "easeOut", duration: 0.2}}
                    className="absolute left-1 bg-background w-6 h-6 rounded-full shadow-md"
                    animate={{x: checked ? 24 : 0}}
                />
            </button>

            {rightLabel && <span className="text-xs text-onBackground">{rightLabel}</span>}
        </div>
    );
}