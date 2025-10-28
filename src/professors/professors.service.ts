import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Professor } from './entities/professor.entity';

@Injectable()
export class ProfessorsService {
  constructor(
    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
  ) {}

  async create(createProfessorDto: CreateProfessorDto): Promise<Professor> {
    const professor = this.professorRepository.create({
      name: createProfessorDto.name,
      department: createProfessorDto.department,
      universityId: createProfessorDto.university,
    });
    return this.professorRepository.save(professor);
  }

  async findAll(universityId?: string, search?: string): Promise<Professor[]> {
    const queryBuilder = this.professorRepository
      .createQueryBuilder('professor')
      .leftJoinAndSelect('professor.university', 'university');

    if (universityId) {
      queryBuilder.andWhere('professor.universityId = :universityId', { universityId });
    }

    if (search) {
      queryBuilder.andWhere('professor.name ILIKE :search', { search: `%${search}%` });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({
      where: { id },
      relations: ['university'],
    });
    if (!professor) {
      throw new NotFoundException(`Professor with ID "${id}" not found`);
    }
    return professor;
  }

  async update(id: string, updateProfessorDto: UpdateProfessorDto): Promise<Professor> {
    const professor = await this.findOne(id);
    
    if (updateProfessorDto.name) {
      professor.name = updateProfessorDto.name;
    }
    if (updateProfessorDto.department) {
      professor.department = updateProfessorDto.department;
    }
    if (updateProfessorDto.university) {
      professor.universityId = updateProfessorDto.university;
    }

    return this.professorRepository.save(professor);
  }

  async remove(id: string): Promise<void> {
    const professor = await this.findOne(id);
    await this.professorRepository.remove(professor);
  }
}
