import { Response } from "express"

export interface HttpInterface {
    ErrorResponse(res: Response, err: Error): void
    UnAuthorization(res: Response, err: Error): void
    SuccessResponse(res: Response, data: any): void
}

export type ResponsData<T> = {
    data: T
    message: string
    error: Error | null
    status: number
}