export type SectionId =
  | 'getting-started'
  | 'checkout'
  | 'invoice'
  | 'plans'
  | 'balance'
  | 'transaction-history'
  | 'fiat-on-ramp';

export type CodeTab = 'basic' | 'full' | 'hook';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface SectionInfo {
  id: SectionId;
  label: string;
  description: string;
  useCase: string;
}

export interface DemoProps {
  variant: CodeTab;
}
