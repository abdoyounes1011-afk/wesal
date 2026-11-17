# Firestore Security Specification

## 1. Data Invariants
- Each user can only read, create, update, and list their own subcollections under `/users/{userId}/`.
- Documents must belong to `request.auth.uid`. No user can tamper with another user's profile, goals, history, or progress.
- Document IDs must conform to regex `^[a-zA-Z0-9_\-]+$` and length <= 128 characters.
- String fields must have `.size()` limits to prevent Denial of Wallet resource exhaustion attacks.
- Only authenticated users can access their own document tree.
- System denies all wildcard paths by default (`match /{document=**} { allow read, write: if false; }`).

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Read**: Attempting to read `/users/user123` with `request.auth = null`. (Expected: PERMISSION_DENIED)
2. **Cross-User Snooping**: User A (`auth.uid = "user_A"`) querying `/users/user_B/readingHistory`. (Expected: PERMISSION_DENIED)
3. **ID Poisoning Attack**: Writing to path `/users/{junk_1000_char_id}`. (Expected: PERMISSION_DENIED)
4. **Shadow Field Injection**: Writing `{ userId: "user_A", goalType: "pages", dailyTarget: 1, ghostAdmin: true }` to `/users/user_A/goals/current`. (Expected: PERMISSION_DENIED)
5. **Identity Spoofing**: User A creating doc with `userId: "user_B"` inside `/users/user_A/goals/current`. (Expected: PERMISSION_DENIED)
6. **Negative Daily Target**: Creating a reading goal with `dailyTarget: -5`. (Expected: PERMISSION_DENIED)
7. **Invalid Goal Type Enum**: Setting `goalType: "chapters"` or invalid values. (Expected: PERMISSION_DENIED)
8. **Invalid Page Number**: Setting `lastPage: 9999` or negative numbers. (Expected: PERMISSION_DENIED)
9. **String Overflow DOS**: Attempting to save a 50KB string into `displayName` or `habitStatement`. (Expected: PERMISSION_DENIED)
10. **Orphan Write / Path Mismatch**: Writing to `/users/user_A/readingHistory/2026-11-06` with `userId: "attacker"`. (Expected: PERMISSION_DENIED)
11. **Invalid Date Key Injection**: Attempting to inject SQL/script or oversized string in date key. (Expected: PERMISSION_DENIED)
12. **Blanket Query Scraping**: Attempting a collection group query or unbounded listing across all users. (Expected: PERMISSION_DENIED)
