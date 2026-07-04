import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './admin.schema';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private model: Model<AdminDocument>) {}

  findByEmail(email: string) {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  create(data: { email: string; passwordHash: string; role: 'user' | 'admin' }) {
    return this.model.create(data);
  }
}
