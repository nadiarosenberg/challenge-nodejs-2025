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
  public readonly model: ModelStatic<T>;
  protected readonly logger = new Logger(BaseRepository.name);

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findOne(options: FindOptions, transaction?: Transaction): Promise<T> {
    const row = await this.model.findOne({ ...options, transaction });
    if (!row) {
      this.logger.warn(`findOne: resource not found in ${this.model.name}`);
      throw new NotFoundException('Resource not found');
    }
    return row.get({ plain: true }) as T;
  }

  async findAll(options?: FindOptions, transaction?: Transaction): Promise<T[]> {
    const rows = await this.model.findAll({ ...options, transaction });
    return rows.map((row) => row.get({ plain: true }) as T);
  }

  async createOne(values: CreationAttributes<T>, transaction?: Transaction): Promise<T> {
    const created = await this.model.create(values as any, { transaction });
    return created.get({ plain: true }) as T;
  }

  async createMany(values: CreationAttributes<T>[], transaction?: Transaction): Promise<T[]> {
    const created = await this.model.bulkCreate(values as any[], {
      transaction,
      returning: true,
    });
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
      this.logger.warn(`updateOne: resource not found in ${this.model.name}`);
      throw new NotFoundException('Resource not found');
    }
    return affectedRows[0];
  }

  async updateMany(
    where: WhereOptions<Attributes<T>>,
    values: Record<string, any>,
    transaction?: Transaction,
  ): Promise<number> {
    const [affectedCount] = await this.model.update(values, {
      where,
      transaction,
    });
    return affectedCount;
  }

  async deleteOne(where: WhereOptions<Attributes<T>>, transaction?: Transaction): Promise<void> {
    const deleted = await this.model.destroy({
      where,
      transaction,
    });
    if (!deleted) {
      this.logger.warn(`deleteOne: resource not found in ${this.model.name}`);
      throw new NotFoundException('Resource not found');
    }
  }
}
