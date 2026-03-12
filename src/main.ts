import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { formatErrorResponse } from './common/helpers/error-formatter.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors: Record<string, string> = {};
        errors.forEach((err) => {
          if (err.constraints) {
            // Pick the first error constraint message to display for the field
            formattedErrors[err.property] = Object.values(err.constraints)[0];
          }
        });
        return new BadRequestException(
          formatErrorResponse(formattedErrors, 'Validation error', 400),
        );
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('F1 Run Club API')
    .setDescription('The F1 Run Club API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
