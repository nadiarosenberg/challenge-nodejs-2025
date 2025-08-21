import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../../src/orders/orders.service';
import { OrderWithItemsRepository } from '../../src/orders/repositories/order-with-items.repository';
import { OrdersRepository } from '../../src/orders/repositories/orders.repository';
import { CacheService } from '../../src/cache/cache.service';
import { OrderItem } from '../../src/orders/entities/order-item.model';
import { OrderStatus } from '../../src/orders/entities/order.types';
import { BadRequestException } from '@nestjs/common';
import { mockCompleteOrder, mockCreateOrderDto, mockOrder, validId } from './common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderWithItemsRepository: OrderWithItemsRepository;
  let ordersRepository: OrdersRepository;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrderWithItemsRepository,
          useValue: {
            createOrder: jest.fn(),
            updateOrderStatus: jest.fn(),
          },
        },
        {
          provide: OrdersRepository,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            getMany: jest.fn(),
            setMany: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
    orderWithItemsRepository = module.get<OrderWithItemsRepository>(OrderWithItemsRepository);
    ordersRepository = module.get<OrdersRepository>(OrdersRepository);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('happy path: should create an order successfully', async () => {
      const expectedInput = {
        ...mockCreateOrderDto,
        status: OrderStatus.INITIATED,
      };
      jest.spyOn(orderWithItemsRepository, 'createOrder').mockResolvedValue({
        ...mockCompleteOrder,
        status: OrderStatus.INITIATED,
      });
      const result = await service.createOrder(mockCreateOrderDto);
      expect(orderWithItemsRepository.createOrder).toHaveBeenCalledWith(expectedInput);
      expect(result).toEqual({
        ...mockCompleteOrder,
        status: OrderStatus.INITIATED,
      });
    });
    it('should propagate errors from repository', async () => {
      const error = new BadRequestException('Database error');
      jest.spyOn(orderWithItemsRepository, 'createOrder').mockRejectedValue(error);
      await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(BadRequestException);
      expect(orderWithItemsRepository.createOrder).toHaveBeenCalled();
    });
  });
  describe('findOrder', () => {
    it('happy path: should return an order by id', async () => {
      jest.spyOn(ordersRepository, 'findOne').mockResolvedValue(mockCompleteOrder);
      const result = await service.findOrder(mockCompleteOrder.id);
      expect(ordersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCompleteOrder.id, deletedAt: null },
        include: [{ model: OrderItem }],
      });
      expect(result).toEqual(mockCompleteOrder);
    });
    it('should propagate errors from repository', async () => {
      const error = new BadRequestException('Database error');
      jest.spyOn(ordersRepository, 'findOne').mockRejectedValue(error);
      await expect(service.findOrder(validId)).rejects.toThrow(BadRequestException);
      expect(ordersRepository.findOne).toHaveBeenCalled();
    });
  });
  describe('listOrders', () => {
    it('happy path: should return cached orders when available', async () => {
      const cachedIds = [mockOrder.id];
      const cachedOrders = [mockOrder];
      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedIds);
      jest.spyOn(cacheService, 'getMany').mockResolvedValue(cachedOrders);
      const result = await service.listOrders();
      expect(cacheService.get).toHaveBeenCalledWith('orders:hash:ids');
      expect(cacheService.getMany).toHaveBeenCalledWith([`orders:hash:${mockOrder.id}`]);
      expect(ordersRepository.findAll).not.toHaveBeenCalled()
      expect(result).toEqual(cachedOrders);
    });
    it('happy path: should fetch from database when cache is empty', async () => {
      const orders = [mockOrder];
      const orderIds = [mockOrder.id];
      jest.spyOn(cacheService, 'get').mockResolvedValue([]);
      jest.spyOn(cacheService, 'get').mockResolvedValue(orderIds);
      jest.spyOn(cacheService, 'getMany').mockResolvedValue([]);
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue(orders as any);
      jest.spyOn(cacheService, 'set').mockResolvedValue();
      jest.spyOn(cacheService, 'setMany').mockResolvedValue();
      const result = await service.listOrders();
      expect(cacheService.get).toHaveBeenCalledWith('orders:hash:ids');
      expect(cacheService.getMany).toHaveBeenCalledWith([`orders:hash:${mockOrder.id}`]);
      expect(ordersRepository.findAll).toHaveBeenCalled()
      expect(cacheService.set).toHaveBeenCalledWith('orders:hash:ids', orderIds);
      expect(cacheService.setMany).toHaveBeenCalledWith([
        {
          key: `orders:hash:${mockCompleteOrder.id}`,
          value: mockOrder,
        },
      ]);
      expect(result).toEqual(orders);
    });
    it('happy path: should fetch from database when cache is null', async () => {
      const orders = [mockOrder];
      const orderIds = [mockOrder.id];
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(ordersRepository, 'findAll').mockResolvedValue(orders as any);
      jest.spyOn(cacheService, 'set').mockResolvedValue();
      jest.spyOn(cacheService, 'setMany').mockResolvedValue();
      const result = await service.listOrders();
      expect(cacheService.get).toHaveBeenCalledWith('orders:hash:ids');
      expect(cacheService.getMany).not.toHaveBeenCalled()
      expect(ordersRepository.findAll).toHaveBeenCalled()
      expect(cacheService.set).toHaveBeenCalledWith('orders:hash:ids', orderIds);
      expect(cacheService.setMany).toHaveBeenCalledWith([
        {
          key: `orders:hash:${mockCompleteOrder.id}`,
          value: mockOrder,
        },
      ]);
      expect(result).toEqual(orders);
    });
    it('should propagate errors from cache repository', async () => {
      const error = new BadRequestException('cache error');
      jest.spyOn(cacheService, 'get').mockRejectedValue(error);
      await expect(service.listOrders()).rejects.toThrow(BadRequestException);
    });
    it('should propagate errors from order repository', async () => {
      const error = new BadRequestException('Database error');
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(ordersRepository, 'findAll').mockRejectedValue(error);
      await expect(service.listOrders()).rejects.toThrow(BadRequestException);
      expect(ordersRepository.findAll).toHaveBeenCalled();
    });
  });
  describe('advanceOrder', () => {
    it('happy path: should advance order from INITIATED to SENT successfully', async () => {
      const initiatedOrder = { ...mockOrder, status: OrderStatus.INITIATED };
      jest.spyOn(ordersRepository, 'findOne').mockResolvedValue(initiatedOrder as any);
      jest.spyOn(orderWithItemsRepository, 'updateOrderStatus').mockResolvedValue();
      const result = await service.advanceOrder(validId);
      expect(ordersRepository.findOne).toHaveBeenCalledWith({
        where: { id: validId, deletedAt: null },
      });
      expect(orderWithItemsRepository.updateOrderStatus).toHaveBeenCalledWith(initiatedOrder);
      expect(cacheService.delete).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
    it('happy path: should advance order from SENT to DELIVERED and delete from cache', async () => {
      const sentOrder = { ...mockOrder, status: OrderStatus.SENT };
      jest.spyOn(ordersRepository, 'findOne').mockResolvedValue(sentOrder as any);
      jest.spyOn(orderWithItemsRepository, 'updateOrderStatus').mockResolvedValue();
      jest.spyOn(cacheService, 'delete').mockResolvedValue();
      const result = await service.advanceOrder(validId);
      expect(ordersRepository.findOne).toHaveBeenCalledWith({
        where: { id: validId, deletedAt: null },
      });
      expect(orderWithItemsRepository.updateOrderStatus).toHaveBeenCalledWith(sentOrder);
      expect(cacheService.delete).toHaveBeenCalledWith(`orders:hash:${mockCompleteOrder.id}`);
      expect(result).toBeUndefined();
    });
    it('should propagate errors from findOne repository function', async () => {
      const error = new BadRequestException('Database error');
      jest.spyOn(ordersRepository, 'findOne').mockRejectedValue(error);
      await expect(service.advanceOrder(validId)).rejects.toThrow(BadRequestException);
      expect(ordersRepository.findOne).toHaveBeenCalled();
    });
    it('should propagate errors from updateOrderStatus repository function', async () => {
      const error = new BadRequestException('Invalid transition');
      jest.spyOn(ordersRepository, 'findOne').mockResolvedValue(mockOrder as any);
      jest.spyOn(orderWithItemsRepository, 'updateOrderStatus').mockRejectedValue(error);
      await expect(service.advanceOrder(validId)).rejects.toThrow(BadRequestException);
      expect(orderWithItemsRepository.updateOrderStatus).toHaveBeenCalled();
    });
  });
});
