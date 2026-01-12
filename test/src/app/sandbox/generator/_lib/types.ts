export const categories = ['setup', 'payments', 'subscriptions', 'webhooks'] as const;

export type Category = (typeof categories)[number];

export interface Template {
  id: string;
  name: string;
  desc: string;
  useCase: string;
  category: Category;
  code: string;
  icon: string;
}
