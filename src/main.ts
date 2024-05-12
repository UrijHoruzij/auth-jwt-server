import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ClusterService } from './cluster/cluster.service';
import corsConfig from './config/cors';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { cors: corsConfig() },
  );
  await app.register(fastifyCookie, {
    secret: 'my-secret',
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const config = new DocumentBuilder()
    .setTitle('Auth JWT')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();
// if (CLUSTERS) {
//   cluster(instance);
// } else {
//   instance();
// }
// ClusterService.clusterize(bootstrap);
