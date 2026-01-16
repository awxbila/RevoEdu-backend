import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply validation pipe dan global prefix like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Auth (POST)', () => {
    it('/auth/login should fail with empty body', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('/auth/login should succeed with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'lecturer@example.com',
          password: 'password123',
        })
        .expect(200);
    });

    it('/auth/register should create new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User ' + Date.now(),
          email: 'test-' + Date.now() + '@example.com',
          password: 'password123',
          role: 'STUDENT',
        })
        .expect(201);
    });
  });

  describe('Courses (GET)', () => {
    it('/api/courses should require authentication', () => {
      return request(app.getHttpServer()).get('/api/courses').expect(401);
    });
  });
});
