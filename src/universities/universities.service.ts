import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { University } from './entities/university.entity';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University)
    private readonly universitiesRepository: Repository<University>,
  ) {}

  async create(createUniversityDto: CreateUniversityDto): Promise<University> {
    // Verificar si ya existe una universidad con el mismo nombre
    const existingUniversity = await this.universitiesRepository.findOne({
      where: { name: createUniversityDto.name }
    });

    if (existingUniversity) {
      throw new ConflictException('University with this name already exists');
    }

    const university = this.universitiesRepository.create(createUniversityDto);
    return this.universitiesRepository.save(university);
  }

  async findAll(): Promise<University[]> {
    return this.universitiesRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<University> {
    const university = await this.universitiesRepository.findOne({
      where: { id },
      relations: ['professors']
    });

    if (!university) {
      throw new NotFoundException(`University with ID ${id} not found`);
    }

    return university;
  }

  async update(id: string, updateUniversityDto: UpdateUniversityDto): Promise<University> {
    const university = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otra universidad con ese nombre
    if (updateUniversityDto.name && updateUniversityDto.name !== university.name) {
      const existingUniversity = await this.universitiesRepository.findOne({
        where: { name: updateUniversityDto.name }
      });

      if (existingUniversity) {
        throw new ConflictException('University with this name already exists');
      }
    }

    Object.assign(university, updateUniversityDto);
    return this.universitiesRepository.save(university);
  }

  async remove(id: string): Promise<void> {
    const university = await this.findOne(id);
    await this.universitiesRepository.remove(university);
  }
}
