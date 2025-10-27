import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../ratings/entities/rating.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Professor } from './entities/professor.entity';

@Injectable()
export class ProfessorsService {
  constructor(
    @InjectRepository(Professor)
    private readonly professorsRepository: Repository<Professor>,
    @InjectRepository(Rating)
    private readonly ratingsRepository: Repository<Rating>,
  ) {}

  async create(createProfessorDto: CreateProfessorDto): Promise<Professor> {
    const professor = this.professorsRepository.create(createProfessorDto);
    return this.professorsRepository.save(professor);
  }

  async findAll(): Promise<(Professor & { averageScore: number; ratingsCount: number })[]> {
    const professors = await this.professorsRepository.find();
    return Promise.all(
      professors.map(async (professor) => ({
        ...professor,
        ...(await this.calculateRatingSummary(professor.id)),
      })),
    );
  }

  async findOne(id: string): Promise<Professor & { averageScore: number; ratingsCount: number }> {
    const professor = await this.professorsRepository.findOne({ where: { id } });
    if (!professor) {
      throw new NotFoundException(`Professor with id ${id} not found`);
    }

    return { ...professor, ...(await this.calculateRatingSummary(id)) };
  }

  async update(id: string, updateProfessorDto: UpdateProfessorDto): Promise<Professor> {
    const professor = await this.professorsRepository.preload({ id, ...updateProfessorDto });
    if (!professor) {
      throw new NotFoundException(`Professor with id ${id} not found`);
    }

    return this.professorsRepository.save(professor);
  }

  async remove(id: string): Promise<void> {
    const professor = await this.professorsRepository.findOne({ where: { id } });
    if (!professor) {
      throw new NotFoundException(`Professor with id ${id} not found`);
    }

    await this.professorsRepository.remove(professor);
  }

  private async calculateRatingSummary(professorId: string): Promise<{ averageScore: number; ratingsCount: number }> {
    const rawResult = await this.ratingsRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.professorId = :professorId', { professorId })
      .getRawOne<{ average: string | null; count: string } | undefined>();

    const averageScore = rawResult?.average ? Number(parseFloat(rawResult.average).toFixed(2)) : 0;
    const ratingsCount = rawResult?.count ? Number(rawResult.count) : 0;

    return { averageScore, ratingsCount };
  }
}
