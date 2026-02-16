import { PartialType } from '@nestjs/swagger';
import { CreateBauCuaDto } from './create-bau-cua.dto';

export class UpdateBauCuaDto extends PartialType(CreateBauCuaDto) {}
