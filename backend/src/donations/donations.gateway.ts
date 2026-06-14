import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
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
}
