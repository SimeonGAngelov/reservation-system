import { IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateWorkerDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    @Matches(/.*\S.*/, { 
        message: 'Name must contain at least one non-whitespace character!' 
    })
    displayName: string;

    @IsOptional()
    @IsString()
    @Length(0, 200)
    @Matches(/^(|.*\S.*)$/, {
        message: 'Bio must contain at least one non-whitespace character or be empty!',
    })
    bio?: string;
}
