# Roundup 🪙

> Spare change, on autopilot. Consumer DeFi that feels like a fintech app.

**Live Demo:** https://roundup-beta.vercel.app  
**Contract:** `0x7A8A35dd0813168a7d4f382c4ad718F88B01d839` on Flow EVM Testnet  
**Explorer:** [View on Flowscan](https://evm-testnet.flowscan.io/address/0x7A8A35dd0813168a7d4f382c4ad718F88B01d839)

---

## What is Roundup?

Roundup brings the "save-the-change" model — made famous by Acorns — to decentralized finance on Flow.

Every time a user makes a purchase, the amount is rounded up to the nearest dollar. That spare change is automatically deposited into a yield-generating vault on Flow EVM. No manual steps, no gas headaches, no DeFi jargon. Just a fintech-grade experience where your money quietly grows in the background — with true on-chain ownership.

This is consumer DeFi the way it should work: invisible infrastructure, human-first interface.

---

## The Problem

DeFi has a UX problem. Yield vaults, liquidity pools, and savings protocols exist — but they're built for power users. The average person doesn't know what a transaction signature is, doesn't want to think about gas fees, and definitely isn't going to manually deposit into a vault every week.

Meanwhile, traditional fintech apps like Acorns have proven that micro-saving works at scale. Millions of people save without thinking about it — because the app does it for them.

Roundup bridges these two worlds.

---

## How It Works

1. User connects their wallet (or onboards via email — walletless support planned)
2. They simulate a purchase — the app calculates the roundup amount
3. The spare change is automatically deposited into the `RoundupVault` smart contract on Flow EVM
4. The vault accrues yield at 4.20% APY, compounding with every deposit
5. An AI spending coach (powered by Groq's Llama 3) surfaces a personalized insight after each roundup
6. Users can withdraw their full balance + yield anytime, in one tap

---

## Technical Execution

### Smart Contract — `RoundupVault.sol`
- Deployed on **Flow EVM Testnet** (Chain ID: 545)
- Written in Solidity 0.8.24
- Handles deposits, yield accrual, and withdrawals trustlessly
- Yield calculated on-chain using `block.timestamp` delta and APY basis points
- No admin keys, no upgradeable proxies — fully non-custodial
- Users' funds are only withdrawable by the depositor

### Frontend
- **Next.js 16** + **Tailwind CSS** + **shadcn/ui**
- **RainbowKit** + **wagmi** + **viem** for wallet connection and contract interaction
- Real-time vault balance pulled directly from contract via `getVaultInfo()`
- On-chain deposit confirmation before updating UI state
- Activity feed persisted in localStorage, linked to Flowscan for tx verification

### AI Coach
- **Groq API** (Llama 3.1 8B Instant) via Next.js API route
- Fires after every confirmed on-chain deposit
- Generates personalized, data-driven insights referencing the user's actual roundup count and total saved
- Sub-second response time — feels native, not bolted on

### Why Flow?
Flow EVM is purpose-built for consumer-facing applications. Sub-cent gas fees make micro-deposits economically viable — the core mechanic of Roundup only works at scale when gas doesn't eat the savings. Flow's high throughput and EVM compatibility let us ship fast without sacrificing the user experience.

---

## Judging Criteria — Our Take

### Technical Execution
The vault contract handles deposit, yield accrual, and withdrawal logic entirely on-chain. The frontend reads live contract state, waits for transaction confirmation before updating balances, and links every deposit to a verifiable on-chain transaction. This isn't a mock — it's a working DeFi application on a live testnet.

### Impact / Usefulness
Micro-saving is a proven behavior. Acorns crossed $1B AUM by doing this in TradFi. Roundup brings the same mechanic on-chain — giving users yield that a bank would never offer, with full ownership of their funds. The AI coach layer adds a dimension traditional fintech can't offer: personalized, real-time financial guidance with zero human overhead.

### Completeness / Functionality
The app is fully functional end-to-end:
- Wallet connection ✓
- On-chain deposits ✓
- Yield accrual ✓
- AI coaching ✓
- Withdrawal ✓
- Activity history with block explorer links ✓
- Deployed on Vercel with a live URL ✓

### Scalability / Future Potential
Roundup is architected to scale. See roadmap below.

---

## Roadmap

**Phase 1 — Current (Hackathon)**
- Core vault contract on Flow EVM testnet
- Simulated purchase roundups
- AI spending coach
- Walletless-ready UI

**Phase 2 — Near Term**
- Mainnet deployment on Flow EVM
- USDC vault (stablecoin deposits, eliminating token volatility)
- Walletless onboarding via Privy (email, social login)
- Sponsored gas so users never see a fee prompt
- Real payment rail integration (UPI, card webhooks triggering roundups)

**Phase 3 — Scale**
- Mobile app (React Native)
- Multiple yield strategies (conservative, balanced, aggressive)
- Social savings — group vaults, shared goals
- Referral system with yield bonuses
- B2B SDK — any fintech app can embed Roundup's save-the-change layer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Flow EVM Testnet |
| Smart Contract | Solidity 0.8.24 |
| Frontend | Next.js 16, Tailwind CSS, shadcn/ui |
| Wallet | RainbowKit, wagmi, viem |
| AI Coach | Groq API (Llama 3.1 8B Instant) |
| Deployment | Vercel |

---

## Local Setup
```bash
git clone https://github.com/pulkit136/roundup
cd roundup
npm install
```

Create `.env.local`:
```
GROQ_API_KEY=your_groq_key
```
```bash
npm run dev
```

Open `http://localhost:3000`, connect MetaMask to Flow EVM Testnet (Chain ID: 545), and hit "Make a Purchase".

---

## Team

Built solo at PL_Genesis: Frontiers of Collaboration Hackathon, Flow sponsor track.

---

*Roundup is deployed on testnet. Gas fees on testnet are not representative of mainnet costs — on Flow EVM mainnet, gas is sub-cent, making micro-deposits fully economically viable.*