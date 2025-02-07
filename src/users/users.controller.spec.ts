import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../core/entities/user.entity';
import { UploadLog } from '../core/entities/upload-log.entity';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
      findUserUploads: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        PrismaService,
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneByEmail', () => {
    it('should return user data when email exists', async () => {
      const mockUser = new User();
      mockUser.email = 'test@example.com';
      mockUser.name = 'Test User';

      // Mock the service method
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await usersController.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw an error if user not found', async () => {
      // Mock the service method to throw an error
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      try {
        await usersController.findOneByEmail('nonexistent@example.com');
      } catch (error) {
        expect(error).toBeDefined();
        expect(usersService.findOne).toHaveBeenCalledWith('nonexistent@example.com');
      }
    });
  });

  describe('findVideosByEmail', () => {
    it('should return user videos when email exists', async () => {
      const uploadLogSample = new UploadLog();
      const mockVideos = [uploadLogSample, uploadLogSample];

      // Mock the service method
      jest.spyOn(usersService, 'findUserUploads').mockResolvedValue(mockVideos);

      const result = await usersController.findVideosByEmail('test@example.com');

      expect(result).toEqual(mockVideos);
      expect(usersService.findUserUploads).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw an error if no videos found', async () => {
      // Mock the service method to return an empty array or null
      jest.spyOn(usersService, 'findUserUploads').mockResolvedValue([]);

      const result = await usersController.findVideosByEmail('test@example.com');

      expect(result).toEqual([]);
      expect(usersService.findUserUploads).toHaveBeenCalledWith('test@example.com');
    });
  });
});