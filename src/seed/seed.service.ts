import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { University } from '../universities/entities/university.entity';
import { Professor } from '../professors/entities/professor.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async executeSeed(): Promise<void> {
    this.logger.log('🌱 Iniciando seed de la base de datos...');

    try {
      // Verificar si ya existen datos
      const existingUsers = await this.userRepository.count();
      if (existingUsers > 0) {
        this.logger.log('La base de datos ya contiene datos. Omitiendo seed.');
        return;
      }

      // Configuración de cantidades
      const counts = {
        users: 100,
        universities: 80,
        professors: 150,
        ratings: 400,
      };

      // 1. Crear usuarios (incluyendo admin)
      this.logger.log('Generando usuarios...');
      const usersData: Partial<User>[] = [];

      // Admin con credenciales específicas
      const adminPassword = await bcrypt.hash('admin123', 10);
      usersData.push({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: UserRole.ADMIN,
      });

      // Usuarios normales (estudiantes)
      const normalPassword = await bcrypt.hash('password123', 10);
      for (let i = 0; i < counts.users; i++) {
        usersData.push({
          name: faker.person.fullName(),
          email: `user${i}@example.com`,
          password: normalPassword,
          role: UserRole.STUDENT,
        });
      }

      const users = await this.userRepository.save(usersData);
      this.logger.log(`${users.length} usuarios creados`);

      // 2. Crear universidades
      this.logger.log('Generando universidades...');
      const universitiesData: Partial<University>[] = [];
      for (let i = 0; i < counts.universities; i++) {
        universitiesData.push({
          name: `${faker.company.name()} University ${i}`,
          country: faker.location.country(),
          city: faker.location.city(),
        });
      }

      const universities = await this.universityRepository.save(universitiesData);
      this.logger.log(`${universities.length} universidades creadas`);

      // 3. Crear profesores
      this.logger.log('Generando profesores...');
      const professorsData: Partial<Professor>[] = [];
      for (let i = 0; i < counts.professors; i++) {
        const university = this.pick(universities);
        professorsData.push({
          name: faker.person.fullName(),
          department: faker.commerce.department(),
          universityId: university.id,
        });
      }

      const professors = await this.professorRepository.save(professorsData);
      this.logger.log(`${professors.length} profesores creados`);

      // 4. Crear calificaciones (ratings)
      this.logger.log('Generando calificaciones...');
      const ratingsData: Partial<Rating>[] = [];
      const studentUsers = users.filter(u => u.role === UserRole.STUDENT);
      
      for (let i = 0; i < counts.ratings; i++) {
        const student = this.pick(studentUsers);
        const professor = this.pick(professors);
        ratingsData.push({
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentences({ min: 1, max: 3 }),
          professorId: professor.id,
          studentId: student.id,
        });
      }

      const ratings = await this.ratingRepository.save(ratingsData);
      this.logger.log(`${ratings.length} calificaciones creadas`);

      // Resumen final
      const [totalUsers, totalUniversities, totalProfessors, totalRatings] = await Promise.all([
        this.userRepository.count(),
        this.universityRepository.count(),
        this.professorRepository.count(),
        this.ratingRepository.count(),
      ]);

      this.logger.log('Seed completado exitosamente!');
      this.logger.log('Resumen de datos creados:');
      this.logger.log(`   - Usuarios: ${totalUsers}`);
      this.logger.log(`   - Universidades: ${totalUniversities}`);
      this.logger.log(`   - Profesores: ${totalProfessors}`);
      this.logger.log(`   - Calificaciones: ${totalRatings}`);
      this.logger.log('');
      this.logger.log('Credenciales del administrador:');
      this.logger.log('   Email: admin@example.com');
      this.logger.log('   Password: admin123');
      this.logger.log('');
      this.logger.log('Credenciales de usuarios normales:');
      this.logger.log('   Email: user0@example.com (hasta user99@example.com)');
      this.logger.log('   Password: password123');
    } catch (error) {
      this.logger.error('Error durante el seed:', error);
      throw error;
    }
  }
}
