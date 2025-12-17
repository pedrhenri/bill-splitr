"use client"
import { useState, useEffect } from "react";
import type { Schema } from "@amplify/data/resource";
import { useToast } from "@/components/ToastProvider";

type Member = Schema["Member"]["type"];

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { description: string, amount: number, payerId: string, involvedMemberIds: string[] }) => Promise<void>;
    members: Member[];
    initialData?: {
        id?: string;
        description: string;
        amount: number;
        payerId: string;
        involvedMemberIds: string[];
    } | null;
}

export default function ExpenseModal({ isOpen, onClose, onSubmit, members, initialData }: ExpenseModalProps) {
    const toast = useToast();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [payerId, setPayerId] = useState("");
    const [involvedIds, setInvolvedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableMembers, setAvailableMembers] = useState<Member[]>([]);

    useEffect(() => {
        // Smart Filtering: Show Active Members + Members relevant to this historic expense
        const activeMembers = members.filter(m => m.isActive !== false);

        if (initialData) {
            const historicIds = new Set([initialData.payerId, ...(initialData.involvedMemberIds || [])]);
            const historicMembers = members.filter(m => m.isActive === false && historicIds.has(m.id));

            // Combine and sort
            const combined = [...activeMembers, ...historicMembers].sort((a, b) => a.name.localeCompare(b.name));
            setAvailableMembers(combined);
        } else {
            setAvailableMembers(activeMembers);
        }
    }, [members, initialData]);

    // Reset or Populate form when opening
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDescription(initialData.description);
                setAmount(initialData.amount.toString());
                setPayerId(initialData.payerId);
                setInvolvedIds(initialData.involvedMemberIds || []);
            } else {
                setDescription("");
                setAmount("");
                // Default payer to first AVAILABLE member if exists
                // We need to calc available members here immediately or rely on the effect above?
                // The effect above runs after render. Let's calculate purely for defaults here using same logic or wait?
                // Better to calculate "default list" just for this initial set:
                const activeMembers = members.filter(m => m.isActive !== false);
                if (activeMembers.length > 0) setPayerId(activeMembers[0].id);
                setInvolvedIds(activeMembers.map(m => m.id));
            }
        }
    }, [isOpen, initialData, members]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !payerId) return;
        if (involvedIds.length === 0) {
            toast.error("At least one person must be involved in the split.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                description,
                amount: parseFloat(amount),
                payerId,
                involvedMemberIds: involvedIds
            });
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save expense.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMember = (id: string) => {
        setInvolvedIds(prev =>
            prev.includes(id)
                ? prev.filter(mId => mId !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (involvedIds.length === availableMembers.length) {
            setInvolvedIds([]);
        } else {
            setInvolvedIds(availableMembers.map(m => m.id));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? "Edit Expense" : "New Expense"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Dinner, Taxi"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="any"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Payer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                        <select
                            value={payerId}
                            onChange={e => setPayerId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                        >
                            {availableMembers.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} {m.isActive === false ? "(Archived)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Involved Members */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Split With</label>
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                {involvedIds.length === availableMembers.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                            {availableMembers.map(m => (
                                <label key={m.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${m.isActive === false ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="checkbox"
                                        checked={involvedIds.includes(m.id)}
                                        onChange={() => toggleMember(m.id)}
                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className={`text-sm truncate ${m.isActive === false ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                                        {m.name} {m.isActive === false && "(Archived)"}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {involvedIds.length === 0 && (
                            <p className="text-xs text-error mt-1">Select at least one person.</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2 text-right">
                            {involvedIds.length} selected
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || involvedIds.length === 0}
                            className="px-6 py-2 bg-primary text-white rounded-lg shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-0.5 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : "Save Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
