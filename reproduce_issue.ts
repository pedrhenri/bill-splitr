
import { calculateSettlements } from "./src/utils/calculate";

const members = [
    { id: "m1", name: "Alice" },
    { id: "m2", name: "Bob" },
    { id: "m3", name: "Charlie" }
];

const expenses = [
    // Existing expenses (implied by user having 3 expenses before)
    { id: "e1", amount: 30, payerId: "m1", involvedMemberIds: ["m1", "m2", "m3"] },
    { id: "e2", amount: 30, payerId: "m2", involvedMemberIds: ["m1", "m2", "m3"] },
    { id: "e3", amount: 30, payerId: "m3", involvedMemberIds: ["m1", "m2", "m3"] },
    // New Optimistic Expense
    { id: "new", amount: 50, payerId: "m1", involvedMemberIds: ["m1", "m2"] } // Alice creates, splits with Bob
];

const settlementsData: any[] = []; // Assuming no prior settlements for now, or maybe they exist?

console.log("--- TEST RUN ---");
const result = calculateSettlements(expenses, members, settlementsData);
console.log("Result:", JSON.stringify(result, null, 2));

if (result.length === 0) {
    console.error("FAIL: No settlements generated!");
} else {
    console.log("SUCCESS: Settlements generated.");
}
