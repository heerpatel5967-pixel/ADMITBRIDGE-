# Security Specification — Admit Bridge Firestore Rules

## 1. Data Invariants
1. Every document in `/users/{userId}` MUST have `uid == userId == request.auth.uid`, valid `chanceMeExam`, bounded `shortlistIds` (`<= 30`), and server-verified `createdAt`/`updatedAt`.
2. Every chat turn in `/users/{userId}/chats/{messageId}` MUST belong to an existing parent `/users/{userId}` document (Master Gate `exists(...)`), have `userId == userId == request.auth.uid`, bounded `content` (`1..25000` chars), and immutable `createdAt`.
3. Every custom college in `/colleges/{collegeId}` MUST have `id == collegeId`, `createdBy == request.auth.uid`, bounded arrays (`<= 25`), strictly structured `feeRanges: { ugTotal, pgTotal }`, and verified email (`email_verified == true`).
4. List queries on `/users` are completely blocked (`allow list: if false`); list queries on `/users/{userId}/chats` and `/colleges` MUST evaluate `resource.data` directly against `request.auth.uid` (or bootstrapped verified admin email) without `get()`/`exists()` inside `allow list`.

## 2. Adversarial "Dirty Dozen" Attack Payloads (All Must Return `PERMISSION_DENIED`)
1. **Unauthenticated Profile Read**: Guest attempts `get /users/user123` -> Blocked (`isSignedIn()` false).
2. **Cross-User Profile Hijack**: Authenticated `userA` attempts `create /users/userB` with `uid: 'userA'` -> Blocked (`isOwner(userB)` false).
3. **Shadow Field Injection on User Profile**: `userA` sends `{ ..., isAdmin: true }` to `/users/userA` -> Blocked (`hasOnly([...])`).
4. **Unverified Email Spoofing Admin**: Unverified token (`email: 'heerpatel5967@gmail.com', email_verified: false`) attempts read/write on `/colleges/other` -> Blocked (`email_verified == true` check).
5. **1.5KB Document ID Poisoning**: Attacker writes to `/colleges/${'a'.repeat(1500)}` -> Blocked (`isValidId` max `128` + regex).
6. **Orphaned Chat Subcollection Write**: Attacker creates `/users/userA/chats/msg1` when parent `/users/userA` does not exist -> Blocked (`exists(/databases/.../users/userA)`).
7. **Chat Content Flood (>25KB)**: User writes `content` of 50,000 chars -> Blocked (`size() <= 25000`).
8. **Fake Timestamp Injection**: Client sends `createdAt: Timestamp.fromMillis(0)` instead of `serverTimestamp()` -> Blocked (`createdAt == request.time`).
9. **Immutable Owner Mutation on Custom College**: User updates `/colleges/c1` changing `createdBy` to another UID -> Blocked (`incoming().createdBy == existing().createdBy` + `affectedKeys().hasOnly(...)`).
10. **Ghost Key in `feeRanges` Map**: Attacker sends `feeRanges: { ugTotal: '₹5L', pgTotal: '₹3L', hidden: 'x' }` -> Blocked (`feeRanges.keys().hasOnly(['ugTotal', 'pgTotal'])`).
11. **Unbounded Shortlist Array (>30)**: User sends 50 IDs in `shortlistIds` -> Blocked (`shortlistIds.size() <= 30`).
12. **User Collection Scraping (`list /users`)**: Attacker runs `getDocs(collection(db, 'users'))` -> Blocked (`allow list: if false`).
