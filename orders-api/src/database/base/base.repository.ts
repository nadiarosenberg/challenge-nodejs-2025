import { NotFoundException } from '@nestjs/common';
import type {
	Attributes,
	CreationAttributes,
	FindOptions,
	Model,
	ModelStatic,
	Transaction,
	WhereOptions,
} from 'sequelize';

export class BaseRepository<T extends Model> {
	protected readonly model: ModelStatic<T>;

	constructor(model: ModelStatic<T>) {
		this.model = model;
	}

	async findOne(where: FindOptions['where'], transaction?: Transaction): Promise<T> {
		const row = await this.model.findOne({
			where,
			transaction,
		});
		if (!row) {
			throw new NotFoundException('Resource not found');
		}
		return row;
	}

	async createOne(values: CreationAttributes<T>, transaction?: Transaction): Promise<T> {
		const created = await this.model.create(values as any, { transaction });
		return created;
	}

	async updateOne(
		where: WhereOptions<Attributes<T>>,
		values: Partial<CreationAttributes<T>>,
		transaction?: Transaction,
	): Promise<T> {
		const [affectedCount, affectedRows] = await this.model.update(values as any, {
			where,
			returning: true,
			transaction,
		});
		if (!affectedCount || affectedRows.length === 0) {
			throw new NotFoundException('Resource not found');
		}
		return affectedRows[0];
	}

	async deleteOne(
		where: WhereOptions<Attributes<T>>,
		transaction?: Transaction,
	): Promise<void> {
		const deleted = await this.model.destroy({
			where,
			transaction,
		});
		if (!deleted) {
			throw new NotFoundException('Resource not found');
		}
	}

	async paginate<TModel extends Model>(
		model: ModelStatic<TModel>,
		options: {
			where?: FindOptions['where'];
			order?: FindOptions['order'];
			page?: number;
			limit?: number;
			transaction?: Transaction;
		},
	): Promise<{
		data: TModel[];
		meta: { page: number; limit: number; total: number; totalPages: number };
	}> {
		const page = Math.max(1, options.page ?? 1);
		const rawLimit = options.limit ?? 20;
		const limit = Math.max(1, Math.min(100, rawLimit));
		const offset = (page - 1) * limit;
		const { rows, count } = await model.findAndCountAll({
			where: options.where,
			order: options.order,
			limit,
			offset,
			transaction: options.transaction,
		});
		const total = Array.isArray(count) ? (count as any[]).length : (count as number);
		const totalPages = Math.max(1, Math.ceil(total / limit));
		return { data: rows as TModel[], meta: { page, limit, total, totalPages } };
	}
} 