import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from './admin.schema';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private readonly model: Model<Admin>) {}

  findByEmail(email: string) {
    return this.model.findOne({ email: email.trim().toLowerCase() }).lean().exec();
  }

  findAdminById(id: string) {
    return this.model.findOne({ _id: id, role: 'admin' }).lean().exec();
  }

  /** Creates the admin, or resets the password and admin role of an existing account. */
  async upsertAdmin(email: string, passwordHash: string): Promise<'created' | 'updated'> {
    const result = await this.model
      .updateOne(
        { email: email.trim().toLowerCase() },
        { $set: { passwordHash, role: 'admin' } },
        { upsert: true, runValidators: true },
      )
      .exec();
    return result.upsertedCount > 0 ? 'created' : 'updated';
  }
}
