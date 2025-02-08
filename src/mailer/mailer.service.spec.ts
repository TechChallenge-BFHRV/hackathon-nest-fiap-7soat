import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';

describe('MailerService', () => {
  let service: MailerService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'SENDGRID_API_KEY') return 'SG.abcdef.123456';
        return null;
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [MailerService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
