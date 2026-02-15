import { PartialType } from '@nestjs/swagger';
import { CreateLuckyBudDto } from './create-lucky-bud.dto';

export class UpdateLuckyBudDto extends PartialType(CreateLuckyBudDto) {}
