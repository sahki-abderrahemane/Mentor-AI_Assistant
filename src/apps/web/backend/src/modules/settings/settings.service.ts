import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { UserSettings, ApiKey } from '../users/entities/user.entity.js';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings) private settings: Repository<UserSettings>,
    @InjectRepository(ApiKey) private apiKeys: Repository<ApiKey>,
  ) {}

  async get(userId: string) {
    let settings = await this.settings.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settings.create({ userId });
      await this.settings.save(settings);
    }
    return settings;
  }

  async update(userId: string, patch: Partial<UserSettings>) {
    let settings = await this.settings.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settings.create({ userId });
    }
    Object.assign(settings, patch);
    return this.settings.save(settings);
  }

  async listApiKeys(userId: string) {
    return this.apiKeys.find({ where: { userId }, select: ['id', 'name', 'prefix', 'scopes', 'lastUsedAt', 'expiresAt', 'createdAt'] });
  }

  async createApiKey(userId: string, name: string, scopes: string[]) {
    const raw = randomBytes(32).toString('hex');
    const prefix = raw.slice(0, 8);
    const key = this.apiKeys.create({
      userId,
      name,
      prefix,
      hash: raw,
      scopes,
    });
    const saved = await this.apiKeys.save(key);
    return { ...saved, key: raw };
  }

  async deleteApiKey(id: string, userId: string) {
    const key = await this.apiKeys.findOne({ where: { id, userId } });
    if (!key) throw new NotFoundException('API key not found');
    await this.apiKeys.remove(key);
  }

  private readonly INTEGRATION_CATALOG = [
    { id: 'huggingface', name: 'HuggingFace', type: 'model' },
    { id: 'openai', name: 'OpenAI', type: 'model' },
    { id: 'anthropic', name: 'Anthropic', type: 'model' },
  ];

  private connectedMap(settings: UserSettings): Record<string, boolean> {
    const meta = (settings.metadata ?? {}) as Record<string, unknown>;
    return (meta.integrations as Record<string, boolean>) ?? {};
  }

  async listIntegrations(userId: string) {
    const settings = await this.get(userId);
    const connected = this.connectedMap(settings);
    return this.INTEGRATION_CATALOG.map((entry) => ({
      ...entry,
      connected: connected[entry.id] ?? entry.id === 'huggingface',
    }));
  }

  async toggleIntegration(userId: string, id: string) {
    const known = this.INTEGRATION_CATALOG.find((i) => i.id === id);
    if (!known) throw new NotFoundException(`Unknown integration: ${id}`);
    const settings = await this.get(userId);
    const meta = { ...((settings.metadata ?? {}) as Record<string, unknown>) };
    const connected: Record<string, boolean> = {
      ...((meta.integrations as Record<string, boolean> | undefined) ?? {}),
    };
    const current = connected[id] ?? id === 'huggingface';
    connected[id] = !current;
    meta.integrations = connected;
    settings.metadata = meta;
    await this.settings.save(settings);
    return { id, toggled: connected[id] };
  }
}
