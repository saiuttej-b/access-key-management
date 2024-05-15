import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { defaultIfEmpty, firstValueFrom, timeout } from 'rxjs';

export const ACCESS_KEY_MANAGEMENT_SERVICE = 'ACCESS_KEY_MANAGEMENT_SERVICE';

@Injectable()
export class ServiceClientsService {
  constructor(@Inject(ACCESS_KEY_MANAGEMENT_SERVICE) private readonly client: ClientProxy) {}

  async sendToAccessKeyManagementService(pattern: string, data: any) {
    return firstValueFrom(
      this.client.send(pattern, data).pipe(timeout(10000)).pipe(defaultIfEmpty({})),
    ).catch((err) => {
      console.log(err);
      if (err.message === 'Timeout has occurred') {
        throw new ServiceUnavailableException('Request timed out');
      }
      if (err.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException('Unable to connect service');
      }
      if (err?.statusCode) {
        throw new HttpException(err, err.statusCode);
      }
      throw new InternalServerErrorException({
        message: 'Something went wrong',
        error: err.message,
      });
    });
  }
}
