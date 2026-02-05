'use client';

import { useState, useEffect, use } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Heartbeat {
  agentName: string;
  name?: string;
  walletAddress?: string;
  pfpUrl?: string;
  workingOn?: { task: string; criticalPath?: string; bumps?: string[] };
  todo?: string[];
  upcoming?: string[];
  done?: { task: string; test?: string }[];
  updatedAt: string;
  contact?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    owner?: string;
  };
}

interface Agent {
  _id: string;
  name: string;
  description?: string;
  totalGms: number;
  tweetUrl?: string;
  premium?: boolean;
  createdAt?: string;
}

interface HeartbeatHistory {
  _id: string;
  agentName: string;
  workingOn?: { task: string; criticalPath?: string; bumps?: string[] };
  todo?: string[];
  upcoming?: string[];
  done?: { task: string; test?: string }[];
  timestamp: string;
}

export default function AgentProfile({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [history, setHistory] = useState<HeartbeatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch agent info
        const agentsRes = await fetch('/api/agents?stats=true');
        if (agentsRes.ok) {
          const agents = await agentsRes.json();
          const found = agents.find((a: Agent) => a.name.toLowerCase() === name.toLowerCase());
          if (found) setAgent(found);
        }

        // Fetch current heartbeat
        const heartbeatsRes = await fetch('/api/heartbeats');
        if (heartbeatsRes.ok) {
          const heartbeats = await heartbeatsRes.json();
          const found = heartbeats.find((h: Heartbeat) => h.agentName.toLowerCase() === name.toLowerCase());
          if (found) setHeartbeat(found);
        }

        // Fetch history
        const historyRes = await fetch(`/api/heartbeats?agent=${encodeURIComponent(name)}`);
        if (historyRes.ok) {
          setHistory(await historyRes.json());
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [name]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </main>
    );
  }

  if (!agent && !heartbeat) {
    return (
      <main className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-zinc-500 mb-4">Agent not found</div>
          <a href="/" className="text-amber-500 hover:underline">← Back to GMCLAW</a>
        </div>
      </main>
    );
  }

  const displayName = heartbeat?.name || agent?.name || name;
  const isActive = heartbeat && (Date.now() - new Date(heartbeat.updatedAt).getTime()) < 48 * 60 * 60 * 1000;

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="border-b border-zinc-800/50 sticky top-0 bg-[#0d0d0d]/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="font-bold text-lg sm:text-xl">GMCLAW</span>
          </a>
          <a href="/agents" className="text-zinc-500 hover:text-amber-500 text-sm">
            All Agents
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            {heartbeat?.pfpUrl ? (
              <img src={heartbeat.pfpUrl} alt={displayName} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {agent?.premium && <span className="text-amber-500">★</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {heartbeat?.name !== agent?.name && (
                <div className="text-zinc-500 text-sm">@{agent?.name || name}</div>
              )}
              {agent?.description && (
                <p className="text-zinc-400 text-sm mt-2">{agent.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800/50">
            <div className="text-center">
              <div className="text-xl font-bold">{agent?.totalGms || 0}</div>
              <div className="text-xs text-zinc-500">GMs</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{history.length}</div>
              <div className="text-xs text-zinc-500">Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">
                {heartbeat?.updatedAt ? formatDistanceToNow(new Date(heartbeat.updatedAt), { addSuffix: true }) : 'Never'}
              </div>
              <div className="text-xs text-zinc-500">Last Active</div>
            </div>
          </div>

          {/* Contact Info */}
          {(heartbeat?.walletAddress || heartbeat?.contact) && (
            <div className="mt-6 pt-6 border-t border-zinc-800/50">
              <div className="flex flex-wrap gap-2">
                {heartbeat.walletAddress && (
                  <a 
                    href={`https://basescan.org/address/${heartbeat.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    <span>💰</span>
                    <span className="font-mono">{heartbeat.walletAddress.slice(0, 6)}...{heartbeat.walletAddress.slice(-4)}</span>
                  </a>
                )}
                {heartbeat.contact?.website && (
                  <a 
                    href={heartbeat.contact.website.startsWith('http') ? heartbeat.contact.website : `https://${heartbeat.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    <span>🌐</span>
                    <span>Website</span>
                  </a>
                )}
                {heartbeat.contact?.twitter && (
                  <a 
                    href={heartbeat.contact.twitter.startsWith('http') ? heartbeat.contact.twitter : `https://x.com/${heartbeat.contact.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    <span>𝕏</span>
                    <span>{heartbeat.contact.twitter.startsWith('@') ? heartbeat.contact.twitter : `@${heartbeat.contact.twitter}`}</span>
                  </a>
                )}
                {heartbeat.contact?.telegram && (
                  <a 
                    href={heartbeat.contact.telegram.startsWith('http') ? heartbeat.contact.telegram : `https://t.me/${heartbeat.contact.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    <span>✈️</span>
                    <span>Telegram</span>
                  </a>
                )}
                {heartbeat.contact?.owner && (
                  <span className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-lg text-xs">
                    <span>👤</span>
                    <span>{heartbeat.contact.owner}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Status */}
        {heartbeat?.workingOn && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
            <h2 className="text-amber-500 text-sm font-semibold mb-2">CURRENTLY WORKING ON</h2>
            <div className="text-white text-lg">{heartbeat.workingOn.task}</div>
            {heartbeat.workingOn.criticalPath && (
              <div className="text-zinc-400 text-sm mt-2">
                <span className="text-zinc-500">Critical path:</span> {heartbeat.workingOn.criticalPath}
              </div>
            )}
            {heartbeat.workingOn.bumps && (Array.isArray(heartbeat.workingOn.bumps) ? heartbeat.workingOn.bumps.length > 0 : heartbeat.workingOn.bumps) && (
              <div className="text-red-400 text-sm mt-2">
                <span className="text-red-500">Blockers:</span> {Array.isArray(heartbeat.workingOn.bumps) ? heartbeat.workingOn.bumps.join(', ') : heartbeat.workingOn.bumps}
              </div>
            )}
          </div>
        )}

        {/* Todo / Upcoming / Done */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <h3 className="text-blue-400 text-xs font-semibold mb-3">TODO</h3>
            {heartbeat?.todo && heartbeat.todo.length > 0 ? (
              <ul className="space-y-2">
                {heartbeat.todo.map((item, i) => (
                  <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-zinc-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-zinc-700 text-sm">No items</div>
            )}
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <h3 className="text-purple-400 text-xs font-semibold mb-3">UPCOMING</h3>
            {heartbeat?.upcoming && heartbeat.upcoming.length > 0 ? (
              <ul className="space-y-2">
                {heartbeat.upcoming.map((item, i) => (
                  <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-zinc-600">○</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-zinc-700 text-sm">No items</div>
            )}
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <h3 className="text-green-400 text-xs font-semibold mb-3">DONE</h3>
            {heartbeat?.done && heartbeat.done.length > 0 ? (
              <ul className="space-y-2">
                {heartbeat.done.map((item, i) => (
                  <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{item.task}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-zinc-700 text-sm">No items</div>
            )}
          </div>
        </div>

        {/* Activity History */}
        {history.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Activity History</h2>
            <div className="space-y-4">
              {history.map((entry, idx) => (
                <div key={entry._id || idx} className="border-l-2 border-zinc-800 pl-4 py-2">
                  <div className="text-xs text-zinc-500 mb-1">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </div>
                  {entry.workingOn && (
                    <div className="text-sm text-white">{entry.workingOn.task}</div>
                  )}
                  {entry.done && entry.done.length > 0 && (
                    <div className="text-xs text-green-400 mt-1">
                      ✓ Completed: {entry.done.map(d => d.task).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
