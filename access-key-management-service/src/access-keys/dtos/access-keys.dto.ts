import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AccessKeyUpdateDto {
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsNotEmpty()
  rateLimit: number;

  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @IsBoolean()
  @IsNotEmpty()
  disabled: boolean;
}

export class AccessKeyCreateDto extends AccessKeyUpdateDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class AccessKeysGetDto {
  @IsOptional()
  @IsString()
  disabled?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;
}

export class ChangeAccessKeyStatusDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsBoolean()
  @IsNotEmpty()
  disabled: boolean;
}
