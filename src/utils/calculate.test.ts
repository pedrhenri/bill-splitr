import { calculateSettlements, Transaction } from './calculate';

const assert = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message);
    }
};

const runTest = (name: string, fn: () => void) => {
    try {
        fn();
        console.log(`✅ ${name} passed`);
    } catch (e: any) {
        console.error(`❌ ${name} failed: ${e.message}`);
        process.exit(1);
    }
};

runTest('Basic Debt', () => {
    // A paid 20 for A and B. Split is 10 each.
    // A: +20 (paid) -10 (consumed) = +10
    // B: 0 (paid) -10 (consumed) = -10
    // B pays A 10.
    const expenses = [{ amount: 20, payerId: 'A', involvedMemberIds: ['A', 'B'] }];
    const members = [{ id: 'A', name: 'Alice' }, { id: 'B', name: 'Bob' }];

    const transactions = calculateSettlements(expenses, members, []);
    assert(transactions.length === 1, 'Should have 1 transaction');
    assert(transactions[0].from === 'Bob' && transactions[0].to === 'Alice' && transactions[0].amount === 10, 'Bob should pay Alice 10');
});

runTest('Debt with Settlement', () => {
    // Same as above, but B paid A 10 via settlement.
    // B balance: -10 + 10 = 0.
    // A balance: +10 - 10 = 0.
    // Should be no transactions.
    const expenses = [{ amount: 20, payerId: 'A', involvedMemberIds: ['A', 'B'] }];
    const members = [{ id: 'A', name: 'Alice' }, { id: 'B', name: 'Bob' }];
    const settlements = [{ amount: 10, payerId: 'B', receiverId: 'A' }];

    const transactions = calculateSettlements(expenses, members, settlements);
    assert(transactions.length === 0, 'Should have 0 transactions after settlement');
});

runTest('Partial Settlement', () => {
    // A paid 20 for A and B. Split 10 each.
    // B pays A 5.
    // B balance: -10 + 5 = -5.
    // A balance: +10 - 5 = +5.
    // B should pay A 5.
    const expenses = [{ amount: 20, payerId: 'A', involvedMemberIds: ['A', 'B'] }];
    const members = [{ id: 'A', name: 'Alice' }, { id: 'B', name: 'Bob' }];
    const settlements = [{ amount: 5, payerId: 'B', receiverId: 'A' }];

    const transactions = calculateSettlements(expenses, members, settlements);
    assert(transactions.length === 1, 'Should have 1 transaction');
    assert(transactions[0].amount === 5, 'Remaining debt should be 5');
});

console.log('All tests passed!');
