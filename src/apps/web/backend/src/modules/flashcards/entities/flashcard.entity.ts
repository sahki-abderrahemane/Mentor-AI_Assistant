import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

@Entity('flashcard_decks')
export class FlashcardDeck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'subject_id', nullable: true })
  subjectId: string;

  @Column({ name: 'subject_name', nullable: true })
  subjectName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Flashcard', 'deck')
  cards: Flashcard[];
}

@Entity('flashcards')
@Index(['deckId'])
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deck_id' })
  deckId: string;

  @ManyToOne('FlashcardDeck', 'cards', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deck_id' })
  deck: any;

  @Column({ type: 'text' })
  front: string;

  @Column({ type: 'text' })
  back: string;

  @Column({ nullable: true })
  hint: string;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'ease_factor', type: 'double precision', default: 2.5 })
  easeFactor: number;

  @Column({ default: 0 })
  interval: number;

  @Column({ default: 0 })
  repetitions: number;

  @Column({ name: 'next_review', nullable: true })
  nextReview: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('FlashcardReview', 'card')
  reviews: FlashcardReview[];
}

@Entity('flashcard_reviews')
@Index(['cardId'])
export class FlashcardReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'card_id' })
  cardId: string;

  @ManyToOne('Flashcard', 'reviews', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: any;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('User', 'flashcardReviews')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ type: 'enum', enum: ['again', 'hard', 'good', 'easy'] })
  rating: ReviewRating;

  @Column({ name: 'ease_factor', nullable: true })
  easeFactor: number;

  @Column({ nullable: true })
  interval: number;

  @CreateDateColumn({ name: 'reviewed_at' })
  reviewedAt: Date;
}