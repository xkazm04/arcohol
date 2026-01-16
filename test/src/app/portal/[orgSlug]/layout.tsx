import { PortalAuthProvider } from '@/features/portal/context/PortalAuthContext';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function PortalLayoutRoute({ children, params }: LayoutProps) {
  const { orgSlug } = await params;

  return (
    <PortalAuthProvider>
      <PortalLayout organizationSlug={orgSlug}>{children}</PortalLayout>
    </PortalAuthProvider>
  );
}
