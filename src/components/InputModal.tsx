"use client";
import { useState } from "react";

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => Promise<void> | void;
    title: string;
    placeholder?: string;
    submitText?: string;
}

export default function InputModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    placeholder = "Type here...",
    submitText = "Save"
}: InputModalProps) {
    const [value, setValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(value);
            setValue(""); // Reset on success
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <input
                        type="text"
                        autoFocus
                        required
                        placeholder={placeholder}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all mb-4"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !value.trim()}
                            className="px-4 py-2 bg-primary text-white rounded-lg shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-0.5 transition-all font-medium flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
