# Marketing Agent - Development Roadmap

## Overview

The Marketing Agent module enables B2B organizations to deploy autonomous AI agents that manage paid advertising campaigns. Users fund agents, set strategy/direction, and agents autonomously optimize campaigns while reporting results.

## Current State (Mock)

### Implemented Features
- Single campaign dashboard with performance metrics
- Budget tracking (total + daily)
- Strategy configuration modal
- Agent activity log showing autonomous actions
- Agent insights and recommendations
- Add funds functionality

### Mock Data Demonstrates
- Google Ads campaign management
- Bid optimization, keyword management, ad variant testing
- ROAS tracking and cost analysis

---

## Phase 1: Multi-Agent & A/B Experiment Support

### 1.1 Multi-Agent Architecture

**Goal:** Support multiple marketing agents, each managing a campaign or channel.

```
Organization
├── Marketing Agents
│   ├── Agent: Q1 Product Launch (Google Ads)
│   ├── Agent: Brand Awareness (Facebook)
│   ├── Agent: LinkedIn B2B Outreach
│   └── Agent: Retargeting Pool
└── Experiments
    ├── Experiment: Landing Page Test
    │   ├── Variant A: Agent with LP-v1
    │   └── Variant B: Agent with LP-v2
    └── Experiment: Audience Test
        ├── Control: Broad targeting
        └── Test: Lookalike audiences
```

**Database Schema:**

```sql
-- Marketing agents
CREATE TABLE marketing_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL, -- google_ads, facebook, linkedin, tiktok, twitter
    status TEXT DEFAULT 'draft', -- draft, active, paused, completed

    -- Budget
    total_budget DECIMAL(20, 6) NOT NULL,
    daily_budget DECIMAL(20, 6),
    spent DECIMAL(20, 6) DEFAULT 0,

    -- Strategy (JSON for flexibility)
    strategy JSONB NOT NULL DEFAULT '{}',

    -- External integration
    external_account_id TEXT, -- Google Ads account ID, etc.
    external_campaign_id TEXT,

    -- Experiment grouping
    experiment_id UUID REFERENCES marketing_experiments(id),
    experiment_variant TEXT, -- 'control', 'variant_a', 'variant_b', etc.

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Experiments
CREATE TABLE marketing_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    hypothesis TEXT,
    status TEXT DEFAULT 'draft', -- draft, running, completed, cancelled

    -- Experiment config
    metric_primary TEXT NOT NULL, -- conversions, roas, ctr, cpc
    metric_secondary TEXT[],
    confidence_threshold DECIMAL(5, 2) DEFAULT 95.00, -- Statistical significance

    -- Duration
    start_date DATE,
    end_date DATE,
    min_sample_size INTEGER,

    -- Results
    winner_variant TEXT,
    lift_percentage DECIMAL(10, 2),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance snapshots (hourly/daily)
CREATE TABLE marketing_agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES marketing_agents(id),
    snapshot_time TIMESTAMPTZ NOT NULL,
    period TEXT NOT NULL, -- hourly, daily

    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(20, 6) DEFAULT 0,
    revenue DECIMAL(20, 6) DEFAULT 0,

    -- Calculated
    ctr DECIMAL(10, 4),
    cpc DECIMAL(20, 6),
    conversion_rate DECIMAL(10, 4),
    cost_per_conversion DECIMAL(20, 6),
    roas DECIMAL(10, 2),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent activity log
CREATE TABLE marketing_agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES marketing_agents(id),
    action_type TEXT NOT NULL, -- bid_change, keyword_add, keyword_pause, ad_create, ad_pause, budget_shift
    action_description TEXT NOT NULL,
    reason TEXT,

    -- Change details
    before_value JSONB,
    after_value JSONB,

    -- Impact tracking
    impact_metric TEXT,
    impact_value DECIMAL(20, 6),

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 UI Components

**Agent List View:**
- Grid/list of all marketing agents
- Quick stats per agent (spend, ROAS, status)
- Filter by channel, status, experiment
- Bulk actions (pause all, adjust budgets)

**Agent Detail View:**
- Full dashboard (current implementation)
- Performance charts over time
- Activity log with filtering
- Strategy editor

**Experiment View:**
- Side-by-side comparison of variants
- Statistical significance calculator
- Winner declaration with confidence interval
- Rollout controls

### 1.3 API Routes

```
/api/marketing/agents
  GET    - List all agents (with filters)
  POST   - Create new agent

/api/marketing/agents/[id]
  GET    - Get agent details
  PATCH  - Update agent (strategy, budget, status)
  DELETE - Archive agent

/api/marketing/agents/[id]/metrics
  GET    - Get performance metrics (with date range)

/api/marketing/agents/[id]/actions
  GET    - Get activity log

/api/marketing/experiments
  GET    - List experiments
  POST   - Create experiment

/api/marketing/experiments/[id]
  GET    - Get experiment with variants
  PATCH  - Update experiment
  POST   /declare-winner - Declare winner and rollout
```

---

## Phase 2: Channel Integrations

### 2.1 Supported Channels

| Channel | Priority | API | Key Features |
|---------|----------|-----|--------------|
| Google Ads | P0 | Google Ads API v16 | Search, Display, YouTube, Shopping |
| Meta (Facebook/Instagram) | P1 | Marketing API v19 | Feed, Stories, Reels, Messenger |
| LinkedIn | P1 | Marketing API | Sponsored Content, InMail, Lead Gen |
| TikTok | P2 | Marketing API | In-Feed, TopView, Branded Effects |
| Twitter/X | P2 | Ads API | Promoted Tweets, Followers, Trends |
| Microsoft Ads | P3 | Bing Ads API | Search, Audience Network |

### 2.2 Google Ads Integration

**OAuth Flow:**
```
1. User clicks "Connect Google Ads"
2. Redirect to Google OAuth consent
3. User grants access to Ads API
4. Store refresh token (encrypted)
5. Agent can now manage campaigns
```

**Required Scopes:**
- `https://www.googleapis.com/auth/adwords`

**Key API Operations:**

```typescript
// Campaign management
interface GoogleAdsAgent {
  // Read operations
  getCampaigns(): Promise<Campaign[]>;
  getAdGroups(campaignId: string): Promise<AdGroup[]>;
  getKeywords(adGroupId: string): Promise<Keyword[]>;
  getAds(adGroupId: string): Promise<Ad[]>;
  getMetrics(dateRange: DateRange): Promise<Metrics>;

  // Write operations
  updateBid(keywordId: string, newBid: number): Promise<void>;
  pauseKeyword(keywordId: string): Promise<void>;
  enableKeyword(keywordId: string): Promise<void>;
  addNegativeKeyword(campaignId: string, keyword: string): Promise<void>;
  createAd(adGroupId: string, ad: AdCreative): Promise<string>;
  pauseAd(adId: string): Promise<void>;
  updateBudget(campaignId: string, dailyBudget: number): Promise<void>;
}
```

**Agent Optimization Logic:**

```typescript
// Pseudo-code for optimization loop
async function optimizeAgent(agent: MarketingAgent) {
  const strategy = agent.strategy;
  const metrics = await getRecentMetrics(agent, '7d');
  const keywords = await getKeywordPerformance(agent);

  for (const keyword of keywords) {
    // Check if keyword is underperforming
    if (keyword.conversions === 0 && keyword.clicks > 50) {
      await pauseKeyword(keyword.id);
      await logAction(agent, 'keyword_pause', {
        keyword: keyword.text,
        reason: `No conversions after ${keyword.clicks} clicks`,
      });
      continue;
    }

    // Check if keyword is exceeding CPA target
    if (keyword.costPerConversion > strategy.targetCpa * 1.5) {
      const newBid = keyword.currentBid * 0.85; // Reduce bid 15%
      await updateBid(keyword.id, newBid);
      await logAction(agent, 'bid_decrease', {
        keyword: keyword.text,
        reason: `CPA ${keyword.costPerConversion} exceeds target ${strategy.targetCpa}`,
        change: { from: keyword.currentBid, to: newBid },
      });
      continue;
    }

    // Check if keyword is high performer
    if (keyword.costPerConversion < strategy.targetCpa * 0.7 && keyword.impressionShare < 0.8) {
      const newBid = keyword.currentBid * 1.15; // Increase bid 15%
      await updateBid(keyword.id, newBid);
      await logAction(agent, 'bid_increase', {
        keyword: keyword.text,
        reason: `Strong performer (CPA: ${keyword.costPerConversion}), increasing impression share`,
        change: { from: keyword.currentBid, to: newBid },
      });
    }
  }

  // Check for negative keyword opportunities
  const searchTerms = await getSearchTermReport(agent);
  for (const term of searchTerms) {
    if (term.conversions === 0 && term.cost > 20) {
      await addNegativeKeyword(agent.campaignId, term.text);
      await logAction(agent, 'negative_keyword', {
        keyword: term.text,
        reason: `Wasted ${term.cost} with no conversions`,
      });
    }
  }
}
```

### 2.3 Meta Ads Integration

**OAuth Flow:**
- Facebook Login with `ads_management` permission
- Access to Ad Account via Business Manager

**Key Operations:**
- Campaign/Ad Set/Ad CRUD
- Audience management
- Creative asset upload
- Conversion tracking

### 2.4 Unified Agent Interface

```typescript
// Abstract interface all channel agents implement
interface MarketingChannelAgent {
  // Connection
  connect(credentials: ChannelCredentials): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Campaign structure
  getCampaigns(): Promise<Campaign[]>;
  getCampaignMetrics(campaignId: string, dateRange: DateRange): Promise<Metrics>;

  // Optimization actions
  adjustBid(targetId: string, adjustment: BidAdjustment): Promise<void>;
  pauseTarget(targetId: string): Promise<void>;
  enableTarget(targetId: string): Promise<void>;

  // Budget
  updateDailyBudget(campaignId: string, amount: number): Promise<void>;

  // Creative
  getCreatives(campaignId: string): Promise<Creative[]>;
  createCreative(creative: CreativeInput): Promise<string>;

  // Reporting
  getReport(reportType: ReportType, dateRange: DateRange): Promise<Report>;
}
```

---

## Phase 3: Agent Intelligence

### 3.1 Optimization Strategies

**Built-in Strategies:**

| Strategy | Description | Best For |
|----------|-------------|----------|
| Maximize Conversions | Aggressive bidding on converting keywords | Lead gen, e-commerce |
| Target CPA | Maintain cost-per-acquisition target | Budget-conscious campaigns |
| Target ROAS | Optimize for return on ad spend | E-commerce with revenue tracking |
| Maximize Clicks | Drive traffic volume | Brand awareness, content |
| Manual Control | User sets all bids, agent monitors only | Expert users |

**Custom Strategy Builder:**

```typescript
interface CustomStrategy {
  name: string;
  rules: OptimizationRule[];
  constraints: StrategyConstraints;
}

interface OptimizationRule {
  condition: {
    metric: 'ctr' | 'cpc' | 'cpa' | 'roas' | 'impressionShare';
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | [number, number];
    period: '1d' | '7d' | '30d';
  };
  action: {
    type: 'increase_bid' | 'decrease_bid' | 'pause' | 'enable' | 'alert';
    value?: number; // percentage for bid changes
  };
}

// Example: Aggressive growth strategy
const aggressiveStrategy: CustomStrategy = {
  name: 'Aggressive Growth',
  rules: [
    {
      condition: { metric: 'cpa', operator: 'lt', value: 20, period: '7d' },
      action: { type: 'increase_bid', value: 20 },
    },
    {
      condition: { metric: 'cpa', operator: 'gt', value: 50, period: '7d' },
      action: { type: 'decrease_bid', value: 30 },
    },
    {
      condition: { metric: 'ctr', operator: 'lt', value: 1, period: '7d' },
      action: { type: 'pause' },
    },
  ],
  constraints: {
    maxBidChange: 25, // Max 25% change per day
    minImpressions: 100, // Don't act on low data
    budgetBuffer: 10, // Keep 10% budget reserve
  },
};
```

### 3.2 AI-Powered Insights

**Anomaly Detection:**
- Sudden CPC spikes
- Conversion rate drops
- Budget pacing issues
- Competitor activity indicators

**Predictive Analytics:**
- Budget exhaustion forecasting
- Conversion probability scoring
- Optimal bid suggestions
- Audience expansion recommendations

**Natural Language Reporting:**

```typescript
// Agent generates human-readable insights
interface AgentInsight {
  type: 'success' | 'warning' | 'opportunity' | 'alert';
  title: string;
  summary: string;
  details: string;
  suggestedAction?: {
    description: string;
    autoApply: boolean;
  };
  confidence: number; // 0-100
}

// Example output
const insight: AgentInsight = {
  type: 'opportunity',
  title: 'Audience Expansion Opportunity',
  summary: 'Your ads perform 40% better with users aged 35-44',
  details: 'Analysis of the last 30 days shows users aged 35-44 have a conversion rate of 8.2% compared to 5.8% overall. Consider increasing bid adjustments for this demographic.',
  suggestedAction: {
    description: 'Increase bid adjustment for 35-44 age group by 25%',
    autoApply: false,
  },
  confidence: 87,
};
```

### 3.3 Cross-Channel Intelligence

**Attribution Insights:**
- Cross-channel conversion paths
- Assisted conversions by channel
- Optimal channel mix recommendations

**Budget Allocation:**
- Automatic budget shifting between channels
- Performance-based reallocation
- Diminishing returns detection

---

## Phase 4: Billing & Economics

### 4.1 Agent Funding Flow

```
User Treasury/Credits
        │
        ▼
┌───────────────────┐
│  Agent Budget     │  ← User allocates funds
│  (Escrow)         │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Ad Platform      │  ← Agent spends on ads
│  (Google, Meta)   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Performance      │  ← Track ROAS
│  Revenue          │
└───────────────────┘
```

### 4.2 Platform Fee Structure

| Tier | Monthly Spend | Platform Fee |
|------|---------------|--------------|
| Starter | $0 - $1,000 | 10% |
| Growth | $1,000 - $10,000 | 7% |
| Scale | $10,000 - $50,000 | 5% |
| Enterprise | $50,000+ | Custom |

### 4.3 Budget Controls

```typescript
interface AgentBudgetConfig {
  totalBudget: number;
  dailyBudget: number;

  // Safety controls
  maxDailySpend: number; // Hard cap
  alertThreshold: number; // % of budget to trigger alert
  pauseOnBudgetExhaust: boolean;

  // Auto-refill
  autoRefill: {
    enabled: boolean;
    threshold: number; // Refill when balance below this
    amount: number;
    maxRefillsPerMonth: number;
    source: 'treasury' | 'card';
  };

  // Pacing
  pacingStrategy: 'standard' | 'accelerated' | 'front_loaded';
}
```

---

## Phase 5: Enterprise Features

### 5.1 Team Collaboration

- Role-based access (Admin, Manager, Analyst, Viewer)
- Agent ownership and sharing
- Approval workflows for budget changes
- Audit logging

### 5.2 White-Label / Agency Mode

- Multi-client management
- Client-specific branding
- Aggregated reporting
- Margin management

### 5.3 API Access

```typescript
// External API for programmatic control
POST /api/v1/marketing/agents
GET  /api/v1/marketing/agents/{id}/metrics
POST /api/v1/marketing/agents/{id}/strategy
POST /api/v1/marketing/agents/{id}/budget
GET  /api/v1/marketing/experiments/{id}/results
```

### 5.4 Integrations

- CRM sync (Salesforce, HubSpot) for conversion tracking
- Analytics platforms (GA4, Mixpanel) for attribution
- Slack/Teams notifications
- Zapier/Make webhooks

---

## Implementation Priority

| Phase | Timeline | Key Deliverables |
|-------|----------|------------------|
| **1.0** | MVP | Multi-agent UI, A/B experiments, mock data |
| **1.1** | +2 weeks | Database schema, API routes, persistence |
| **2.0** | +4 weeks | Google Ads integration (OAuth, read-only) |
| **2.1** | +2 weeks | Google Ads write operations (bidding, keywords) |
| **2.2** | +3 weeks | Meta Ads integration |
| **3.0** | +4 weeks | Optimization engine, scheduled jobs |
| **3.1** | +2 weeks | AI insights, anomaly detection |
| **4.0** | +2 weeks | Billing integration, budget from treasury |
| **5.0** | +4 weeks | Enterprise features, API access |

---

## Success Metrics

### Agent Performance
- Average ROAS improvement vs manual management
- Cost reduction percentage
- Time saved per campaign

### Platform Metrics
- Active agents deployed
- Total ad spend managed
- Platform fee revenue
- User retention

### Experiment Metrics
- Experiments run per organization
- Statistical significance achievement rate
- Lift percentage from winning variants

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js Dashboard (Multi-agent UI, Experiment views)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  /api/marketing/*  (Next.js API routes)                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Supabase     │ │   Agent Worker  │ │ Channel Adapters│
│   (Database)    │ │  (Optimization) │ │ (Google, Meta)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ad Platforms                              │
│  Google Ads API  │  Meta Marketing API  │  LinkedIn API     │
└─────────────────────────────────────────────────────────────┘
```

### Worker Architecture

```typescript
// Agent optimization worker (runs every hour)
async function agentWorker() {
  const activeAgents = await getActiveAgents();

  for (const agent of activeAgents) {
    try {
      // 1. Fetch latest metrics from ad platform
      const metrics = await fetchMetrics(agent);
      await storeMetrics(agent.id, metrics);

      // 2. Run optimization logic
      const actions = await runOptimization(agent, metrics);

      // 3. Execute actions (if auto-apply enabled)
      for (const action of actions) {
        if (action.autoApply) {
          await executeAction(agent, action);
        }
        await logAction(agent.id, action);
      }

      // 4. Generate insights
      const insights = await generateInsights(agent, metrics);
      await storeInsights(agent.id, insights);

      // 5. Check budget and alerts
      await checkBudgetStatus(agent);

    } catch (error) {
      await logError(agent.id, error);
      await notifyOnError(agent, error);
    }
  }
}
```

---

## Appendix: Channel-Specific Features

### Google Ads
- Search campaigns with keyword management
- Display campaigns with placement targeting
- Shopping campaigns with product feed
- YouTube campaigns with video ads
- Performance Max campaigns

### Meta Ads
- Advantage+ campaigns (AI-optimized)
- Catalog sales with dynamic product ads
- Lead generation with instant forms
- Messenger/WhatsApp ads
- Instagram Shopping

### LinkedIn
- Sponsored Content (single image, carousel, video)
- Message Ads (InMail)
- Lead Gen Forms
- Conversation Ads
- Event Ads

### TikTok
- In-Feed Ads
- TopView
- Branded Hashtag Challenge
- Branded Effects
- Spark Ads (boosted organic)
