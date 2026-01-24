/* eslint-disable prettier/prettier */
import { Global, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './../../../../packages/db/generated/prisma/index';


@Global()
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: 'postgresql://neondb_owner:npg_brWn9ifgC4Yk@ep-divine-firefly-ahldgyrw-pooler.c-3.us-east-1.aws.neon.tech/kosh_new?sslmode=require&channel_binding=require',
        })

        super({
            adapter,
            log: process.env.NODE_ENV === "development" ? ['query', 'error', 'warn'] : ['error']
        });
    }

    async onModuleDestroy() {
        await this.$disconnect()
        console.log('Database disconnected successfully')
    }
    async onModuleInit() {
        await this.$connect()
        console.log('Database connected successfully')
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("Cannot delete/ clear databases when in production")
        }
        const models = Reflect.ownKeys(this).filter((key) => typeof key === "string" && !key.startsWith('_'),)

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Promise.all(models.map((modelKey)=>{
            if(typeof modelKey === 'string'){
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,  @typescript-eslint/no-unsafe-member-access
                return this[modelKey].deleteMany()
            }
        }))
    }
}
