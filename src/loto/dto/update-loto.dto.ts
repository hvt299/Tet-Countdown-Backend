import { PartialType } from '@nestjs/swagger';
import { CreateLotoDto } from './create-loto.dto';

export class UpdateLotoDto extends PartialType(CreateLotoDto) {}
