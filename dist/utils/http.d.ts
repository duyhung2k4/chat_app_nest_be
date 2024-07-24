import { Response } from "express";
export type ResponsData<T> = {
    data: T;
    message: string;
    error: Error | null;
    status: number;
};
export declare class HandleResponse {
    ErrorResponse(res: Response, err: Error): void;
    UnAuthorization(res: Response, err: Error): void;
    SuccessResponse(res: Response, data: any): void;
}
