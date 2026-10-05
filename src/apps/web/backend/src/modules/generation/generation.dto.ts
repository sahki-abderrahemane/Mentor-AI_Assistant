import { IsArray, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GenerateQuizDto {
  @IsOptional() @IsUUID()
  documentId?: string;

  @IsOptional() @IsUUID()
  collectionId?: string;

  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsInt() @Min(1) @Max(20)
  questionCount?: number;

  @IsOptional() @IsArray()
  types?: Array<'multiple_choice' | 'true_false' | 'short_answer'>;
}

export class GenerateFlashcardsDto {
  @IsOptional() @IsUUID()
  documentId?: string;

  @IsOptional() @IsUUID()
  collectionId?: string;

  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsInt() @Min(1) @Max(40)
  cardCount?: number;
}

export class GenerateStudyGuideDto {
  @IsOptional() @IsUUID()
  documentId?: string;

  @IsOptional() @IsUUID()
  collectionId?: string;

  @IsOptional() @IsString()
  title?: string;
}
