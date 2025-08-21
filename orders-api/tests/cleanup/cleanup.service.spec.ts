import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CleanupService } from '../../src/cleanup/cleanup.service';
import { OrdersRepository } from '../../src/orders/repositories/orders.repository';
import { OrderWithItemsRepository } from '../../src/orders/repositories/order-with-items.repository';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { mockCompleteOrder } from '../orders/common';

describe('CleanupService', () => {
  let service: CleanupService;
  let ordersRepository: OrdersRepository;
  let orderWithItemsRepository: OrderWithItemsRepository;

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
    it('happy path:should not delete any orders when none are found', async () => {
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue([]);
      await service.cleanupDeletedOrders();
      expect(ordersRepository.findAll).toHaveBeenCalled();
      expect(ordersRepository.findAll).toHaveBeenCalledWith({
        where: {
          deletedAt: { [Op.lt]: expect.any(Date) },
        },
        include: ['items'],
      });
      expect(orderWithItemsRepository.deleteOrder).not.toHaveBeenCalled();
    });

    it('happy path: should delete orders and their items when found', async () => {
      const ordersToDelete = [mockCompleteOrder];
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue(ordersToDelete as any);
      jest.spyOn(orderWithItemsRepository, 'deleteOrder').mockResolvedValue();
      await service.cleanupDeletedOrders();
      expect(ordersRepository.findAll).toHaveBeenCalled();
      expect(orderWithItemsRepository.deleteOrder).toHaveBeenCalledWith(mockCompleteOrder.id);
    });
    it('should handle errors gracefully and continue processing', async () => {
      const ordersToDelete = [mockCompleteOrder];
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue(ordersToDelete as any);
      jest.spyOn(orderWithItemsRepository, 'deleteOrder').mockRejectedValue(new Error('Database error'));
      await service.cleanupDeletedOrders();
      expect(ordersRepository.findAll).toHaveBeenCalled();
    });
    it('should throw if some error in main process occurs', async () => {
      jest.spyOn(ordersRepository, 'findAll').mockRejectedValue(new Error('Database connection error'));
      await expect(service.cleanupDeletedOrders()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
