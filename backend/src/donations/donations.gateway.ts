import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DonationsGateway {
  @WebSocketServer()
  server: Server;

  notifyNewDonation(donation: any) {
    this.server.emit('donation_created', donation);
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: 'connected' };
  }
}
