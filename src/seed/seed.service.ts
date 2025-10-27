import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { CreateProfessorDto } from '../professors/dto/create-professor.dto';
import { Professor } from '../professors/entities/professor.entity';
import { ProfessorsService } from '../professors/professors.service';
import { RatingsService } from '../ratings/ratings.service';
import { UsersService } from '../users/users.service';
import { Rating } from '../ratings/entities/rating.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly usersService: UsersService,
    private readonly professorsService: ProfessorsService,
    private readonly ratingsService: RatingsService,
    @InjectRepository(Professor)
    private readonly professorsRepository: Repository<Professor>,
    @InjectRepository(Rating)
    private readonly ratingsRepository: Repository<Rating>,
  ) {}

  async runSeed() {
    const admin = await this.ensureUser({
      email: 'admin@example.com',
      password: 'Admin123',
      fullName: 'Administrador',
      role: UserRole.ADMIN,
    });

    const student = await this.ensureUser({
      email: 'student@example.com',
      password: 'Student123',
      fullName: 'Aluno Padrão',
      role: UserRole.STUDENT,
    });

    const professorsData: CreateProfessorDto[] = [
      {
        fullName: 'Dr. João Pereira',
        department: 'Engenharia de Software',
        bio: 'Especialista em arquitetura de software e testes automatizados.',
      },
      {
        fullName: 'Dra. Ana Costa',
        department: 'Ciência da Computação',
        bio: 'Pesquisa focada em inteligência artificial aplicada à educação.',
      },
      {
        fullName: 'Prof. Carlos Souza',
        department: 'Matemática',
        bio: 'Entusiasta de métodos numéricos e estatística aplicada.',
      },
    ];

    const professors = await Promise.all(professorsData.map((dto) => this.ensureProfessor(dto)));

    await Promise.all(
      professors.map((professor, index) =>
        this.ensureRating({
          professorId: professor.id,
          score: 4 + (index % 2),
          comment: `Avaliação automática ${index + 1}`,
        }, student.id),
      ),
    );

    return {
      adminEmail: admin.email,
      adminPassword: 'Admin123',
      studentEmail: student.email,
      studentPassword: 'Student123',
      professors: professors.map((professor) => ({
        id: professor.id,
        name: professor.fullName,
        department: professor.department,
      })),
    };
  }

  private async ensureUser(createUserDto: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
  }) {
    const existing = await this.usersService.findByEmail(createUserDto.email);
    if (existing) {
      return existing;
    }

    return this.usersService.create(createUserDto);
  }

  private async ensureProfessor(dto: CreateProfessorDto): Promise<Professor> {
    const existing = await this.professorsRepository.findOne({ where: { fullName: dto.fullName } });
    if (existing) {
      return existing;
    }

    return this.professorsService.create(dto);
  }

  private async ensureRating(
    rating: { professorId: string; score: number; comment?: string },
    studentId: string,
  ): Promise<void> {
    const existing = await this.ratingsRepository.findOne({
      where: {
        professor: { id: rating.professorId },
        student: { id: studentId },
      },
    });

    if (existing) {
      return;
    }

    await this.ratingsService.create(
      {
        professorId: rating.professorId,
        score: rating.score,
        comment: rating.comment,
      },
      studentId,
    );
  }
}
