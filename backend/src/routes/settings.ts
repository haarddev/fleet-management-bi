import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { USER_ROLES, normalizeRole } from '../auth/roles.js';
import { query } from '../db/pool.js';

export const settingsRouter = Router();

const SYSTEM_SETTING_KEYS = [
  'organization_name',
  'session_hours',
  'allow_viewer_export',
  'maintenance_mode',
] as const;

type SystemSettingKey = (typeof SYSTEM_SETTING_KEYS)[number];

type DbUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

function serializeUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
  };
}

function validateRole(role: string): string | null {
  return normalizeRole(role);
}

async function countActiveAdmins(excludeUserId?: number): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM users
     WHERE role = 'admin' AND is_active = TRUE
     ${excludeUserId ? 'AND id <> $1' : ''}`,
    excludeUserId ? [excludeUserId] : [],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function getSystemSettingsRecord(): Promise<Record<SystemSettingKey, string>> {
  const result = await query<{ key: string; value: string }>(
    `SELECT key, value FROM app_settings WHERE key = ANY($1::text[])`,
    [SYSTEM_SETTING_KEYS],
  );
  const map = Object.fromEntries(result.rows.map((row) => [row.key, row.value])) as Partial<
    Record<SystemSettingKey, string>
  >;

  return {
    organization_name: map.organization_name ?? 'Fleet Management BI',
    session_hours: map.session_hours ?? '8',
    allow_viewer_export: map.allow_viewer_export ?? 'false',
    maintenance_mode: map.maintenance_mode ?? 'false',
  };
}

async function findUserById(id: number): Promise<DbUser | null> {
  const result = await query<DbUser>(
    `SELECT id, email, name, role, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

settingsRouter.get('/overview', async (_req, res) => {
  try {
    const [totals, byRole] = await Promise.all([
      query<{ total: string; active: string }>(
        `SELECT COUNT(*)::text AS total,
                COUNT(*) FILTER (WHERE is_active = TRUE)::text AS active
         FROM users`,
      ),
      query<{ role: string; count: string }>(
        `SELECT role, COUNT(*)::text AS count
         FROM users
         GROUP BY role
         ORDER BY role`,
      ),
    ]);

    const totalUsers = Number(totals.rows[0]?.total ?? 0);
    const activeUsers = Number(totals.rows[0]?.active ?? 0);
    const adminCount = Number(byRole.rows.find((row) => row.role === 'admin')?.count ?? 0);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminCount,
      usersByRole: byRole.rows.map((row) => ({
        role: row.role,
        count: Number(row.count),
      })),
      roles: USER_ROLES,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load settings overview' });
  }
});

settingsRouter.get('/users', async (_req, res) => {
  try {
    const result = await query<DbUser>(
      `SELECT id, email, name, role, is_active, created_at, updated_at
       FROM users
       ORDER BY role ASC, name ASC`,
    );
    res.json({ data: result.rows.map(serializeUser) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

settingsRouter.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  try {
    const user = await findUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

settingsRouter.post('/users', async (req, res) => {
  const { email, name, role, password } = req.body as {
    email?: string;
    name?: string;
    role?: string;
    password?: string;
  };

  if (!email?.trim() || !name?.trim() || !role || !password) {
    res.status(400).json({ error: 'Email, name, role, and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const normalizedRole = validateRole(role);
  if (!normalizedRole) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query<DbUser>(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, is_active, created_at, updated_at`,
      [email.trim().toLowerCase(), passwordHash, name.trim(), normalizedRole],
    );
    res.status(201).json({ user: serializeUser(result.rows[0]) });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'Email is already in use' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

settingsRouter.patch('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const { email, name, role, isActive } = req.body as {
    email?: string;
    name?: string;
    role?: string;
    isActive?: boolean;
  };

  try {
    const existing = await findUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const nextRole = role !== undefined ? validateRole(role) : existing.role;
    if (role !== undefined && !nextRole) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const demotingAdmin = existing.role === 'admin' && nextRole !== 'admin';
    const deactivatingAdmin = existing.role === 'admin' && isActive === false;
    if (demotingAdmin || deactivatingAdmin) {
      const otherAdmins = await countActiveAdmins(id);
      if (otherAdmins === 0) {
        res.status(400).json({ error: 'At least one active admin is required' });
        return;
      }
    }

    if (req.user?.userId === id && isActive === false) {
      res.status(400).json({ error: 'You cannot deactivate your own account' });
      return;
    }

    if (req.user?.userId === id && nextRole !== 'admin') {
      res.status(400).json({ error: 'You cannot change your own admin role' });
      return;
    }

    const result = await query<DbUser>(
      `UPDATE users
       SET email = COALESCE($2, email),
           name = COALESCE($3, name),
           role = COALESCE($4, role),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, name, role, is_active, created_at, updated_at`,
      [
        id,
        email !== undefined ? email.trim().toLowerCase() : null,
        name !== undefined ? name.trim() : null,
        role !== undefined && nextRole ? nextRole : null,
        isActive !== undefined ? isActive : null,
      ],
    );

    res.json({ user: serializeUser(result.rows[0]) });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'Email is already in use' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

settingsRouter.post('/users/:id/reset-password', async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body as { password?: string };

  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  try {
    const existing = await findUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
      [id, passwordHash],
    );

    res.json({ message: 'Password updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

settingsRouter.delete('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  if (req.user?.userId === id) {
    res.status(400).json({ error: 'You cannot delete your own account' });
    return;
  }

  try {
    const existing = await findUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (existing.role === 'admin') {
      const otherAdmins = await countActiveAdmins(id);
      if (otherAdmins === 0) {
        res.status(400).json({ error: 'At least one active admin is required' });
        return;
      }
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

settingsRouter.get('/system', async (_req, res) => {
  try {
    const settings = await getSystemSettingsRecord();
    res.json({
      settings: {
        organizationName: settings.organization_name,
        sessionHours: Number(settings.session_hours) || 8,
        allowViewerExport: settings.allow_viewer_export === 'true',
        maintenanceMode: settings.maintenance_mode === 'true',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load system settings' });
  }
});

settingsRouter.patch('/system', async (req, res) => {
  const { organizationName, sessionHours, allowViewerExport, maintenanceMode } = req.body as {
    organizationName?: string;
    sessionHours?: number;
    allowViewerExport?: boolean;
    maintenanceMode?: boolean;
  };

  try {
    const updates: Array<{ key: SystemSettingKey; value: string }> = [];

    if (organizationName !== undefined) {
      const trimmed = organizationName.trim();
      if (!trimmed) {
        res.status(400).json({ error: 'Organization name is required' });
        return;
      }
      updates.push({ key: 'organization_name', value: trimmed });
    }

    if (sessionHours !== undefined) {
      if (!Number.isFinite(sessionHours) || sessionHours < 1 || sessionHours > 24) {
        res.status(400).json({ error: 'Session hours must be between 1 and 24' });
        return;
      }
      updates.push({ key: 'session_hours', value: String(sessionHours) });
    }

    if (allowViewerExport !== undefined) {
      updates.push({ key: 'allow_viewer_export', value: String(allowViewerExport) });
    }

    if (maintenanceMode !== undefined) {
      updates.push({ key: 'maintenance_mode', value: String(maintenanceMode) });
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No settings provided' });
      return;
    }

    await Promise.all(
      updates.map((item) =>
        query(
          `INSERT INTO app_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE
           SET value = EXCLUDED.value, updated_at = NOW()`,
          [item.key, item.value],
        ),
      ),
    );

    const settings = await getSystemSettingsRecord();
    res.json({
      settings: {
        organizationName: settings.organization_name,
        sessionHours: Number(settings.session_hours) || 8,
        allowViewerExport: settings.allow_viewer_export === 'true',
        maintenanceMode: settings.maintenance_mode === 'true',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
});

settingsRouter.get('/roles', (_req, res) => {
  res.json({
    roles: USER_ROLES.map((role) => ({
      role,
      sections: {
        revenue: ['admin', 'manager', 'viewer'].includes(role),
        maintenance: ['admin', 'maintenance'].includes(role),
        management: ['admin', 'manager', 'viewer'].includes(role),
        operation: ['admin', 'manager', 'viewer'].includes(role),
        idle: ['admin', 'viewer'].includes(role),
        settings: role === 'admin',
      },
      canExport: role !== 'viewer',
    })),
  });
});
