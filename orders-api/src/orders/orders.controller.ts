import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	async create(@Body() dto: CreateOrderDto) {
		return this.ordersService.createOrder(dto);
	}

	@Get(':id')
	async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.ordersService.findOrderById(id);
	}

	@Get()
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	async list(@Query() query: ListOrdersQueryDto) {
		return this.ordersService.listOrders(query);
	}
}

 