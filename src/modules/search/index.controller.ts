import { Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { SearchService } from "./index.service";
import { HttpService } from "@/shared/http/index.service";
import { SearchControllerInterface } from "./index.interface";

@Controller("search/api/v1")
export class SearchController implements SearchControllerInterface {

    constructor(
        private readonly searchService: SearchService,
        private readonly httpService: HttpService,
    ) {}

    @Get("protected/profile")
    async SearchProfile(@Req() req: Request, @Res() res: Response) {
        try {
            const { name, email } = req.query as { name: string, email: string };
            const result = await this.searchService.SearchProfile(name, email);

            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }
}