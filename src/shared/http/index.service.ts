import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { HttpInterface, ResponsData } from "./index.interface";

@Injectable()
export class HttpService implements HttpInterface {
    ErrorResponse(res: Response, err: Error) {
        const dataRes: ResponsData<null> = {
            data: null,
            message: err.message,
            error: err,
            status: 502,
        }

        res.status(502).json(dataRes);
    }

    UnAuthorization(res: Response, err: Error) {
        const dataRes: ResponsData<null> = {
            data: null,
            message: err.message,
            error: err,
            status: 401,
        }

        res.status(401).json(dataRes);
    }

    SuccessResponse(res: Response, data: any) {
        const dataRes: ResponsData<any> = {
            data: data,
            message: "OK",
            error: null,
            status: 200,
        }

        res.status(200).json(dataRes);
    }
}