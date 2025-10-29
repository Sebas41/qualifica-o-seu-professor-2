import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  // Ejecuta el proceso de seeding. Actualmente no-op; QA podrá implementar.
  async run(): Promise<{ status: string }> {
    // Aquí irá la lógica de seeding (crear datos, etc.)
    return { status: 'ok' };
  }
}
