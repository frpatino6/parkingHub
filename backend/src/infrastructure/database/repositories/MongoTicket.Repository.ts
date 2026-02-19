import { TicketRepository } from '../../../domain/ports/ticket.repository.port.js';
import { Ticket } from '../../../domain/entities/ticket.entity.js';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';
import { TicketModel, TicketDoc } from '../models/ticket.model.js';

export class MongoTicketRepository implements TicketRepository {
  async findById(id: string): Promise<Ticket | null> {
    const doc = await TicketModel.findById(id).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findByQrCode(qrCode: string): Promise<Ticket | null> {
    const doc = await TicketModel.findOne({ qrCode });
    return doc ? this.toDomain(doc) : null;
  }

  async findByBranchAndStatus(branchId: string, status: TicketStatus): Promise<Ticket[]> {
    const docs = await TicketModel.find({ branchId, status }).sort({ checkIn: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async create(ticket: Ticket): Promise<Ticket> {
    const doc = await TicketModel.create({
      tenantId: ticket.tenantId,
      branchId: ticket.branchId,
      operatorId: ticket.operatorId,
      vehicleType: ticket.vehicleType,
      plate: ticket.plate,
      qrCode: ticket.qrCode,
      status: ticket.status,
      checkIn: ticket.checkIn,
    });
    return this.toDomain(doc);
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const doc = await TicketModel.findByIdAndUpdate(
      ticket.id,
      {
        status: ticket.status,
        checkOut: ticket.checkOut,
        amountCOP: ticket.amount?.amount,
        paymentMethod: ticket.paymentMethod,
      },
      { new: true },
    );
    if (!doc) throw new Error(`Ticket ${ticket.id} not found for update`);
    return this.toDomain(doc);
  }

  private toDomain(doc: TicketDoc): Ticket {
    return new Ticket({
      id: doc.id as string,
      tenantId: doc.tenantId,
      branchId: doc.branchId,
      operatorId: doc.operatorId,
      vehicleType: doc.vehicleType,
      plate: doc.plate,
      qrCode: doc.qrCode,
      status: doc.status,
      checkIn: doc.checkIn,
      checkOut: doc.checkOut,
      amount: doc.amountCOP !== undefined ? new Money(doc.amountCOP) : undefined,
      paymentMethod: doc.paymentMethod,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
