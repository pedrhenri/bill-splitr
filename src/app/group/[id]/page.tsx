"use client"
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { client } from "@/client";
import type { Schema } from "@amplify/data/resource";
import { Authenticator } from "@aws-amplify/ui-react";
import { calculateSettlements } from "@/utils/calculate";
import ExpenseModal from "@/components/ExpenseModal";
import ConfirmModal from "@/components/ConfirmModal";
import InputModal from "@/components/InputModal";
import ExpenseSelectionModal from "@/components/ExpenseSelectionModal";
import { useToast } from "@/components/ToastProvider"; // Custom hook
import "@aws-amplify/ui-react/styles.css";
import Spinner from "@/components/Spinner";

// Icons 
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);



export default function GroupPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const toast = useToast();

    const [group, setGroup] = useState<Schema["Group"]["type"] | null>(null);
    const [members, setMembers] = useState<Array<Schema["Member"]["type"]>>([]);
    const [expenses, setExpenses] = useState<Array<Schema["Expense"]["type"]>>([]);
    const [settlementsData, setSettlementsData] = useState<Array<Schema["Settlement"]["type"]>>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Schema["Expense"]["type"] | null>(null);
    const [confirmModalState, setConfirmModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });

    const [inputModalState, setInputModalState] = useState<{
        isOpen: boolean;
        title: string;
        onSubmit: (value: string) => Promise<void> | void;
        placeholder?: string;
        submitText?: string;
    }>({ isOpen: false, title: "", onSubmit: () => { } });

    // UI States
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [showExpenseSelection, setShowExpenseSelection] = useState(false);
    const [newlyAddedMember, setNewlyAddedMember] = useState<Schema["Member"]["type"] | null>(null);

    // Sort expenses by createdAt descending (if verified field exists) or by basic order
    // For now we trust the order or simple append

    useEffect(() => {
        if (!id) return;

        client.models.Group.get({ id }).then(data => {
            if (data.data) setGroup(data.data);
        });

        const subMembers = client.models.Member.observeQuery({
            filter: { groupId: { eq: id } }
        }).subscribe({ next: (d) => setMembers(d.items) });

        const subExpenses = client.models.Expense.observeQuery({
            filter: { groupId: { eq: id } }
        }).subscribe({ next: (d) => setExpenses(d.items) });

        let subSettlements: { unsubscribe: () => void } | undefined;

        if (client.models.Settlement) {
            subSettlements = client.models.Settlement.observeQuery({
                filter: { groupId: { eq: id } }
            }).subscribe({ next: (d) => setSettlementsData(d.items) });
        }

        return () => {
            subMembers.unsubscribe();
            subExpenses.unsubscribe();
            if (subSettlements) subSettlements.unsubscribe();
        }
    }, [id]);

    const archiveMember = async (memberId: string) => {
        // 1. Calculate Balance
        // We need the *latest* calculation.
        // `settlements` (the useMemo one) contains all transactions including pending ones.
        // We need to find the specific member's net balance.

        // Let's re-run calculation on the fly to be safe or inspect the `settlements` array?
        // Actually, the `settlements` array (calculated in useMemo) shows what IS pending.
        // If a member appears in `settlements` (either as from or to) where `isPaid` is false, they have a balance.

        const pendingSettlements = settlements.filter(s => !s.isPaid && (s.from === members.find(m => m.id === memberId)?.name || s.to === members.find(m => m.id === memberId)?.name));

        if (pendingSettlements.length > 0) {
            toast.error("Member has outstanding balance. Settle up before removing.");
            return;
        }

        setConfirmModalState({
            isOpen: true,
            title: "Archive Member?",
            message: "Are you sure you want to remove this member? They will be hidden from lists but their history will be preserved.",
            isDestructive: true,
            onConfirm: async () => {
                // Optimistic Update
                const prevMembers = [...members];
                // We don't remove from state, we update isActive. But since we filter on render, update state to refelct that.
                setMembers(prev => prev.map(m => m.id === memberId ? { ...m, isActive: false } : m));

                try {
                    // 2. Soft Delete
                    await client.models.Member.update({ id: memberId, isActive: false });
                    toast.success("Member archived");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to archive member");
                    setMembers(prevMembers); // Revert
                }
            }
        });
    };

    const addMember = () => {
        setInputModalState({
            isOpen: true,
            title: "Add New Member",
            placeholder: "Enter member name...",
            submitText: "Add Member",
            onSubmit: async (name: string) => {
                try {
                    // 1. Create Member
                    const { data: newMember } = await client.models.Member.create({ name, groupId: id });

                    if (newMember) {
                        setMembers(prev => {
                            if (prev.some(m => m.id === newMember.id)) return prev;
                            return [...prev, newMember];
                        });
                        toast.success("Member added! Select expenses to join.");

                        // 2. Trigger Selection Modal
                        setNewlyAddedMember(newMember);
                        setShowExpenseSelection(true);
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to add member");
                }
            }
        });
    };

    const handleAddMemberToExpenses = async (selectedExpenseIds: string[]) => {
        if (!newlyAddedMember) return;

        // Optimistic update locally
        const updatedExpenses = expenses.map(e => {
            if (selectedExpenseIds.includes(e.id)) {
                const currentInvolved = (e.involvedMemberIds || []).filter((id): id is string => id !== null);
                if (!currentInvolved.includes(newlyAddedMember.id)) {
                    return { ...e, involvedMemberIds: [...currentInvolved, newlyAddedMember.id] };
                }
            }
            return e;
        });
        setExpenses(updatedExpenses);

        // Backend update
        await Promise.all(selectedExpenseIds.map(async (eid) => {
            const expense = expenses.find(e => e.id === eid);
            if (!expense) return;

            const currentInvolved = (expense.involvedMemberIds || []).filter((id): id is string => id !== null);
            if (!currentInvolved.includes(newlyAddedMember.id)) {
                await client.models.Expense.update({
                    id: eid,
                    involvedMemberIds: [...currentInvolved, newlyAddedMember.id]
                });
            }
        }));

        toast.success(`Added ${newlyAddedMember.name} to ${selectedExpenseIds.length} expenses`);
        setNewlyAddedMember(null);
    };

    const openAddExpense = () => {
        if (members.length === 0) {
            toast.error("Add members first!");
            return;
        }
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const openEditExpense = (expense: Schema["Expense"]["type"]) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleSaveExpense = async (data: { description: string, amount: number, payerId: string, involvedMemberIds: string[] }) => {
        try {
            if (editingExpense) {
                // Optimistic Update (Local replace)
                const updated = { ...editingExpense, ...data };
                setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updated : e));

                await client.models.Expense.update({
                    id: editingExpense.id,
                    ...data
                });
                toast.success("Expense updated!");
            } else {
                // Optimistic Update (Local append - ID placeholder until refresh)
                const optimisticId = Math.random().toString();
                const newExpense = {
                    id: optimisticId,
                    groupId: id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...data
                } as Schema["Expense"]["type"]; // Cast for UI purposes

                setExpenses(prev => [...prev, newExpense]);

                await client.models.Expense.create({
                    groupId: id,
                    ...data
                });
                toast.success("Expense added!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save expense");
            // Revert logic could be added here for strict robustness
        }
    };

    const deleteExpense = async (expenseId: string) => {
        setConfirmModalState({
            isOpen: true,
            title: "Delete Expense?",
            message: "Are you sure you want to delete this expense?",
            isDestructive: true,
            onConfirm: async () => {
                // Optimistic Remove
                const prevExpenses = [...expenses];
                setExpenses(prev => prev.filter(e => e.id !== expenseId));

                try {
                    await client.models.Expense.delete({ id: expenseId });
                    toast.success("Expense deleted");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to delete expense");
                    setExpenses(prevExpenses); // Revert
                }
            }
        });
    }


    const handleSettleUp = async (fromName: string, toName: string, amount: number) => {
        const payer = members.find(m => m.name === fromName);
        const receiver = members.find(m => m.name === toName);

        if (!payer || !receiver) return;

        setConfirmModalState({
            isOpen: true,
            title: "Record Payment?",
            message: `Record payment of $${amount.toFixed(2)} from ${fromName} to ${toName}?`,
            onConfirm: async () => {
                if (!client.models.Settlement) {
                    toast.error("Settlement feature is still initializing. Please reload.");
                    return;
                }

                // Optimistic Update
                const newSettlement = {
                    id: Math.random().toString(),
                    amount,
                    payerId: payer.id,
                    receiverId: receiver.id,
                    groupId: id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                } as Schema["Settlement"]["type"];

                setSettlementsData(prev => [...prev, newSettlement]);

                try {
                    await client.models.Settlement.create({
                        amount,
                        payerId: payer.id,
                        receiverId: receiver.id,
                        groupId: id
                    });
                    toast.success("Payment recorded!");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to record payment");
                    // Revert
                    setSettlementsData(prev => prev.filter(s => s.id !== newSettlement.id));
                }
            }
        });
    };

    const settlements = useMemo(() => {
        const validExpenses = expenses.map(e => ({
            ...e,
            involvedMemberIds: (e.involvedMemberIds || []).filter((id): id is string => id !== null)
        })).filter(e => e.involvedMemberIds.length > 0);

        // 1. Pending Debts (calculated)
        const pendingDebts = calculateSettlements(validExpenses, members, settlementsData).map(t => ({
            ...t,
            isPaid: false,
            id: `pending-${t.from}-${t.to}` // virtual ID
        }));

        // 2. Paid History (from DB)
        // We need to map Settlement objects to the same structure (Transaction-ish) but marked as paid
        const paidHistory = settlementsData.map(s => {
            const payerName = members.find(m => m.id === s.payerId)?.name || 'Unknown';
            const receiverName = members.find(m => m.id === s.receiverId)?.name || 'Unknown';
            return {
                from: payerName,
                to: receiverName,
                amount: s.amount,
                isPaid: true,
                id: s.id,
                createdAt: s.createdAt
            };
        });

        // Combine and sort?
        // Maybe show Pending first, then History?
        return [...pendingDebts, ...paidHistory];
    }, [expenses, members, settlementsData]);

    if (!group) return (
        <div className="min-h-screen flex items-center justify-center">
            <Spinner className="h-10 w-10 text-primary" />
        </div>
    );

    const modalInitialData = editingExpense ? {
        id: editingExpense.id,
        description: editingExpense.description,
        amount: editingExpense.amount,
        payerId: editingExpense.payerId,
        involvedMemberIds: (editingExpense.involvedMemberIds || []).filter((id): id is string => id !== null)
    } : null;

    return (
        <Authenticator>
            <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mb-8 text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                    >
                        &larr; Back to Dashboard
                    </button>

                    <header className="mb-12">
                        <h1 className="text-5xl font-extrabold tracking-tight text-primary-dark mb-3">{group.name}</h1>
                        <p className="text-gray-500 text-lg font-light max-w-2xl">{group.description}</p>
                    </header>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Left Column: Members & Settlements */}
                        <div className="space-y-8">
                            <section className="card">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Members</h2>
                                    <button
                                        onClick={addMember}
                                        disabled={isAddingMember}
                                        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-secondary/10 text-secondary-dark px-3 py-1.5 rounded-full hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isAddingMember ? <Spinner /> : <PlusIcon />}
                                        {isAddingMember ? "Adding..." : "Add"}
                                    </button>
                                </div>
                                <ul className="space-y-3">
                                    {members.filter(m => m.isActive !== false).map(m => (
                                        <li key={m.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold shadow-sm">
                                                    {m.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-700">{m.name}</span>
                                            </div>
                                            <button
                                                onClick={() => archiveMember(m.id)}
                                                className="lg:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-error transition-all p-2 rounded-md"
                                                title="Remove Member"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </li>
                                    ))}
                                    {members.length === 0 && <p className="text-sm text-gray-400 italic">No members yet.</p>}
                                </ul>
                            </section>

                            <section className="card">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                                    Settlements
                                </h2>
                                <ul className="space-y-3">
                                    {settlements.map((s, idx) => (
                                        <li key={`${s.id}-${s.amount}`} className={`flex items-center justify-between p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2 duration-500 ${s.isPaid ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-primary/20 shadow-sm'}`}>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className={`font-bold ${s.isPaid ? 'text-gray-500' : 'text-gray-900'}`}>{s.from}</span>
                                                <span className="text-gray-400 text-xs">{s.isPaid ? 'paid' : 'pays'}</span>
                                                <span className={`font-bold ${s.isPaid ? 'text-gray-500' : 'text-gray-900'}`}>{s.to}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-mono font-bold ${s.isPaid ? 'text-gray-400 line-through' : 'text-primary'}`}>${s.amount.toFixed(2)}</span>
                                                {!s.isPaid && (
                                                    <button
                                                        onClick={() => handleSettleUp(s.from, s.to, s.amount)}
                                                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {s.isPaid && (
                                                    <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Paid</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                    {settlements.length === 0 && expenses.length > 0 && (
                                        <div className="text-center py-4 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-sm font-medium text-green-700">All settled up!</p>
                                        </div>
                                    )}
                                    {expenses.length === 0 && <p className="text-sm text-gray-400">Add expenses to see settlements.</p>}
                                </ul>
                            </section>
                        </div>

                        {/* Right Column: Expenses */}
                        <div>
                            <section className="card h-full">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold text-gray-800">Expenses</h2>
                                    <button
                                        onClick={openAddExpense}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <PlusIcon /> Add Expense
                                    </button>
                                </div>
                                <ul className="space-y-4">
                                    {expenses.map(e => {
                                        const payer = members.find(m => m.id === e.payerId)?.name || 'Unknown';
                                        const involvedCount = e.involvedMemberIds ? e.involvedMemberIds.length : 0;
                                        const isSettled = involvedCount <= 1; // Hint if it's only split with self

                                        // Generate a tooltip string of names
                                        const involvedNames = e.involvedMemberIds
                                            ? members.filter(m => e.involvedMemberIds?.includes(m.id)).map(m => m.name).join(', ')
                                            : '';

                                        return (
                                            <li key={e.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-elevation-2 transition-all duration-300 group relative animate-in fade-in slide-in-from-bottom-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => openEditExpense(e)}>{e.description}</h3>
                                                        <p className="text-sm text-gray-500">Paid by <span className="font-medium text-gray-900">{payer}</span></p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="font-bold text-xl text-gray-900">${e.amount.toFixed(2)}</span>
                                                        <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openEditExpense(e)}
                                                                className="text-gray-400 hover:text-primary transition-colors p-1"
                                                                title="Edit Expense"
                                                            >
                                                                <PencilIcon />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteExpense(e.id)}
                                                                className="text-gray-400 hover:text-error transition-colors p-1"
                                                                title="Delete Expense"
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex gap-2 flex-wrap items-center">
                                                    <span
                                                        className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium cursor-help ${isSettled ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
                                                        title={`Involved: ${involvedNames}`}
                                                    >
                                                        Split between {involvedCount} {involvedCount === 1 ? 'person' : 'people'}
                                                    </span>
                                                    {isSettled && (
                                                        <span className="text-[10px] text-orange-600 font-medium">
                                                            (Self-funded?)
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    })}
                                    {expenses.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                            <p className="mb-4">No expenses recorded yet.</p>
                                            <button onClick={openAddExpense} className="text-primary hover:text-primary-dark font-medium hover:underline">Add your first expense</button>
                                        </div>
                                    )}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>

                <ExpenseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSaveExpense}
                    members={members}
                    initialData={modalInitialData}
                />

                <ConfirmModal
                    isOpen={confirmModalState.isOpen}
                    onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModalState.onConfirm}
                    title={confirmModalState.title}
                    message={confirmModalState.message}
                    isDestructive={confirmModalState.isDestructive}
                />

                <InputModal
                    isOpen={inputModalState.isOpen}
                    onClose={() => setInputModalState(prev => ({ ...prev, isOpen: false }))}
                    onSubmit={inputModalState.onSubmit}
                    title={inputModalState.title}
                    placeholder={inputModalState.placeholder}
                    submitText={inputModalState.submitText}
                />

                <ExpenseSelectionModal
                    isOpen={showExpenseSelection}
                    onClose={() => setShowExpenseSelection(false)}
                    onSubmit={handleAddMemberToExpenses}
                    expenses={expenses}
                    memberName={newlyAddedMember?.name || 'New Member'}
                />
            </main>
        </Authenticator>
    );
}
