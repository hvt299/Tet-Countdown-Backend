import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CalligraphyService } from './calligraphy.service';
import { CreateCalligraphyDto } from './dto/create-calligraphy.dto';
import { UpdateCalligraphyDto } from './dto/update-calligraphy.dto';

@Controller('calligraphy')
export class CalligraphyController {
  constructor(private readonly calligraphyService: CalligraphyService) {}

  @Post()
  create(@Body() createCalligraphyDto: CreateCalligraphyDto) {
    return this.calligraphyService.create(createCalligraphyDto);
  }

  @Get()
  findAll() {
    return this.calligraphyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calligraphyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalligraphyDto: UpdateCalligraphyDto) {
    return this.calligraphyService.update(+id, updateCalligraphyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calligraphyService.remove(+id);
  }
}
