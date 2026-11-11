import { NotFoundException } from '@nestjs/common';
import type { FilterQuery, Model, SortOrder } from 'mongoose';

/**
 * Shared CRUD for the simple ordered collections the admin manages (certificates, timeline,
 * tech). Visitors only ever see the published documents. Reads hydrate documents (instead of
 * `.lean()`) so schema defaults fill fields that older documents don't have yet.
 */
export abstract class PublishableCollectionService<
  T extends { isPublished: boolean },
  CreateDto extends object,
  UpdateDto extends object,
> {
  protected constructor(
    protected readonly model: Model<T>,
    private readonly order: Record<string, SortOrder>,
    private readonly notFoundMessage: string,
  ) {}

  async listPublished() {
    const documents = await this.model
      .find({ isPublished: true } as FilterQuery<T>)
      .sort(this.order)
      .exec();
    return documents.map((document) => document.toObject());
  }

  async listAll() {
    const documents = await this.model.find().sort(this.order).exec();
    return documents.map((document) => document.toObject());
  }

  async getById(id: string) {
    const document = await this.model.findById(id).exec();
    if (!document) throw new NotFoundException(this.notFoundMessage);
    return document.toObject();
  }

  async create(dto: CreateDto) {
    return (await this.model.create(dto)).toObject();
  }

  async update(id: string, dto: UpdateDto) {
    const document = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();
    if (!document) throw new NotFoundException(this.notFoundMessage);
    return document.toObject();
  }

  async remove(id: string): Promise<void> {
    const { deletedCount } = await this.model.deleteOne({ _id: id }).exec();
    if (deletedCount === 0) throw new NotFoundException(this.notFoundMessage);
  }
}
