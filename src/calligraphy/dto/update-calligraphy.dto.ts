import { PartialType } from '@nestjs/mapped-types';
import { CreateCalligraphyDto } from './create-calligraphy.dto';

export class UpdateCalligraphyDto extends PartialType(CreateCalligraphyDto) {}
