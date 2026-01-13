  | Use Case                     | Description                                         | Package Support                   | Dashboard Support        | Integration Needed        |
  |------------------------------|-----------------------------------------------------|-----------------------------------|--------------------------|---------------------------|
  | Per-Request API Monetization | Charge USDC/USDT per API call (e.g., $0.01/request) | withX402, x402Middleware          | Endpoint listing UI      | Connect real endpoints    |
  | Dynamic Pricing              | Price based on request payload (tokens, data size)  | dynamicPrice() helper             | Not shown                | Add pricing config UI     |
  | Multi-Chain Payments         | Accept from Base, Ethereum, Arbitrum, Polygon, etc. | Full support (6 chains)           | Not shown                | Add chain selector        |
  | Budget-Controlled AI Agents  | Agents with daily/per-request spending limits       | X402Client with budget            | Agents module exists     | Link agent wallets        |
  | Auto-Approve Micropayments   | Skip confirmation for small payments                | autoApprove config                | Not shown                | Add threshold config      |
  | Premium API Tiers            | Skip payment for premium subscribers                | skipIf predicate                  | Subscriptions module     | Check subscription status |
  | API Key + Payment Auth       | Combine API key validation with payment             | Middleware composable             | API Keys module          | Merge auth flows          |
  | Real-Time Revenue Tracking   | Track payments per endpoint                         | onPayment callback                | Revenue chart in sandbox | Store to database         |
  | Payment Receipts             | Record tx hash, payer, amount                       | X402PaymentInfo type              | Invoices module          | Auto-create invoice       |
  | Client-Side Payment UI       | React modal for payment approval                    | useFetchWithPayment, PaymentModal | Not integrated           | Add to customer portal    |
