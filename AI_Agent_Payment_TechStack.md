# AI Agent Payment Solution - Complete Tech Stack

## 🎯 Solution Overview

An AI-powered payment infrastructure where:
- **AI Agents** can autonomously pay for APIs/services using x402 protocol
- **Users** can fund agent wallets via Coinbase Onramp (zero fees)
- **Merchants** can monetize APIs with pay-per-use pricing
- **Everyone** can off-ramp back to fiat via Transak

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Next.js App   │  │  Coinbase       │  │   Agent Chat    │             │
│  │   (React/TS)    │  │  <FundCard />   │  │   Interface     │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
└───────────┼─────────────────────┼─────────────────────┼─────────────────────┘
            │                     │                     │
┌───────────┼─────────────────────┼─────────────────────┼─────────────────────┐
│           ▼                     ▼                     ▼    BACKEND LAYER    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js API Routes / Express                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │ x402 Paywall │  │  Agent API   │  │   Wallet Management      │  │   │
│  │  │  Middleware  │  │  Endpoints   │  │   (Circle SDK)           │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
            │                     │                     │
┌───────────┼─────────────────────┼─────────────────────┼─────────────────────┐
│           ▼                     ▼                     ▼      AI LAYER       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Coinbase AgentKit + LangGraph                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  AI Agent    │  │   Payment    │  │   Custom Action          │  │   │
│  │  │  (Claude/    │  │   Tools      │  │   Providers              │  │   │
│  │  │   GPT-4)     │  │   (x402)     │  │                          │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
            │                     │                     │
┌───────────┼─────────────────────┼─────────────────────┼─────────────────────┐
│           ▼                     ▼                     ▼  BLOCKCHAIN LAYER   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │    Circle    │  │    Circle    │  │     Arc      │  │    Base      │   │
│  │   Wallets    │  │   Gateway    │  │  Blockchain  │  │  (Testnet)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Core Tech Stack

### Frontend
| Technology | Purpose | Why |
|------------|---------|-----|
| **Next.js 14+** | Full-stack framework | SSR, API routes, excellent DX |
| **TypeScript** | Type safety | Required for x402/Circle SDKs |
| **React 18** | UI components | AgentKit UI compatibility |
| **Tailwind CSS** | Styling | Rapid prototyping |
| **@coinbase/onchainkit** | Onramp widget | `<FundCard />` component |

### Backend
| Technology | Purpose | Why |
|------------|---------|-----|
| **Next.js API Routes** or **Express.js** | API layer | x402 middleware support |
| **@x402/next** or **@x402/express** | Payment middleware | Pay-per-use paywalls |
| **@circle-fin/developer-controlled-wallets** | Agent wallets | Programmatic wallet control |
| **@circle-fin/user-controlled-wallets** | User wallets | End-user wallet management |

### AI Agent Layer
| Technology | Purpose | Why |
|------------|---------|-----|
| **@coinbase/agentkit** | Agent framework | Native wallet + payment tools |
| **@coinbase/agentkit-langchain** | LangChain integration | Tool calling, memory |
| **LangGraph** | Complex workflows | State machines for agent logic |
| **Claude API / OpenAI** | LLM provider | AgentKit supports both |

### Blockchain & Payments
| Technology | Purpose | Why |
|------------|---------|-----|
| **x402 Protocol** | Pay-per-use payments | AI-native, $0.001 minimum |
| **Circle Wallets** | Wallet infrastructure | MPC security, gas abstraction |
| **Circle Gateway** | Cross-chain bridging | <500ms transfers |
| **USDC** | Payment token | Stable, zero fees on Arc |
| **Base Sepolia** | Testnet | x402 facilitator support |
| **Arc Testnet** | Production target | Circle's L1 for settlement |

### On/Off-Ramp
| Technology | Purpose | Why |
|------------|---------|-----|
| **Coinbase Onramp** | Fiat → USDC | Zero fees, guest checkout |
| **Transak** | USDC → Fiat | Arc partner, global coverage |

### Infrastructure
| Technology | Purpose | Why |
|------------|---------|-----|
| **Supabase** or **PostgreSQL** | Database | Wallet state, user data |
| **Redis** | Caching | Session tokens, rate limiting |
| **Vercel** | Deployment | Edge functions, easy deploys |

---

## 📁 Project Structure

```
ai-agent-payment/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx              # User dashboard
│   │   ├── agent/
│   │   │   └── page.tsx              # Agent chat interface
│   │   └── api/
│   │       ├── agent/
│   │       │   └── route.ts          # Agent execution endpoint
│   │       ├── wallet/
│   │       │   ├── create/route.ts   # Create user wallet
│   │       │   └── balance/route.ts  # Get balance
│   │       ├── x402/
│   │       │   └── session-token/route.ts  # Onramp session tokens
│   │       └── protected/            # x402 paywalled endpoints
│   │           └── [...path]/route.ts
│   │
│   ├── agent/                        # AI Agent logic
│   │   ├── index.ts                  # Agent initialization
│   │   ├── tools/                    # Custom agent tools
│   │   │   ├── payment-tool.ts       # x402 payment tool
│   │   │   ├── wallet-tool.ts        # Wallet management
│   │   │   └── api-tool.ts           # External API calls
│   │   └── prompts/
│   │       └── system.ts             # Agent system prompts
│   │
│   ├── lib/
│   │   ├── circle/
│   │   │   ├── wallets.ts            # Circle Wallet SDK wrapper
│   │   │   └── gateway.ts            # Circle Gateway integration
│   │   ├── x402/
│   │   │   ├── middleware.ts         # x402 middleware config
│   │   │   └── client.ts             # x402 client for agent
│   │   ├── onramp/
│   │   │   └── coinbase.ts           # Coinbase Onramp helpers
│   │   └── offramp/
│   │       └── transak.ts            # Transak integration
│   │
│   ├── components/
│   │   ├── wallet/
│   │   │   ├── FundWallet.tsx        # Coinbase Onramp widget
│   │   │   ├── WalletBalance.tsx     # Balance display
│   │   │   └── CashOut.tsx           # Transak off-ramp
│   │   ├── agent/
│   │   │   ├── ChatInterface.tsx     # Agent chat UI
│   │   │   └── TaskHistory.tsx       # Agent action log
│   │   └── ui/                       # Shared UI components
│   │
│   └── types/
│       └── index.ts                  # TypeScript types
│
├── .env.local                        # Environment variables
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 🔧 Key Dependencies

```json
{
  "dependencies": {
    // Framework
    "next": "^14.0.0",
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    
    // AI Agent
    "@coinbase/agentkit": "^0.2.0",
    "@coinbase/agentkit-langchain": "^0.2.0",
    "@langchain/core": "^0.3.0",
    "@langchain/anthropic": "^0.3.0",
    "langgraph": "^0.2.0",
    
    // x402 Payment Protocol
    "@x402/next": "^0.7.0",
    "@x402/express": "^0.7.0",
    "@x402/evm": "^0.7.0",
    "@x402/core": "^0.7.0",
    
    // Circle Infrastructure
    "@circle-fin/developer-controlled-wallets": "^2.0.0",
    "@circle-fin/user-controlled-wallets": "^2.0.0",
    "@circle-fin/bridge-kit": "^1.0.0",
    
    // Coinbase Onramp
    "@coinbase/onchainkit": "^0.30.0",
    
    // Blockchain
    "viem": "^2.0.0",
    "ethers": "^6.0.0",
    
    // Database
    "@supabase/supabase-js": "^2.0.0",
    
    // UI
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.0.0"
  }
}
```

---

## 🔐 Environment Variables

```bash
# .env.local

# Circle API
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret

# Coinbase Developer Platform
CDP_API_KEY_ID=your_cdp_key_id
CDP_API_KEY_SECRET=your_cdp_key_secret
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id

# AI Provider
ANTHROPIC_API_KEY=your_anthropic_key
# or
OPENAI_API_KEY=your_openai_key

# x402
WALLET_ADDRESS=0xYourReceivingWallet
X402_FACILITATOR_URL=https://x402.org/facilitator

# Transak (Off-ramp)
TRANSAK_API_KEY=your_transak_key

# Database
DATABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 💻 Code Examples

### 1. Agent Initialization with Payment Tools

```typescript
// src/agent/index.ts
import { AgentKit, AgentKitConfig, CdpWalletProvider } from "@coinbase/agentkit";
import { get_langchain_tools } from "@coinbase/agentkit-langchain";
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { x402PaymentTool } from "./tools/payment-tool";

export async function createPaymentAgent(userId: string) {
  // Initialize wallet provider with user's agent wallet
  const walletProvider = new CdpWalletProvider({
    apiKeyId: process.env.CDP_API_KEY_ID!,
    apiKeySecret: process.env.CDP_API_KEY_SECRET!,
    networkId: "base-sepolia", // or "arc-testnet"
  });

  // Initialize AgentKit
  const agentKit = new AgentKit({
    walletProvider,
    actionProviders: [
      // Built-in actions (transfer, swap, etc.)
    ],
  });

  // Get LangChain-compatible tools
  const agentKitTools = get_langchain_tools(agentKit);

  // Add custom x402 payment tool
  const allTools = [
    ...agentKitTools,
    x402PaymentTool(walletProvider),
  ];

  // Initialize LLM
  const llm = new ChatAnthropic({
    model: "claude-sonnet-4-20250514",
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Create ReAct agent
  const agent = createReactAgent({
    llm,
    tools: allTools,
    messageModifier: `You are an AI agent with a crypto wallet. You can:
    - Check your USDC balance
    - Pay for API access using x402 protocol
    - Transfer USDC to other addresses
    - Help users manage their payments
    
    Always confirm before making payments over $1.00.
    Your wallet address: ${await walletProvider.getAddress()}`,
  });

  return { agent, agentKit, walletProvider };
}
```

### 2. Custom x402 Payment Tool

```typescript
// src/agent/tools/payment-tool.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { wrapFetch } from "@x402/fetch";
import { CdpWalletProvider } from "@coinbase/agentkit";

export function x402PaymentTool(walletProvider: CdpWalletProvider) {
  return tool(
    async ({ url, method = "GET" }) => {
      try {
        // Wrap fetch with x402 payment handling
        const x402Fetch = wrapFetch(fetch, {
          paymentSigner: {
            // Sign payment with agent's wallet
            signPayment: async (payment) => {
              return walletProvider.signTypedData(payment);
            },
            getAddress: () => walletProvider.getAddress(),
          },
          network: "base-sepolia",
        });

        // Make the request - automatically handles 402 responses
        const response = await x402Fetch(url, { method });
        const data = await response.json();

        return JSON.stringify({
          success: true,
          data,
          paymentMade: response.headers.get("x-payment-receipt") !== null,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
    },
    {
      name: "pay_for_api",
      description: "Make a request to a pay-per-use API. Automatically handles x402 payments.",
      schema: z.object({
        url: z.string().describe("The API endpoint URL"),
        method: z.enum(["GET", "POST"]).optional().describe("HTTP method"),
      }),
    }
  );
}
```

### 3. x402 Middleware Setup (Server-Side)

```typescript
// src/middleware.ts
import { paymentProxy, x402ResourceServer } from "@x402/next";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const payTo = process.env.WALLET_ADDRESS as `0x${string}`;

const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL!,
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme()); // Base Sepolia

export const middleware = paymentProxy(
  {
    // Premium AI inference endpoint
    "/api/ai/premium": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.05",
          network: "eip155:84532",
          payTo,
        },
      ],
      description: "Premium AI analysis",
      mimeType: "application/json",
    },
    
    // Data API endpoint
    "/api/data/:type": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.01",
          network: "eip155:84532",
          payTo,
        },
      ],
      description: "Access to real-time data",
      mimeType: "application/json",
    },
  },
  server
);

export const config = {
  matcher: ["/api/ai/premium/:path*", "/api/data/:path*"],
};
```

### 4. Coinbase Onramp Component

```tsx
// src/components/wallet/FundWallet.tsx
"use client";

import { FundCard } from "@coinbase/onchainkit/fund";

interface FundWalletProps {
  walletAddress: string;
  onSuccess?: (txHash: string) => void;
}

export function FundWallet({ walletAddress, onSuccess }: FundWalletProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Add Funds</h2>
      <p className="text-gray-600 mb-4">
        Fund your agent wallet with USDC. Zero fees with Apple Pay or card.
      </p>
      
      <FundCard
        projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID!}
        defaultAsset="USDC"
        presetAmounts={[10, 25, 50, 100]}
        country="US"
        subdivision="CA"
        onSuccess={(result) => {
          console.log("Funding successful:", result);
          onSuccess?.(result.transactionHash);
        }}
        onError={(error) => {
          console.error("Funding error:", error);
        }}
      />
      
      <p className="text-sm text-gray-500 mt-4">
        Powered by Coinbase. Funds arrive in seconds.
      </p>
    </div>
  );
}
```

### 5. Circle Wallet Management

```typescript
// src/lib/circle/wallets.ts
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

export async function createAgentWallet(userId: string) {
  // Create a wallet set for the user's agent
  const walletSet = await client.createWalletSet({
    name: `agent-${userId}`,
  });

  // Create the actual wallet
  const wallet = await client.createWallets({
    walletSetId: walletSet.data?.walletSet?.id!,
    blockchains: ["ETH-SEPOLIA", "BASE-SEPOLIA"], // Add Arc when available
    count: 1,
    accountType: "SCA", // Smart Contract Account for gas sponsorship
  });

  return wallet.data?.wallets?.[0];
}

export async function getWalletBalance(walletId: string) {
  const balances = await client.getWalletTokenBalances({
    walletId,
  });
  
  return balances.data?.tokenBalances;
}

export async function transferUSDC(
  fromWalletId: string,
  toAddress: string,
  amount: string
) {
  const transfer = await client.createTransaction({
    walletId: fromWalletId,
    tokenId: "usdc", // USDC token ID
    destinationAddress: toAddress,
    amounts: [amount],
    fee: {
      type: "level",
      config: { feeLevel: "MEDIUM" },
    },
  });

  return transfer.data?.transaction;
}
```

### 6. Agent Chat API Route

```typescript
// src/app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPaymentAgent } from "@/agent";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    // Create or retrieve agent for this user
    const { agent } = await createPaymentAgent(userId);

    // Stream the response
    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      { configurable: { thread_id: userId } }
    );

    // Collect responses
    const responses = [];
    for await (const chunk of stream) {
      if (chunk.agent?.messages) {
        responses.push(chunk.agent.messages);
      }
    }

    return NextResponse.json({
      success: true,
      messages: responses.flat(),
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "Agent execution failed" },
      { status: 500 }
    );
  }
}
```

### 7. Transak Off-Ramp Integration

```typescript
// src/lib/offramp/transak.ts

export function getTransakOffRampUrl(params: {
  walletAddress: string;
  email?: string;
  amount?: number;
}) {
  const baseUrl = "https://global.transak.com";
  
  const queryParams = new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY!,
    environment: "STAGING", // or "PRODUCTION"
    cryptoCurrencyCode: "USDC",
    network: "base", // or "ethereum", "arc" when supported
    walletAddress: params.walletAddress,
    isSell: "true",
    disableWalletAddressForm: "true",
    themeColor: "0066FF",
    ...(params.email && { email: params.email }),
    ...(params.amount && { defaultFiatAmount: params.amount.toString() }),
  });

  return `${baseUrl}?${queryParams.toString()}`;
}
```

---

## 🚀 Quick Start Commands

```bash
# 1. Create project with AgentKit CLI
npm create onchain-agent@latest my-payment-agent
cd my-payment-agent

# 2. Install additional dependencies
npm install @x402/next @x402/evm @x402/core
npm install @circle-fin/developer-controlled-wallets
npm install @coinbase/onchainkit
npm install @langchain/anthropic langgraph

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Run development server
npm run dev

# 5. Access at http://localhost:3000
```

---

## 🔄 Data Flow: Agent Making a Payment

```
1. User: "Get me the weather forecast for NYC"
           │
           ▼
2. Agent receives message, reasons about tools needed
           │
           ▼
3. Agent calls: pay_for_api({ url: "https://weather-api.com/nyc" })
           │
           ▼
4. x402 client makes request → receives 402 Payment Required
           │
           ▼
5. x402 client extracts payment details:
   - price: $0.01
   - payTo: 0xWeatherAPI...
   - network: base-sepolia
           │
           ▼
6. Agent wallet signs EIP-712 payment authorization
           │
           ▼
7. x402 client retries with X-PAYMENT header
           │
           ▼
8. Facilitator verifies signature, settles USDC onchain
           │
           ▼
9. Weather API returns data
           │
           ▼
10. Agent: "The weather in NYC is sunny, 72°F. I paid $0.01 for this data."
```

---

## 📊 Recommended Development Timeline

### Week 1: Foundation
- [ ] Set up Next.js project with TypeScript
- [ ] Integrate Coinbase AgentKit
- [ ] Create basic agent with wallet
- [ ] Test on Base Sepolia testnet

### Week 2: Payments
- [ ] Add x402 middleware for paywalled endpoints
- [ ] Implement x402 client tool for agent
- [ ] Test agent making autonomous payments
- [ ] Add Coinbase Onramp for wallet funding

### Week 3: User Experience
- [ ] Build dashboard UI
- [ ] Add agent chat interface
- [ ] Implement Transak off-ramp
- [ ] Add wallet balance displays

### Week 4: Polish & Demo
- [ ] Error handling and edge cases
- [ ] Add payment history tracking
- [ ] Create demo flow for hackathon
- [ ] Deploy to Vercel

---

## 🎯 Hackathon Demo Flow

1. **User lands on app** → Sees "Fund Your AI Agent"
2. **User clicks Add Funds** → Coinbase Onramp opens, pays with Apple Pay
3. **USDC arrives** → Balance shows "$50.00 available"
4. **User asks agent** → "Research the top 5 AI startups and summarize"
5. **Agent autonomously:**
   - Calls paywalled research API (pays $0.10)
   - Calls paywalled data API (pays $0.05)
   - Returns comprehensive summary
6. **User sees:** Results + "Agent spent $0.15 on 2 API calls"
7. **User clicks Cash Out** → Transak off-ramp to bank

---

## 📚 Resources

| Resource | URL |
|----------|-----|
| Coinbase AgentKit | https://docs.cdp.coinbase.com/agent-kit |
| x402 Protocol | https://x402.org |
| Circle Wallets | https://developers.circle.com/w3s |
| Coinbase Onramp | https://docs.cdp.coinbase.com/onramp |
| LangGraph | https://langchain-ai.github.io/langgraph |
| Arc Testnet | https://docs.arc.network |

---

## ✅ Why This Stack?

| Requirement | Solution | Benefit |
|-------------|----------|---------|
| AI agents that pay | AgentKit + x402 | Native payment tools |
| Zero-fee onramp | Coinbase Onramp | Best UX, no fees for USDC |
| No seed phrases | Circle Wallets | PIN-based, MPC security |
| Micropayments | x402 Protocol | $0.001 minimum |
| Global off-ramp | Transak | Arc partner, 64 countries |
| Fast settlement | Base/Arc | Sub-second finality |
| Type safety | TypeScript | Required by SDKs |
| Quick deployment | Next.js + Vercel | Edge functions, easy |

This stack gives you everything needed for a production-ready AI agent payment system that's achievable in a hackathon timeframe.
