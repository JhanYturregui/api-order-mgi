import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { OrderRepository } from './repositories/order.repository';
import { OrderProduct } from './entities/order-product.entity';
import { OrderLog } from './entities/order-log.entity';
import { OrderLogRepository } from './repositories/order-log.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderProduct, OrderLog]),
    UserModule,
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: 'IOrderRepository', useClass: OrderRepository },
    { provide: 'IOrderLogRepository', useClass: OrderLogRepository },
  ],
})
export class OrderModule {}
