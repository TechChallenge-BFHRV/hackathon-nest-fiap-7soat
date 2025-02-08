import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';

describe('MailerService', () => {
  let service: MailerService;

  beforeAll(() => {
    process.env.SENDGRID_API_KEY = 'SG.MOCKED_API_KEY';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [MailerService, ConfigService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
