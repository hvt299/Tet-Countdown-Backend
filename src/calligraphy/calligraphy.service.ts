import { Injectable } from '@nestjs/common';
import { CreateCalligraphyDto } from './dto/create-calligraphy.dto';
import { UpdateCalligraphyDto } from './dto/update-calligraphy.dto';

@Injectable()
export class CalligraphyService {
  create(createCalligraphyDto: CreateCalligraphyDto) {
    return 'This action adds a new calligraphy';
  }

  findAll() {
    return `This action returns all calligraphy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} calligraphy`;
  }

  update(id: number, updateCalligraphyDto: UpdateCalligraphyDto) {
    return `This action updates a #${id} calligraphy`;
  }

  remove(id: number) {
    return `This action removes a #${id} calligraphy`;
  }
}
