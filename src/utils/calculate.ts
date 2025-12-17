export type Transaction = {
    from: string;
    to: string;
    amount: number;
};

export function calculateSettlements(
    expenses: { amount: number; payerId: string; involvedMemberIds: string[] | null }[],
    members: { id: string; name: string }[],
    settlements: { amount: number; payerId: string; receiverId: string }[] = []
): Transaction[] {
    const balances: Record<string, number> = {};

    // Initialize 0
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(e => {
        const payer = e.payerId;
        const amount = e.amount;
        const involved = e.involvedMemberIds || []; // Handle null/undefined if schema allows, though schema says required usually

        if (involved.length === 0) return;

        const splitAmount = amount / involved.length;

        // Net Balance = Paid - Consumed
        balances[payer] = (balances[payer] || 0) + amount;

        involved.forEach(memberId => {
            // Clean memberId in case it has quotes or anything if poorly stored, but should be fine
            if (memberId) {
                balances[memberId] = (balances[memberId] || 0) - splitAmount;
            }
        });

        // Handle case where payer is NOT in involved list? 
        // Logic above assumes payer PAYS the full amount. 
        // If payer is also a consumer (in involved), they get -splitAmount. 
        // So if Alice pays 30 for A,B,C. Alice is +30 (paid). A is -10. Net Alice +20. Correct.
    });

    settlements.forEach(s => {
        // Payer (Debtor of the expense, now Payer of the settlement) pays money
        // If B owed A, B had negative balance. Paying A makes B's balance go UP (towards 0).
        balances[s.payerId] = (balances[s.payerId] || 0) + s.amount;

        // Receiver (Creditor of the expense) receives money
        // If A was owed, A had positive balance. Receiving money makes A's balance go DOWN (towards 0).
        balances[s.receiverId] = (balances[s.receiverId] || 0) - s.amount;
    });

    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
        if (Math.abs(amount) < 0.01) return;
        if (amount > 0) creditors.push({ id, amount });
        else debtors.push({ id, amount: -amount });
    });

    const transactions: Transaction[] = [];

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(debtor.amount, creditor.amount);

        const debtorName = members.find(m => m.id === debtor.id)?.name || 'Unknown';
        const creditorName = members.find(m => m.id === creditor.id)?.name || 'Unknown';

        transactions.push({ from: debtorName, to: creditorName, amount });

        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return transactions;
}
