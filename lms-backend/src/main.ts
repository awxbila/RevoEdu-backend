import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 📁 Serve static files (uploaded images)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 🔐 Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // buang field yg tidak ada di DTO
      forbidNonWhitelisted: true, // error kalau ada field asing
      transform: true, // auto transform string → number
    }),
  );

  // 🌐 CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 🌍 Global prefix (biar endpoint rapi)
  app.setGlobalPrefix('api');

  // 📚 Swagger setup
  const config = new DocumentBuilder()
    .setTitle('LMS Backend API')
    .setDescription('API Documentation for Learning Management System')
    .setVersion('1.0')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:5000', 'Development server')
    .addServer(
      'https://revoedu-backend-production-ee0d.up.railway.app',
      'Production server',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste JWT token here (without Bearer prefix)',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 Swagger docs on http://localhost:${port}/api/docs`);
}
bootstrap();
