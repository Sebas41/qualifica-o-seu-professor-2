import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener ConfigService para leer variables de entorno
  const configService = app.get(ConfigService);

  // Leer configuración de CORS desde .env
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3001');
  const nodeEnv = configService.get('NODE_ENV', 'development');
  
  // En desarrollo, permitir todos los orígenes
  const allowedOrigins = nodeEnv === 'development'
    ? ['http://localhost:3001', 'http://localhost:3000','https://qualifica-o-seu-professor-front.vercel.app']
    : [frontendUrl];
  
  // Agregar orígenes adicionales si existen (separados por coma)
  const additionalOrigins = configService.get('CORS_ORIGINS', '');
  if (additionalOrigins) {
    allowedOrigins.push(...additionalOrigins.split(',').map((url: string) => url.trim()));
  }

  // Configurar CORS
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const appName = configService.get('APP_NAME', 'Qualifica o Seu Professor');
  const config = new DocumentBuilder()
    .setTitle(`${appName} API`)
    .setDescription(`API documentation for the ${appName} platform`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Ejecutar seed automáticamente al iniciar
  const seedService = app.get(SeedService);
  await seedService.executeSeed();

  // Leer puerto desde .env
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`\n🚀 ${appName} API`);
  console.log(`📍 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  console.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
  console.log(`📧 SMTP configurado: ${configService.get('SMTP_HOST', 'No configurado')}`);
  console.log(`\n✅ Servidor listo para recibir peticiones\n`);
}

bootstrap();