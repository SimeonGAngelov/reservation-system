import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Matches } from "class-validator";

export class CreateServiceDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    @Matches(/.*\S.*/, { message: 'Name must contain at least one non-whitespace character!' })
    name: string;

    @IsOptional()
    @IsString()
    @Length(0, 200)    
    description?: string;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive() 
    price: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    duration?: number;
}