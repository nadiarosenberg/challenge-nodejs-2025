import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CleanupService } from '../../src/cleanup/cleanup.service';
import { OrdersRepository } from '../../src/orders/repositories/orders.repository';
import { OrderWithItemsRepository } from '../../src/orders/repositories/order-with-items.repository';
import { OrderStatus } from '../../src/orders/entities/order.types';
import { Logger, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';

describe('CleanupService', () => {
  let service: CleanupService;
  let configService: ConfigService;
  let ordersRepository: OrdersRepository;
  let orderWithItemsRepository: OrderWithItemsRepository;

  const mockOrder = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    clientName: 'John Doe',
    status: OrderStatus.DELIVERED,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date('2024-01-01'),
    sentAt: new Date(),
    deliveredAt: new Date(),
    items: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        orderId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Product 1',
        quantity: 2,
        unitPrice: 10.99,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanupService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'ORDER_HARD_DELETE_DAYS':
                  return 7;
                default:
                  return undefined;
              }
            }),
          },
        },
        {
          provide: OrdersRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: OrderWithItemsRepository,
          useValue: {
            deleteOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CleanupService>(CleanupService);
    configService = module.get<ConfigService>(ConfigService);
    ordersRepository = module.get<OrdersRepository>(OrdersRepository);
    orderWithItemsRepository = module.get<OrderWithItemsRepository>(OrderWithItemsRepository);

    // Mock Logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupDeletedOrders', () => {
    it('should not delete any orders when none are found', async () => {
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue([]);

      await service.cleanupDeletedOrders();

      expect(ordersRepository.findAll).toHaveBeenCalled();
      expect(orderWithItemsRepository.deleteOrder).not.toHaveBeenCalled();
    });

    it('should delete orders and their items when found', async () => {
      const ordersToDelete = [mockOrder];
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue(ordersToDelete as any);
      jest.spyOn(orderWithItemsRepository, 'deleteOrder').mockResolvedValue();

      await service.cleanupDeletedOrders();

      expect(ordersRepository.findAll).toHaveBeenCalled();
      expect(orderWithItemsRepository.deleteOrder).toHaveBeenCalledWith(mockOrder.id);
    });

    it('should handle errors gracefully and continue processing', async () => {
      const ordersToDelete = [mockOrder];
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue(ordersToDelete as any);
      jest.spyOn(orderWithItemsRepository, 'deleteOrder').mockRejectedValue(new Error('Database error'));

      await service.cleanupDeletedOrders();

      expect(ordersRepository.findAll).toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete order'),
        expect.any(String)
      );
    });

    it('should handle errors in the main process gracefully', async () => {
      jest.spyOn(ordersRepository, 'findAll').mockRejectedValue(new Error('Database connection error'));

      await expect(service.cleanupDeletedOrders()).rejects.toThrow(BadRequestException);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error during cleanup process')
      );
    });

    it('should use correct configuration values', async () => {
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue([]);

      await service.cleanupDeletedOrders();

      expect(configService.get).toHaveBeenCalledWith('ORDER_HARD_DELETE_DAYS');
    });

    it('should call findAll with correct filter parameters', async () => {
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue([]);

      await service.cleanupDeletedOrders();

      expect(ordersRepository.findAll).toHaveBeenCalledWith({
        where: {
          deletedAt: { [Op.lt]: expect.any(Date) },
        },
        include: ['items'],
      });
    });

    it('should log the correct number of deleted orders and items', async () => {
      const ordersToDelete = [mockOrder, { ...mockOrder, id: 'other-id', items: [] }];
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue(ordersToDelete as any);
      jest.spyOn(orderWithItemsRepository, 'deleteOrder').mockResolvedValue();

      await service.cleanupDeletedOrders();

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup complete: 2 orders and 1 items deleted')
      );
    });

    it('should log starting message with cutoff date', async () => {
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue([]);

      await service.cleanupDeletedOrders();

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Starting cleanup of deleted orders, limit date:'),
        expect.any(String)
      );
    });
  });
});
