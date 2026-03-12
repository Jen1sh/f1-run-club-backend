import { Injectable, Logger } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements MongooseOptionsFactory {
  private readonly logger = new Logger(DatabaseService.name);

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: 'mongodb://127.0.0.1:27017/f1runclub',
      retryAttempts: 5,
      retryDelay: 1000,
      connectionFactory: (connection: Connection) => {
        if (connection.readyState === 1) {
          this.logger.log('MongoDB successfully connected');
        }
        connection.on('connected', () => {
          this.logger.log('MongoDB successfully connected');
        });
        connection.on('disconnected', () => {
          this.logger.warn('MongoDB disconnected');
        });
        connection.on('error', (error) => {
          this.logger.error('MongoDB connection error:', error);
        });
        return connection;
      },
    };
  }
}
