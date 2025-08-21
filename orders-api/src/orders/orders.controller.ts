import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Patch,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { Order } from './entities/order.model';

@ApiTags('orders')
@Controller('v1/orders')
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Centralized error handling: All endpoints may return 500 for database, validation, or unexpected errors',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates a new order with the specified client name and order items',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or validation failed',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Database operation failed or unexpected error occurred',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieves a single order by its ID, including all order items',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order found successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format or validation failed',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Database operation failed or unexpected error occurred',
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOrder(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all non-delivered orders',
    description: 'Retrieves a list of all non-delivered orders (initiated and sent status)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: [OrderResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Database operation failed, cache error, or unexpected error occurred',
  })
  async list(): Promise<Order[]> {
    return this.ordersService.listOrders();
  }

  @Patch(':id/advance')
  @ApiOperation({
    summary: 'Advance order status',
    description: 'Advances the order status: initiated → sent, or sent → delivered (with soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status advanced successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Order cannot be advanced (already delivered or invalid status)',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format or validation failed',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Database operation failed, cache error, or unexpected error occurred',
  })
  async advance(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.ordersService.advanceOrder(id);
  }
}
