import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UploadLog } from 'src/core/entities/upload-log.entity';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUniqueOrThrow: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        passwordconf: 'password123',
        role: 'ADMIN'
      };
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('mockedHashedPassword');
      const mockedHashedPassword = await bcrypt.hash(dto.password, 10);
      const expectedUser = { name: 'Test User', id: 1, email: 'test@example.com', password: mockedHashedPassword, createdAt: new Date(), updatedAt: new Date(), role: Role.ADMIN };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser);

      const result = await service.create(dto);
      expect(result).toEqual(expectedUser);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: mockedHashedPassword,
          role: 'ADMIN',
        },
        select: { id: true, name: true, email: true, createdAt: true },
      });
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password12',
        passwordconf: 'password123',
        role: 'ADMIN'
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle unique constraint error', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        passwordconf: 'password123',
        role: 'ADMIN'
      };
      jest.spyOn(prisma.user, 'create').mockRejectedValue({ code: 'P2002' });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', password: 'password123', createdAt: new Date(), updatedAt: new Date(), role: Role.ADMIN };
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValue(mockUser);

      const result = await service.findOne('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw InternalServerErrorException when user is not found', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockRejectedValue(new Error());
      await expect(service.findOne('notfound@example.com')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findUserUploads', () => {
    it('should return user upload logs', async () => {
      const mockUploads: UploadLog[] = [{ id: 1, uploadStarted: new Date(), uploadFinished: new Date(), fileName: 'test.mp4' }];
      const mockUserWithUploads = { uploadLogs: mockUploads };
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValue(mockUserWithUploads as any);

      const result = await service.findUserUploads('test@example.com');
      expect(result).toEqual(mockUploads);
    });

    it('should throw InternalServerErrorException when user uploads not found', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockRejectedValue(new Error());
      await expect(service.findUserUploads('notfound@example.com')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
