import { Module } from '@nestjs/common';
import { MediaModule } from './media/media.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from './config/transports/rabbitmq.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MediaModule, RabbitMQModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
