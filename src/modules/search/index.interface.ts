import { ProfileModel } from "@/models/profile";
import { Request, Response } from "express";

export interface SearchControllerInterface {
    SearchProfile(req: Request, res: Response): Promise<void>
}

export interface SearchServiceInterface {
    SearchProfile(name: string, email: string): Promise<ProfileModel[]>
}