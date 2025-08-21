import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/orders/orders.controller';
import { OrdersService } from '../../src/orders/orders.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockCompleteOrder, mockCreateOrderDto, validId } from './common';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            findOrder: jest.fn(),
            listOrders: jest.fn(),
            advanceOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('happy path: should create an order successfully', async () => {
      jest.spyOn(service, 'createOrder').mockResolvedValue(mockCompleteOrder);
      const result = await controller.create(mockCreateOrderDto);
      expect(service.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(result).toEqual(mockCompleteOrder);
    });
    it('should throw BadRequestException for invalid DTO: invalid clientName', async () => {
      const invalidDto = {
        ...mockCreateOrderDto,
        clientName: 123, // Invalid: number
      };
      jest.spyOn(service, 'createOrder').mockRejectedValue(new BadRequestException('Validation failed'));
      await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException for invalid DTO: empty items', async () => {
        const invalidDto = {
          ...mockCreateOrderDto,
          items: [], // Invalid: empty array
        };
        jest.spyOn(service, 'createOrder').mockRejectedValue(new BadRequestException('Validation failed'));
        await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
      });
      it('should throw BadRequestException for invalid DTO: invalid items', async () => {
        const invalidDto = {
          ...mockCreateOrderDto,
          items: [{
            description: 123, //Invalid: number
            quantity: "abc", //Invalid: string
            unitPrice: "abc", //Invalid: string
          }]
        };
        jest.spyOn(service, 'createOrder').mockRejectedValue(new BadRequestException('Validation failed'));
        await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
      });
  });
  describe('findOne', () => {
    it('happy path:should return an order by valid UUID', async () => {
      jest.spyOn(service, 'findOrder').mockResolvedValue(mockCompleteOrder);
      const result = await controller.findOne(validId);
      expect(service.findOrder).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockCompleteOrder);
    });
    it('should throw BadRequestException for invalid id', async () => {
      const invalidId = 'invalid-uuid';
      jest.spyOn(service, 'findOrder').mockRejectedValue(new BadRequestException('Invalid UUID'));
      await expect(controller.findOne(invalidId)).rejects.toThrow(BadRequestException);
    });
    it('should propagate NotFoundException from service', async () => {
      jest.spyOn(service, 'findOrder').mockRejectedValue(new NotFoundException('Order not found'));
      await expect(controller.findOne(validId)).rejects.toThrow(NotFoundException);
      expect(service.findOrder).toHaveBeenCalledWith(validId);
    });
  });
  describe('list', () => {
    it('should return list of orders successfully', async () => {
      const mockOrders = [mockCompleteOrder];
      jest.spyOn(service, 'listOrders').mockResolvedValue(mockOrders);
      const result = await controller.list();
      expect(service.listOrders).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });
  describe('advance', () => {
    it('should advance order state successfully', async () => {
      jest.spyOn(service, 'advanceOrder').mockResolvedValue()
      const result = await controller.advance(validId);
      expect(service.advanceOrder).toHaveBeenCalledWith(validId);
      expect(result).toBeUndefined();
    });
    it('should throw BadRequestException for invalid id', async () => {
      const invalidId = 'invalid-uuid';
      jest.spyOn(service, 'advanceOrder').mockRejectedValue(new BadRequestException());
      await expect(controller.advance(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException from service', async () => {
      jest.spyOn(service, 'advanceOrder').mockRejectedValue(new NotFoundException());
      await expect(controller.advance(validId)).rejects.toThrow(NotFoundException);
      expect(service.advanceOrder).toHaveBeenCalledWith(validId);
    });
    it('should propagate ConflictException from service', async () => {
      jest.spyOn(service, 'advanceOrder').mockRejectedValue(new BadRequestException());
      await expect(controller.advance(validId)).rejects.toThrow(BadRequestException);
      expect(service.advanceOrder).toHaveBeenCalledWith(validId);
    });
  });
});
