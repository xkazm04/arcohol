'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type OnboardingStep = 'organization' | 'settlement' | 'preferences' | 'complete';

interface OrganizationData {
  name: string;
  industry: string;
  website: string;
  size: string;
}

interface SettlementData {
  address: string;
  chain: string;
  instantSettlement: boolean;
}

interface PreferencesData {
  autoYield: boolean;
  yieldThreshold: number;
  notifications: {
    invoices: boolean;
    disputes: boolean;
    lowBalance: boolean;
  };
}

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('organization');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [organization, setOrganization] = useState<OrganizationData>({
    name: '',
    industry: '',
    website: '',
    size: '',
  });

  const [settlement, setSettlement] = useState<SettlementData>({
    address: '',
    chain: 'arc',
    instantSettlement: true,
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    autoYield: true,
    yieldThreshold: 10000,
    notifications: {
      invoices: true,
      disputes: true,
      lowBalance: true,
    },
  });

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Create organization with user as owner
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          owner_id: user.id,
          name: organization.name,
          slug: organization.name.toLowerCase().replace(/\s+/g, '-'),
          industry: organization.industry,
          website: organization.website,
          size: organization.size,
          settlement_address: settlement.address,
          settlement_chain: settlement.chain,
          settings: {
            instant_settlement: settlement.instantSettlement,
            auto_yield: preferences.autoYield,
            yield_threshold: preferences.yieldThreshold,
            notifications: preferences.notifications,
          },
        })
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        setIsLoading(false);
        return;
      }

      // Update user profile
      await supabase
        .from('org_profiles')
        .update({
          current_organization_id: org.id,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      setStep('complete');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Onboarding error:', error);
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 'organization', label: 'Organization', number: 1 },
    { id: 'settlement', label: 'Settlement', number: 2 },
    { id: 'preferences', label: 'Preferences', number: 3 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        {step !== 'complete' && (
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  i < currentStepIndex ? 'bg-cyan-600 text-white' :
                  i === currentStepIndex ? 'bg-cyan-600 text-white' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {i < currentStepIndex ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span className={`ml-2 text-sm ${i === currentStepIndex ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${i < currentStepIndex ? 'bg-cyan-600' : 'bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
          {/* Step 1: Organization */}
          {step === 'organization' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Set up your organization</h1>
                <p className="text-slate-400">Tell us about your business</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Organization Name</label>
                  <input
                    type="text"
                    value={organization.name}
                    onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Industry</label>
                  <select
                    value={organization.industry}
                    onChange={(e) => setOrganization({ ...organization, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select an industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={organization.website}
                    onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="https://acme.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Company Size</label>
                  <select
                    value={organization.size}
                    onChange={(e) => setOrganization({ ...organization, size: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep('settlement')}
                disabled={!organization.name || !organization.industry}
                className="w-full mt-6 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </>
          )}

          {/* Step 2: Settlement */}
          {step === 'settlement' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Configure settlement</h1>
                <p className="text-slate-400">Where should we send your funds?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Settlement Address</label>
                  <input
                    type="text"
                    value={settlement.address}
                    onChange={(e) => setSettlement({ ...settlement, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-slate-500 mt-1">Your EVM-compatible wallet address</p>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Preferred Chain</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'arc', name: 'Arc', desc: 'Zero gas fees, native USDC' },
                      { id: 'base', name: 'Base', desc: 'Low fees, Coinbase ecosystem' },
                      { id: 'ethereum', name: 'Ethereum', desc: 'Most liquid, highest fees' },
                      { id: 'polygon', name: 'Polygon', desc: 'Low fees, fast finality' },
                    ].map((chain) => (
                      <button
                        key={chain.id}
                        onClick={() => setSettlement({ ...settlement, chain: chain.id })}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          settlement.chain === chain.id
                            ? 'bg-cyan-500/10 border-cyan-500/50'
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <div className="text-sm font-medium text-white">{chain.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{chain.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-white">Instant Settlement</div>
                    <div className="text-xs text-slate-500">Receive funds immediately after payment</div>
                  </div>
                  <button
                    onClick={() => setSettlement({ ...settlement, instantSettlement: !settlement.instantSettlement })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settlement.instantSettlement ? 'bg-cyan-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settlement.instantSettlement ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('organization')}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('preferences')}
                  disabled={!settlement.address}
                  className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Step 3: Preferences */}
          {step === 'preferences' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Set your preferences</h1>
                <p className="text-slate-400">Customize your experience</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-white">Auto Yield Optimization</div>
                    <div className="text-xs text-slate-500">Automatically move idle funds to earn 5.2% APY</div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, autoYield: !preferences.autoYield })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences.autoYield ? 'bg-cyan-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.autoYield ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                {preferences.autoYield && (
                  <div className="p-4 bg-slate-800/30 rounded-xl">
                    <label className="block text-xs text-slate-400 mb-2">Yield Threshold</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={preferences.yieldThreshold}
                        onChange={(e) => setPreferences({ ...preferences, yieldThreshold: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-sm font-mono text-white w-24 text-right">
                        ${preferences.yieldThreshold.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Move funds to yield when balance exceeds this amount</p>
                  </div>
                )}

                <div className="p-4 bg-slate-800/50 rounded-xl space-y-3">
                  <div className="text-sm font-medium text-white mb-3">Notifications</div>
                  {[
                    { key: 'invoices', label: 'Invoice updates', desc: 'When invoices are paid or overdue' },
                    { key: 'disputes', label: 'Dispute alerts', desc: 'When disputes are filed or resolved' },
                    { key: 'lowBalance', label: 'Low balance warnings', desc: 'When credit balance is running low' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-300">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            [item.key]: !preferences.notifications[item.key as keyof typeof preferences.notifications],
                          },
                        })}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                          preferences.notifications[item.key as keyof typeof preferences.notifications] ? 'bg-cyan-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.notifications[item.key as keyof typeof preferences.notifications] ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('settlement')}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Complete Setup'}
                </button>
              </div>
            </>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h1>
              <p className="text-slate-400 mb-4">
                Your organization has been created. Redirecting to your dashboard...
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
