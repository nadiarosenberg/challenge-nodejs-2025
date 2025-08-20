import { Logger, NotFoundException } from '@nestjs/common';
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
	private readonly logger = new Logger(BaseRepository.name);

	constructor(model: ModelStatic<T>) {
		this.model = model;
	}

	async findOne(
		options: FindOptions,
		transaction?: Transaction,
	): Promise<T> {
		try {
			const row = await this.model.findOne({ ...options, transaction });
			if (!row) {
				this.logger.warn(`findOne: resource not found in ${this.model.name}`);
				throw new NotFoundException('Resource not found');
			}
			return row;
		} catch (error) {
			this.logger.error(`findOne failed for ${this.model.name}`, (error as Error).stack);
			throw error;
		}
	}

	async createOne(values: CreationAttributes<T>, transaction?: Transaction): Promise<T> {
		try {
			const created = await this.model.create(values as any, { transaction });
			return created.get({ plain: true }) as T;
		} catch (error) {
			this.logger.error(`createOne failed for ${this.model.name}`, (error as Error).stack);
			throw error;
		}
	}

	async createMany(
		values: CreationAttributes<T>[],
		transaction?: Transaction,
	): Promise<T[]> {
		try {
			const created = await this.model.bulkCreate(values as any[], {
				transaction,
				returning: true,
			});
			return created;
		} catch (error) {
			this.logger.error(`createMany failed for ${this.model.name}`, (error as Error).stack);
			throw error;
		}
	}

	async updateOne(
		where: WhereOptions<Attributes<T>>,
		values: Partial<CreationAttributes<T>>,
		transaction?: Transaction,
	): Promise<T> {
		try {
			const [affectedCount, affectedRows] = await this.model.update(values as any, {
				where,
				returning: true,
				transaction,
			});
			if (!affectedCount || affectedRows.length === 0) {
				this.logger.warn(`updateOne: resource not found in ${this.model.name}`);
				throw new NotFoundException('Resource not found');
			}
			return affectedRows[0];
		} catch (error) {
			this.logger.error(`updateOne failed for ${this.model.name}`, (error as Error).stack);
			throw error;
		}
	}

	async deleteOne(
		where: WhereOptions<Attributes<T>>,
		transaction?: Transaction,
	): Promise<void> {
		try {
			const deleted = await this.model.destroy({
				where,
				transaction,
			});
			if (!deleted) {
				this.logger.warn(`deleteOne: resource not found in ${this.model.name}`);
				throw new NotFoundException('Resource not found');
			}
		} catch (error) {
			this.logger.error(`deleteOne failed for ${this.model.name}`, (error as Error).stack);
			throw error;
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
		try {
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
		} catch (error) {
			this.logger.error(`paginate failed for ${model.name}`, (error as Error).stack);
			throw error;
		}
	}
} 