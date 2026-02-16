// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { BauCuaService } from './bau-cua.service';
// import { CreateBauCuaDto } from './dto/create-bau-cua.dto';
// import { UpdateBauCuaDto } from './dto/update-bau-cua.dto';

// @Controller('bau-cua')
// export class BauCuaController {
//   constructor(private readonly bauCuaService: BauCuaService) {}

//   @Post()
//   create(@Body() createBauCuaDto: CreateBauCuaDto) {
//     return this.bauCuaService.create(createBauCuaDto);
//   }

//   @Get()
//   findAll() {
//     return this.bauCuaService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.bauCuaService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateBauCuaDto: UpdateBauCuaDto) {
//     return this.bauCuaService.update(+id, updateBauCuaDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.bauCuaService.remove(+id);
//   }
// }
