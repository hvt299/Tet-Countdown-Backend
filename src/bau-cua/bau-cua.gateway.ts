import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BauCuaService } from './bau-cua.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/bau-cua'
})
export class BauCuaGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(BauCuaGateway.name);

    constructor(private readonly bauCuaService: BauCuaService) { }

    afterInit(server: Server) {
        this.bauCuaService.server = server;
        this.logger.log('Bau Cua WebSocket Gateway Initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage('placeBet')
    handlePlaceBet(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string; animal: string; amount: number }
    ) {
        try {
            this.bauCuaService.placeBet(payload.userId, payload.animal, payload.amount);
            client.emit('bauCua:betSuccess', { message: 'Đặt cược thành công!', ...payload });
        } catch (error) {
            client.emit('bauCua:betError', { message: error.message });
        }
    }

    @SubscribeMessage('clearBets')
    handleClearBets(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string }
    ) {
        try {
            const refund = this.bauCuaService.clearBets(payload.userId);
            client.emit('bauCua:clearSuccess', {
                message: 'Đã hủy toàn bộ cược!',
                refund
            });
        } catch (error) {
            client.emit('bauCua:betError', { message: error.message });
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}