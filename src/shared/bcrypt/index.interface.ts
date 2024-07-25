export interface BcryptInterface {
    HashPassword (password: string): string | Error
    ComparePassword(password: string, passwordHash: string): Promise<boolean | Error>
}