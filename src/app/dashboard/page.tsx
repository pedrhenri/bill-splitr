"use client"
import { Authenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { client } from "@/client";
import type { Schema } from "@amplify/data/resource";
import { signOut } from "aws-amplify/auth"; // Import direct signOut if needed, but prop is passed
import "@aws-amplify/ui-react/styles.css";
import GroupModal from "@/components/GroupModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";

// Icons (Simple SVGs for elegance)
import Spinner from "@/components/Spinner";

// Icons (Simple SVGs for elegance)
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
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

function Dashboard({ signOut, user }: { signOut: ((data?: any) => void) | undefined, user: any }) {
    const toast = useToast();
    const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Schema["Group"]["type"] | null>(null);
    const [confirmModalState, setConfirmModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });

    useEffect(() => {
        const sub = client.models.Group.observeQuery().subscribe({
            next: (data) => {
                setGroups([...data.items]);
                setIsLoading(false);
            },
        });
        return () => sub.unsubscribe();
    }, []);

    const handleCreateGroup = async (data: { name: string; description: string }) => {
        try {
            if (editingGroup) {
                // Update existing
                await client.models.Group.update({
                    id: editingGroup.id,
                    name: data.name,
                    description: data.description
                });
                toast.success("Group updated successfully!");
            } else {
                // Create new
                await client.models.Group.create({
                    name: data.name,
                    description: data.description
                });
                toast.success("Group created successfully!");
            }
            setEditingGroup(null); // Reset
        } catch (error) {
            console.error(error);
            toast.error("Failed to save group.");
        }
    };

    const openCreateModal = () => {
        setEditingGroup(null);
        setIsGroupModalOpen(true);
    };

    const openEditModal = (e: React.MouseEvent, group: Schema["Group"]["type"]) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingGroup(group);
        setIsGroupModalOpen(true);
    };

    const handleDeleteGroup = (e: React.MouseEvent, group: Schema["Group"]["type"]) => {
        e.preventDefault();
        e.stopPropagation();

        setConfirmModalState({
            isOpen: true,
            title: "Delete Group?",
            message: `Are you sure you want to delete "${group.name}"? This will permanently delete all expenses, members, and history for this group.`,
            isDestructive: true,
            onConfirm: async () => {
                try {
                    // Cascade Delete Logic
                    const groupId = group.id;

                    // 1. Fetch all dependencies parallel
                    const [expenses, members, settlements] = await Promise.all([
                        client.models.Expense.list({ filter: { groupId: { eq: groupId } } }),
                        client.models.Member.list({ filter: { groupId: { eq: groupId } } }),
                        client.models.Settlement.list({ filter: { groupId: { eq: groupId } } })
                    ]);

                    // 2. Delete all of them
                    const deletePromises = [
                        ...expenses.data.map(i => client.models.Expense.delete({ id: i.id })),
                        ...members.data.map(i => client.models.Member.delete({ id: i.id })),
                        ...settlements.data.map(i => client.models.Settlement.delete({ id: i.id })),
                    ];

                    await Promise.all(deletePromises);

                    // 3. Finally delete the group
                    await client.models.Group.delete({ id: groupId });

                    toast.success("Group deleted successfully.");
                } catch (error) {
                    console.error("Failed to delete group:", error);
                    toast.error("Failed to delete group. Check console.");
                }
            }
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-primary-dark sm:text-5xl mb-2">
                            Bill Splitr
                        </h1>
                        <p className="text-lg text-gray-600 font-light">
                            Manage expenses comfortably and elegantly.
                        </p>
                    </div>
                    <button
                        onClick={signOut}
                        className="text-sm font-medium text-gray-500 hover:text-error hover:bg-red-50 px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        Sign Out
                    </button>
                </div>


                {/* Content Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spinner className="h-12 w-12 text-primary/50" />
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Group Cards */}
                        {groups.map(group => (
                            <a href={`/group/${group.id}`} key={group.id} className="block group cursor-pointer no-underline">
                                <div className="card h-full flex flex-col justify-between group-hover:border-primary-light/30">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                                            {group.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                                            {group.description || "No description provided."}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Group</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => openEditModal(e, group)}
                                                className="p-1.5 text-gray-400 hover:text-primary rounded-md transition-colors lg:opacity-0 group-hover:opacity-100"
                                                title="Edit Group"
                                            >
                                                <PencilIcon />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteGroup(e, group)}
                                                className="p-1.5 text-gray-400 hover:text-error rounded-md transition-colors lg:opacity-0 group-hover:opacity-100"
                                                title="Delete Group"
                                            >
                                                <TrashIcon />
                                            </button>
                                            <span className="text-primary lg:opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium ml-2 self-center">Open &rarr;</span>
                                        </div>
                                    </div>
                                </div>

                            </a>
                        ))}

                        {/* Create New Group Card */}
                        <button
                            onClick={openCreateModal}
                            className="h-full min-h-[200px] p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary group"
                        >
                            <PlusIcon />
                            <span className="font-medium text-lg">Create New Group</span>
                        </button>
                    </div>
                )}
            </div>

            <GroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSubmit={handleCreateGroup}
                initialData={editingGroup ? { name: editingGroup.name, description: editingGroup.description || null } : null}
                title={editingGroup ? "Edit Group" : "Create New Group"}
                submitText={editingGroup ? "Save Changes" : "Create Group"}
            />

            <ConfirmModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                isDestructive={confirmModalState.isDestructive}
            />
        </main>
    );
}

export default function Home() {
    return (
        <Authenticator>
            {({ signOut, user }) => (
                <Dashboard signOut={signOut} user={user} />
            )}
        </Authenticator>
    )
}
