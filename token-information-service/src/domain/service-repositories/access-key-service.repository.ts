import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ServiceClientsService } from 'src/service-clients/services/service-clients.service';
import { AccessKey, AccessKeyRepository } from '../repositories/access-key.repository';

@Injectable()
export class AccessKeyServiceRepository implements AccessKeyRepository {
  constructor(
    private readonly serviceClient: ServiceClientsService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async findByKey(key: string): Promise<AccessKey | null> {
    const cachedData = await this.cacheService.get<AccessKey>(key);
    if (cachedData) return cachedData;

    const result: AccessKey = await this.serviceClient.sendToAccessKeyManagementService(
      'getAccessKeyDetails',
      { key: key },
    );
    if (!result) return null;

    await this.cacheService.set(key, result);
    return result;
  }
}
