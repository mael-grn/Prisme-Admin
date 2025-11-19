"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";

type Props = {
    color: string;
    onChangeAction: (color: string) => void;
};

const containerVariants: Variants = {
    hidden: { opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.18 } },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.22, when: "beforeChildren", staggerChildren: 0.04 } },
    exit: { opacity: 0, y: -6, filter: "blur(6px)", transition: { duration: 0.16 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: -6, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -4, filter: "blur(6px)" }
};

const errorVariants: Variants = {
    hidden: { opacity: 0, y: -6, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" }
};

const presetColors = [
    "#0ea5a4", "#7c3aed", "#ef4444", "#f59e0b",
    "#10b981", "#3b82f6", "#111827", "#ffffff"
];

export default function ColorPicker({ color, onChangeAction }: Props) {
    const [localColor, setLocalColor] = useState<string>(color ?? "#000000");
    const [hexInput, setHexInput] = useState<string>(color ?? "#000000");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        setLocalColor(color ?? "#000000");
        setHexInput(color ?? "#000000");
        setError("");
    }, [color]);

    const normalize = (v: string) => {
        if (!v) return "#000000";
        return v.startsWith("#") ? v.toUpperCase() : ("#" + v).toUpperCase();
    };

    const isValidHex = (v: string) => /^#([0-9A-F]{6})$/i.test(v);

    function handleNativeColorChange(e: React.ChangeEvent<HTMLInputElement>) {
        const c = normalize(e.target.value);
        setLocalColor(c);
        setHexInput(c);
        setError("");
        onChangeAction(c);
    }

    function handleHexChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        setHexInput(raw);
        const norm = raw.startsWith("#") ? raw : "#" + raw;
        if (isValidHex(norm)) {
            const up = norm.toUpperCase();
            setLocalColor(up);
            setError("");
            onChangeAction(up);
        } else {
            // show error only when length suggests user finished typing
            if (raw.replace("#", "").length >= 6) {
                setError("Code hex invalide");
            } else {
                setError("");
            }
        }
    }

    function handleHexBlur() {
        const norm = normalize(hexInput);
        if (isValidHex(norm)) {
            setLocalColor(norm);
            setHexInput(norm);
            setError("");
            onChangeAction(norm);
        } else {
            setHexInput(localColor);
            setError("");
        }
    }

    function pickPreset(c: string) {
        const up = c.toUpperCase();
        setLocalColor(up);
        setHexInput(up);
        setError("");
        onChangeAction(up);
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full p-3 rounded-xl bg-background"
        >
            <motion.div variants={itemVariants} className="flex gap-4 items-center">
                <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-lg border-2 border-onBackgroundHover flex items-center justify-center"
                    style={{ backgroundColor: localColor }}
                >
                </div>

                <div className="flex flex-col w-full">
                    <div className="flex gap-3 items-center">
                        <input
                            aria-label="Sélecteur de couleur"
                            type="color"
                            value={localColor}
                            onChange={handleNativeColorChange}
                            className="w-10 h-10 p-0 border-none cursor-pointer rounded"
                        />

                        <input
                            aria-label="Code hex"
                            type="text"
                            value={hexInput}
                            onChange={handleHexChange}
                            onBlur={handleHexBlur}
                            className="flex-1 bg-transparent border-2 border-onBackgroundHover rounded-lg p-2 md:placeholder:italic"
                            placeholder="#RRGGBB"
                        />
                    </div>

                    <div className="flex gap-2 mt-3 flex-wrap">
                        {presetColors.map((c) => (
                            <motion.button
                                key={c}
                                type="button"
                                onClick={() => pickPreset(c)}
                                variants={itemVariants}
                                whileHover={{ scale: 1.06, filter: "blur(0px)" }}
                                className="w-8 h-8 rounded-md border-2 border-onBackgroundHover flex items-center justify-center"
                                style={{ backgroundColor: c }}
                                aria-label={`Couleur ${c}`}
                            />
                        ))}
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                variants={errorVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="text-dangerous mt-2 text-sm flex items-center gap-2"
                                role="alert"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
