"use client"
import { useState, useEffect } from "react";
import type { Schema } from "@amplify/data/resource";

type Expense = Schema["Expense"]["type"];

interface ExpenseSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (selectedExpenseIds: string[]) => Promise<void>;
    expenses: Expense[];
    memberName: string;
}

export default function ExpenseSelectionModal({ isOpen, onClose, onSubmit, expenses, memberName }: ExpenseSelectionModalProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Default to selecting none, or maybe all? Let's default to selecting NONE so user consciously chooses.
            // Or typically in a "Split" app, you might want to add them to all future, but previous ones is opt-in.
            setSelectedIds([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleExpense = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === expenses.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(expenses.map(e => e.id));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(selectedIds);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add {memberName} to expenses</h2>
                    <p className="text-sm text-gray-500 mt-1">Select past expenses that this member should share.</p>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {expenses.length === 0 ? (
                        <p className="text-center text-gray-500 italic">No existing expenses to join.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={toggleAll}
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    {selectedIds.length === expenses.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>
                            {expenses.map(expense => (
                                <label key={expense.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(expense.id)}
                                        onChange={() => toggleExpense(expense.id)}
                                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">{expense.description}</span>
                                            <span className="font-bold text-gray-900">${expense.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {new Date(expense.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-primary text-white rounded-lg shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-0.5 transition-all font-medium disabled:opacity-50"
                    >
                        {isSubmitting ? "Updating..." : `Add to ${selectedIds.length} Expenses`}
                    </button>
                </div>
            </div>
        </div>
    );
}
