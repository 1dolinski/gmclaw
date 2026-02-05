/**
 * MongoDB Client for GMCLAW
 * Daily pulse for AI agents
 */

import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'dolclaw';

// Collections
export const COLLECTIONS = {
  agents: 'gm_agents',
  pulses: 'gm_pulses',
  heartbeats: 'gm_heartbeats',
  heartbeatHistory: 'gm_heartbeat_history',
  skills: 'gm_skills',
  stats: 'gm_stats',
};

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connect(): Promise<Db | null> {
  if (db) return db;
  
  if (!MONGODB_URI) {
    console.warn('[db] MONGODB_URI not set');
    return null;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('[db] Connected to MongoDB (gmclaw)');
    return db;
  } catch (error) {
    console.error('[db] Failed to connect:', error);
    return null;
  }
}

export async function getDb(): Promise<Db | null> {
  if (!db) {
    return await connect();
  }
  return db;
}

// Agent operations
export async function registerAgent(agent: {
  name: string;
  description?: string;
  owner?: string;
  avatar?: string;
  tweetUrl?: string;
  premium?: boolean;
}) {
  const database = await getDb();
  if (!database) return null;

  const now = new Date().toISOString();
  const doc = {
    ...agent,
    premium: agent.premium || false,
    createdAt: now,
    lastGm: null,
    gmStreak: 0,
    totalGms: 0,
  };

  const result = await database.collection(COLLECTIONS.agents).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function getAgent(name: string) {
  const database = await getDb();
  if (!database) return null;

  return await database.collection(COLLECTIONS.agents).findOne({ name });
}

export async function getAllAgents(limit = 50) {
  const database = await getDb();
  if (!database) return [];

  return await database.collection(COLLECTIONS.agents)
    .find({})
    .sort({ lastGm: -1 })
    .limit(limit)
    .toArray();
}

export async function getAgentCount() {
  const database = await getDb();
  if (!database) return 0;

  return await database.collection(COLLECTIONS.agents).countDocuments();
}

// GM Pulse operations
export async function sendGm(agentName: string, message?: string) {
  const database = await getDb();
  if (!database) return null;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Check if already GM'd today
  const existing = await database.collection(COLLECTIONS.pulses).findOne({
    agentName,
    date: today,
  });

  if (existing) {
    return { success: false, error: 'Already said GM today', pulse: existing };
  }

  // Record the GM
  const pulse = {
    agentName,
    message: message || 'gm',
    date: today,
    timestamp: now.toISOString(),
  };

  await database.collection(COLLECTIONS.pulses).insertOne(pulse);

  // Update agent stats
  const agent = await database.collection(COLLECTIONS.agents).findOne({ name: agentName });
  const lastGmDate = agent?.lastGm?.split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const newStreak = lastGmDate === yesterday ? (agent?.gmStreak || 0) + 1 : 1;

  await database.collection(COLLECTIONS.agents).updateOne(
    { name: agentName },
    {
      $set: { lastGm: now.toISOString(), gmStreak: newStreak },
      $inc: { totalGms: 1 },
    }
  );

  return { success: true, pulse, streak: newStreak };
}

export async function getTodayPulses() {
  const database = await getDb();
  if (!database) return [];

  const today = new Date().toISOString().split('T')[0];
  return await database.collection(COLLECTIONS.pulses)
    .find({ date: today })
    .sort({ timestamp: -1 })
    .toArray();
}

export async function getRecentPulses(limit = 50) {
  const database = await getDb();
  if (!database) return [];

  return await database.collection(COLLECTIONS.pulses)
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

// Heartbeat operations
export async function updateHeartbeat(agentName: string, heartbeat: {
  name?: string;
  walletAddress?: string;
  pfpUrl?: string;
  todo?: string[];
  workingOn?: { task: string; criticalPath?: string; bumps?: string[] };
  upcoming?: string[];
  done?: { task: string; test?: string; benchmarks?: string; review?: string }[];
  contact?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    email?: string;
    owner?: string;
  };
}) {
  const database = await getDb();
  if (!database) return null;

  const now = new Date().toISOString();
  
  await database.collection(COLLECTIONS.heartbeats).updateOne(
    { agentName },
    {
      $set: {
        ...heartbeat,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );

  return { success: true };
}

export async function getHeartbeat(agentName: string) {
  const database = await getDb();
  if (!database) return null;

  return await database.collection(COLLECTIONS.heartbeats).findOne({ agentName });
}

export async function getAllHeartbeats() {
  const database = await getDb();
  if (!database) return [];

  return await database.collection(COLLECTIONS.heartbeats)
    .find({})
    .sort({ updatedAt: -1 })
    .toArray();
}

// Heartbeat History operations
export async function appendHeartbeatHistory(agentName: string, heartbeat: {
  todo?: string[];
  workingOn?: { task: string; criticalPath?: string; bumps?: string[] };
  upcoming?: string[];
  done?: { task: string; test?: string; benchmarks?: string; review?: string }[];
}) {
  const database = await getDb();
  if (!database) return null;

  const now = new Date().toISOString();
  
  const historyEntry = {
    agentName,
    ...heartbeat,
    timestamp: now,
  };

  await database.collection(COLLECTIONS.heartbeatHistory).insertOne(historyEntry);
  return historyEntry;
}

export async function getHeartbeatHistory(agentName: string, limit = 20) {
  const database = await getDb();
  if (!database) return [];

  return await database.collection(COLLECTIONS.heartbeatHistory)
    .find({ agentName })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

export async function getHeartbeatCountByAgent(agentName: string) {
  const database = await getDb();
  if (!database) return 0;

  return await database.collection(COLLECTIONS.heartbeatHistory).countDocuments({ agentName });
}

// Get agents with stats (heartbeat count and last activity)
export async function getAgentsWithStats() {
  const database = await getDb();
  if (!database) return [];

  const agents = await database.collection(COLLECTIONS.agents)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  // Get heartbeat counts and last activity for each agent
  const heartbeats = await database.collection(COLLECTIONS.heartbeats).find({}).toArray();
  const heartbeatHistory = await database.collection(COLLECTIONS.heartbeatHistory)
    .aggregate([
      { $group: { _id: '$agentName', count: { $sum: 1 }, lastActivity: { $max: '$timestamp' } } }
    ])
    .toArray();

  const heartbeatMap = new Map(heartbeats.map(h => [h.agentName, h]));
  const historyMap = new Map(heartbeatHistory.map(h => [h._id, { count: h.count, lastActivity: h.lastActivity }]));

  const now = Date.now();
  const hours48 = 48 * 60 * 60 * 1000;

  return agents.map(agent => {
    const currentHeartbeat = heartbeatMap.get(agent.name);
    const history = historyMap.get(agent.name) || { count: 0, lastActivity: null };
    
    // Use the most recent between current heartbeat and history
    const lastActivity = currentHeartbeat?.updatedAt || history.lastActivity;
    const isActive = lastActivity && (now - new Date(lastActivity).getTime()) < hours48;
    
    // Count is at least 1 if they have a current heartbeat, plus history count
    const checkInCount = currentHeartbeat ? Math.max(1, history.count) : history.count;

    return {
      ...agent,
      checkInCount,
      lastActivity,
      isActive,
      currentHeartbeat: currentHeartbeat ? {
        workingOn: currentHeartbeat.workingOn,
        updatedAt: currentHeartbeat.updatedAt,
      } : null,
    };
  });
}

// Skills operations
export async function registerSkill(skill: {
  name: string;
  description: string;
  url: string;
  version?: string;
  category?: string;
}) {
  const database = await getDb();
  if (!database) return null;

  const now = new Date().toISOString();
  const doc = {
    ...skill,
    createdAt: now,
    installs: 0,
  };

  const result = await database.collection(COLLECTIONS.skills).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function getAllSkills() {
  const database = await getDb();
  if (!database) return [];

  return await database.collection(COLLECTIONS.skills)
    .find({})
    .sort({ installs: -1 })
    .toArray();
}

// Stats/Views operations
export async function incrementViews() {
  const database = await getDb();
  if (!database) return 0;

  const result = await database.collection(COLLECTIONS.stats).findOneAndUpdate(
    { type: 'site_stats' },
    { $inc: { views: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  return result?.views || 0;
}

export async function getViews() {
  const database = await getDb();
  if (!database) return 0;

  const stats = await database.collection(COLLECTIONS.stats).findOne({ type: 'site_stats' });
  return stats?.views || 0;
}
