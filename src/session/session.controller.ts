import { Controller, Get, Param, Delete } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Get('/get-active-session')
  getActiveSession() {
    return this.sessionService.getActiveSession();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(+id);
  }
}
