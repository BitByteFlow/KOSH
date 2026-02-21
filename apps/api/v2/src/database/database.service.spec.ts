import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'DATABASE_URL') return 'postgresql://test:test@localhost:5432/test';
      if (key === 'DB_MAX_CONNECTIONS') return 3;
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have prisma client', () => {
    expect(service.prisma).toBeDefined();
  });
});
