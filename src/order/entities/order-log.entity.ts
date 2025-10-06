import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OrderStage {
  START = 'START',
  VALIDATE_USER = 'VALIDATE_USER',
  VALIDATE_STOCK = 'VALIDATE_STOCK',
  OTHER = 'OTHER',
  ORDER_CREATED = 'ORDER_CREATED',
}

export enum OrderStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('order_logs')
export class OrderLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderId: number;

  @Column({
    type: 'enum',
    enum: OrderStage,
  })
  stage: OrderStage;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
