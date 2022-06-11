import { MessageEntity } from './models/message.entity';
import { ActiveConversationEntity } from './models/active-conversation.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './gateway/chat.gateway';
import { ConversationEntity } from './models/conversation.entity';
import { ConversationService } from './services/conversation.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ConversationEntity,
      ActiveConversationEntity,
      MessageEntity,
    ]),
  ],
  providers: [ChatGateway, ConversationService],
})
export class ChatModule {}
