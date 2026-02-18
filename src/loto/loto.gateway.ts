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
import { LotoService } from './loto.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/loto'
})
export class LotoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(LotoGateway.name);

    constructor(private readonly lotoService: LotoService) { }

    afterInit(server: Server) {
        this.lotoService.server = server;
        this.logger.log('Loto WebSocket Gateway Initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected to Loto: ${client.id}`);
    }

    @SubscribeMessage('buyTicket')
    async handleBuyTicket(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string }
    ) {
        try {
            const ticket = await this.lotoService.buyTicket(payload.userId);
            client.emit('loto:buySuccess', { message: 'Mua vé thành công!', ticket });
        } catch (error) {
            client.emit('loto:error', { message: error.message });
        }
    }

    @SubscribeMessage('callKinh')
    async handleCallKinh(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string; ticketIndex: number }
    ) {
        try {
            const winAmount = await this.lotoService.callKinh(payload.userId, payload.ticketIndex);
            client.emit('loto:kinhSuccess', { message: `Chúc mừng! Bạn đã KINH thành công và nhận ${winAmount} xu!`, winAmount });
        } catch (error) {
            client.emit('loto:error', { message: error.message });
        }
    }

    @SubscribeMessage('syncSession')
    handleSyncSession(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string }
    ) {
        const myTickets = this.lotoService.getPlayerTickets(payload.userId);
        const gameState = this.lotoService.getCurrentState();
        client.emit('loto:syncData', { myTickets, ...gameState });
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from Loto: ${client.id}`);
    }
}