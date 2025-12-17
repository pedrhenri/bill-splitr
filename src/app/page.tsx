"use client"
import { Authenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { client } from "@/client";
import type { Schema } from "@amplify/data/resource";
import { signOut } from "aws-amplify/auth"; // Import direct signOut if needed, but prop is passed
import "@aws-amplify/ui-react/styles.css";

// Icons (Simple SVGs for elegance)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

function Dashboard({ signOut, user }: { signOut: ((data?: any) => void) | undefined, user: any }) {
  const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Group.observeQuery().subscribe({
      next: (data) => setGroups([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const createGroup = async () => {
    // Ideally replace this with a nice Modal later
    const name = window.prompt("Enter Group Name:");
    if (name) {
      await client.models.Group.create({ name });
    }
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
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">Open &rarr;</span>
                </div>
              </div>
            </a>
          ))}

          {/* Create New Group Card */}
          <button
            onClick={createGroup}
            className="h-full min-h-[200px] p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary group"
          >
            <PlusIcon />
            <span className="font-medium text-lg">Create New Group</span>
          </button>
        </div>
      </div>
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
