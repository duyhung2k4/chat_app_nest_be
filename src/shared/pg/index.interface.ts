import { Client } from "pg"

export interface PgInterface {
    GetClientPg(): Promise<Client>
}