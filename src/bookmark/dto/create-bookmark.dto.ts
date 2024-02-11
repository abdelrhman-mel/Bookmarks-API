import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateBookmarkDto {
    @IsString()
    @IsNotEmpty()
    titles: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    link: string;
}