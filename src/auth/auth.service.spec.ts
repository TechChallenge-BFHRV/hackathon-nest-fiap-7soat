import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUniqueOrThrow: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn().mockReturnValue({ email: 'test@example.com' }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('registerUser', () => {
    it('should register a new user and return token', async () => {
      const dto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordconf: 'password123',
        role: Role.USER,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        name: 'Test User',
        id: 1,
        email: dto.email,
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: Role.USER
      });

      const result = await authService.registerUser(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: dto.email, password: 'hashed-password' }),
        select: expect.any(Object),
      });
      expect(result).toEqual({
        user: expect.any(Object),
        token: 'mocked-jwt-token',
      });
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        passwordconf: 'differentPassword',
        name: 'Test User',
        role: Role.USER,
      };

      await expect(authService.registerUser(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already exists', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        passwordconf: 'password123',
        name: 'Test User',
        role: Role.USER,
      };

      jest.spyOn(prisma.user, 'create').mockRejectedValue({ code: 'P2002' });

      await expect(authService.registerUser(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        passwordconf: 'password123',
        name: 'Test User',
        role: Role.USER,
      };

      jest.spyOn(prisma.user, 'create').mockRejectedValue(new Error());

      await expect(authService.registerUser(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('loginUser', () => {
    it('should log in a user and return token', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'Test User',
        email,
        password: await bcrypt.hash(password, 10), // Simulating stored hashed password
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'USER',
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.loginUser(email, password);

      expect(result).toEqual({
        user: expect.objectContaining({ email }),
        token: 'mocked-jwt-token',
      });
    });

    it('should throw BadRequestException if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockRejectedValue(new Error());

      await expect(authService.loginUser('notfound@example.com', 'password123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('correct-password', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'USER',
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.loginUser('test@example.com', 'wrong-password')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const result = authService.verifyToken('valid-token');
      expect(result).toEqual({ email: 'test@example.com' });
    });
  });

  describe('getPrivacyPolicy', () => {
    it('should return privacy policy text', () => {
      const result = authService.getPrivacyPolicy();
      expect(result).toContain('Ao utilizar a plataforma');
    });
  });
});
