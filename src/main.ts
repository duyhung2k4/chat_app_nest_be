import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { init } from './config/init';

async function main() {
    await init();
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(10000);
}
main();
