import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/PageBits";
import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile, useWorkspaceSettings, useUpdateSettings } from "@/features/settings/hooks/useSettings";
import { useAPIKeys, useGenerateAPIKey, useRevokeAPIKey } from "@/features/settings/hooks/useAPIKeys";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Github, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile();
  
  const { data: workspaceData, refetch: refetchWorkspace } = useWorkspaceSettings();
  const { mutate: updateSettings } = useUpdateSettings();

  const { data: apiKeys = [] } = useAPIKeys();
  const { mutate: generateKey, isPending: generatingKey } = useGenerateAPIKey();
  const { mutate: revokeKey } = useRevokeAPIKey();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null);

  const [githubDisconnecting, setGithubDisconnecting] = useState(false);

  const API_URL = 'http://localhost:5000/api/v1';

  // On mount, check if GitHub just completed OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get('github');
    const login = params.get('login');
    if (githubStatus === 'connected') {
      toast.success(`GitHub connected! Logged in as @${login}`);
      refetchWorkspace();
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (githubStatus === 'denied') {
      toast.error('GitHub connection was denied.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (githubStatus === 'error') {
      const reason = params.get('reason') || 'unknown';
      toast.error(`GitHub connection failed: ${reason.replace(/_/g, ' ')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const handleProfileSave = () => {
    updateProfile({ name, email }, {
      onSuccess: () => toast.success("Profile saved successfully"),
      onError: (err: any) => toast.error(err.response?.data?.error || "Failed to save profile")
    });
  };

  const aiConfig = workspaceData?.aiConfig || {};
  const settings = workspaceData?.settings || {};

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({ aiConfig: { [key]: value } }, {
      onSuccess: () => toast.success("AI preferences updated"),
      onError: (err: any) => {
        console.error("Toggle Error:", err, err.response?.data);
        toast.error(`Error: ${err.response?.data?.error || err.message || "Failed"}`);
      }
    });
  };

  const handleModelSelect = (model: string) => {
    updateSettings({ aiConfig: { modelSelection: model } }, {
      onSuccess: () => toast.success(`Model routed to ${model}`),
      onError: (err: any) => toast.error(err.response?.data?.error || "Failed to switch model")
    });
  };

  const handleConnectGitHub = () => {
    // Navigate to backend OAuth initiation endpoint — full page redirect so GitHub can redirect back
    window.location.href = `${API_URL}/github/connect`;
  };

  const handleDisconnectGitHub = async () => {
    setGithubDisconnecting(true);
    try {
      const res = await fetch(`${API_URL}/github/disconnect`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('GitHub disconnected successfully');
      refetchWorkspace();
    } catch {
      toast.error('Failed to disconnect GitHub');
    } finally {
      setGithubDisconnecting(false);
    }
  };

  const handleConnectSlack = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ integrations: { slack: { connected: true, webhookUrl: slackWebhookUrl } } }, {
      onSuccess: () => {
        toast.success("Slack webhook connected");
        setIsSlackModalOpen(false);
        setSlackWebhookUrl("");
      },
      onError: (err: any) => toast.error(err.response?.data?.error || "Failed to connect Slack")
    });
  };

  const handleDisconnectSlack = () => {
    updateSettings({ integrations: { slack: { connected: false, webhookUrl: "" } } }, {
      onSuccess: () => toast.success("Slack disconnected"),
      onError: (err: any) => toast.error(err.response?.data?.error || "Failed to disconnect Slack")
    });
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    generateKey({ name: newKeyName }, {
      onSuccess: (res) => {
        setGeneratedKeyResult(res.rawKey);
        toast.success("API key generated");
      },
      onError: (err: any) => toast.error(err.response?.data?.error || "Failed to generate key")
    });
  };

  const handleRevokeKey = (id: string) => {
    revokeKey(id, {
      onSuccess: () => toast.success("API key revoked"),
      onError: (err: any) => toast.error(err.response?.data?.error || "Failed to revoke key")
    });
  };

  const closeKeyModal = () => {
    setIsKeyModalOpen(false);
    setGeneratedKeyResult(null);
    setNewKeyName("");
  };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader title="Settings" sub="Profile, AI preferences, integrations, and more." />

      <div className="space-y-5">
        <Panel title="Profile">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-semibold text-primary-foreground glow shrink-0">
              {profile?.avatar ? <img src={profile.avatar} alt="avatar" className="h-full w-full rounded-full object-cover" /> : (profile?.name ? profile.name[0] : 'U')}
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-3 w-full">
              <Field label="Name" value={name} onChange={(e) => setName(e)} />
              <Field label="Email" value={email} onChange={(e) => setEmail(e)} />
            </div>
            <button 
              onClick={handleProfileSave}
              disabled={updatingProfile || (name === profile?.name && email === profile?.email)}
              className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium rounded-md bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer transition-all disabled:cursor-not-allowed"
            >
              {updatingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </Panel>

        <Panel title="AI preferences">
          <div className="grid sm:grid-cols-2 gap-4">
            <Toggle label="Aggressive refactor suggestions" on={aiConfig.refactorAggression === 'high'} onChange={(v) => updateSettings({ aiConfig: { refactorAggression: v ? 'high' : 'medium' } })} />
            <Toggle label="Block PRs on critical security" on={!!aiConfig.blockOnCriticalSecurity} onChange={(v) => handleToggle('blockOnCriticalSecurity', v)} />
            <Toggle label="Inline reasoning streaming" on={!!aiConfig.inlineReasoning} onChange={(v) => handleToggle('inlineReasoning', v)} />
            <Toggle label="Notify on architecture drift" on={!!aiConfig.notifyArchitectureDrift} onChange={(v) => handleToggle('notifyArchitectureDrift', v)} />
          </div>
        </Panel>


        <Panel title="Integrations">
          <ul className="divide-y divide-border/60">
            <li className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#24292e] flex items-center justify-center shrink-0">
                  <Github className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">GitHub</p>
                    {workspaceData?.integrations?.github?.connected ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-surface px-1.5 py-0.5 rounded">
                        <XCircle className="h-3 w-3" /> Not connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {workspaceData?.integrations?.github?.connected
                      ? "Repository access granted. PR webhooks are active."
                      : "Connect to enable automatic PR reviews and repository scanning."}
                  </p>
                </div>
              </div>
              {workspaceData?.integrations?.github?.connected ? (
                <button
                  onClick={handleDisconnectGitHub}
                  disabled={githubDisconnecting}
                  className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {githubDisconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              ) : (
                <button
                  onClick={handleConnectGitHub}
                  className="text-xs px-3 py-1.5 rounded-md bg-[#24292e] text-white hover:bg-[#2f3741] cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Github className="h-3.5 w-3.5" /> Connect GitHub
                </button>
              )}
            </li>
            <li className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">Slack</p>
                <p className="text-xs text-muted-foreground">{workspaceData?.integrations?.slack?.connected ? "Connected (Webhook)" : "Not connected"}</p>
              </div>
              {workspaceData?.integrations?.slack?.connected ? (
                <button onClick={handleDisconnectSlack} className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 cursor-pointer transition-colors">
                  Disconnect
                </button>
              ) : (
                <button onClick={() => setIsSlackModalOpen(true)} className="text-xs px-3 py-1.5 rounded-md bg-gradient-primary text-primary-foreground glow hover:opacity-90 cursor-pointer transition-colors">
                  Connect
                </button>
              )}
            </li>
          </ul>
        </Panel>

        <Panel title="API keys">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Manage keys for CI/CD and external API access.</p>
            <button onClick={() => setIsKeyModalOpen(true)} className="text-xs px-3 py-1.5 rounded-md bg-surface border border-border hover:bg-surface/80 cursor-pointer transition-colors">Generate New Key</button>
          </div>
          <div className="space-y-3">
            {apiKeys.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No active API keys.</p>
            ) : (
              apiKeys.map((k: any) => (
                <div key={k._id} className="font-mono text-xs rounded-lg bg-surface border border-border p-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold">{k.name}</span>
                    <span className="text-muted-foreground">{k.keyPrefix}••••••••••••••••</span>
                  </div>
                  <button onClick={() => handleRevokeKey(k._id)} className="text-red-500 hover:text-red-400 hover:underline cursor-pointer transition-colors">Revoke</button>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Slack Connect Modal */}
      {isSlackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1e1e1e] border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold mb-2">Connect Slack Webhook</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter your Slack Incoming Webhook URL to receive live notifications.</p>
            <form onSubmit={handleConnectSlack} className="space-y-4">
              <Field label="Webhook URL" value={slackWebhookUrl} onChange={setSlackWebhookUrl} />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsSlackModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-surface border border-transparent cursor-pointer transition-colors">Cancel</button>
                <button type="submit" disabled={!slackWebhookUrl} className="px-4 py-2 text-sm font-medium rounded-md bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors">Save Integration</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1e1e1e] border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold mb-2">Generate API Key</h2>
            
            {generatedKeyResult ? (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-3 rounded text-sm">
                  <strong>Important:</strong> Copy your key now. It will never be shown again!
                </div>
                <div className="font-mono text-sm bg-black border border-border p-3 rounded break-all select-all">
                  {generatedKeyResult}
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={closeKeyModal} className="px-4 py-2 text-sm font-medium rounded-md bg-gradient-primary text-primary-foreground hover:opacity-90 cursor-pointer transition-colors">Done</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Create a new key to access DevLens AI from your CI/CD pipelines.</p>
                <Field label="Key Name (e.g. GitHub Actions)" value={newKeyName} onChange={setNewKeyName} />
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={closeKeyModal} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-surface border border-transparent cursor-pointer transition-colors">Cancel</button>
                  <button type="submit" disabled={!newKeyName || generatingKey} className="px-4 py-2 text-sm font-medium rounded-md bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors">
                    {generatingKey ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-surface/60 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-electric/40" 
      />
    </label>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2.5 text-sm cursor-pointer hover:bg-surface/80 transition-colors"
    >
      <span>{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${on ? "bg-[#00ffff] shadow-[0_0_8px_rgba(0,255,255,0.6)]" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all duration-300 ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
