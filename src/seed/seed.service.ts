import { faker } from '@faker-js/faker';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Comment } from '../comments/entities/comment.entity';
import { UserRole } from '../common/enums/role.enum';
import { Professor } from '../professors/entities/professor.entity';
import { University } from '../universities/entities/university.entity';
import { User } from '../users/entities/user.entity';

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
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async executeSeed(force: boolean = true): Promise<{ message: string; data: any }> {
    this.logger.log('🌱 Iniciando seed de la base de datos...');

    try {
      // Verificar si ya existen datos (a menos que se fuerce el seed)
      const existingUsers = await this.userRepository.count();
      if (existingUsers > 0 && !force) {
        this.logger.log('La base de datos ya contiene datos. Omitiendo seed.');
        return {
          message: 'The database already contains data. .',
          data: { existingUsers }
        };
      }

      // Si force=true y hay datos, eliminarlos primero
      if (existingUsers > 0 && force) {
        this.logger.log('Eliminando datos existentes antes de crear nuevos...');
        await this.executeUnseed();
      }

      // Configuración de cantidades
      const counts = {
        users: 100,
        universities: 80,
        professors: 150,
        comments: 400,
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

      // 4. Crear comentarios (unificados con ratings)
      this.logger.log('Generando comentarios...');
      const commentsData: Partial<Comment>[] = [];
      const studentUsers = users.filter(u => u.role === UserRole.STUDENT);
      
      for (let i = 0; i < counts.comments; i++) {
        const student = this.pick(studentUsers);
        const professor = this.pick(professors);
        
        // 70% de probabilidad de tener rating, 30% solo comentario
        const hasRating = Math.random() < 0.7;
        
        commentsData.push({
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          rating: hasRating ? faker.number.int({ min: 1, max: 5 }) : undefined,
          professorId: professor.id,
          studentId: student.id,
        });
      }

      const comments = await this.commentRepository.save(commentsData);
      this.logger.log(`${comments.length} comentarios creados`);

      // Resumen final
      const [totalUsers, totalUniversities, totalProfessors, totalComments] = await Promise.all([
        this.userRepository.count(),
        this.universityRepository.count(),
        this.professorRepository.count(),
        this.commentRepository.count(),
      ]);

      this.logger.log('Seed completado exitosamente!');
      this.logger.log('Resumen de datos creados:');
      this.logger.log(`   - Usuarios: ${totalUsers}`);
      this.logger.log(`   - Universidades: ${totalUniversities}`);
      this.logger.log(`   - Profesores: ${totalProfessors}`);
      this.logger.log(`   - Comentarios: ${totalComments}`);
      this.logger.log('');
      this.logger.log('Credenciales del administrador:');
      this.logger.log('   Email: admin@example.com');
      this.logger.log('   Password: admin123');
      this.logger.log('');
      this.logger.log('Credenciales de usuarios normales:');
      this.logger.log('   Email: user0@example.com (hasta user99@example.com)');
      this.logger.log('   Password: password123');

      return {
        message: 'Seed ejecutado exitosamente',
        data: {
          admin: { id: users[0].id, email: 'admin@example.com' },
          universities: totalUniversities,
          professors: totalProfessors,
          students: totalUsers - 1, // -1 por el admin
          comments: totalComments,
        },
      };
    } catch (error) {
      this.logger.error('Error durante el seed:', error);
      throw error;
    }
  }

  async executeUnseed(): Promise<{ message: string }> {
    this.logger.log('🗑️ Iniciando unseed de la base de datos...');

    try {
      // Contar registros antes de eliminar
      const commentsCount = await this.commentRepository.count();
      const professorsCount = await this.professorRepository.count();
      const universitiesCount = await this.universityRepository.count();
      const usersCount = await this.userRepository.count();

      this.logger.log(`Encontrados: ${commentsCount} comentarios, ${professorsCount} profesores, ${universitiesCount} universidades, ${usersCount} usuarios`);

      // Si no hay datos, retornar éxito
      if (commentsCount === 0 && professorsCount === 0 && universitiesCount === 0 && usersCount === 0) {
        this.logger.log('No hay datos para eliminar');
        return { message: 'No hay datos para eliminar' };
      }

      // Eliminar comentarios primero (por las foreign keys)
      if (commentsCount > 0) {
        await this.commentRepository.query('DELETE FROM comments');
        this.logger.log(`${commentsCount} comentarios eliminados`);
      }

      // Eliminar profesores
      if (professorsCount > 0) {
        await this.professorRepository.query('DELETE FROM professors');
        this.logger.log(`${professorsCount} profesores eliminados`);
      }

      // Eliminar universidades
      if (universitiesCount > 0) {
        await this.universityRepository.query('DELETE FROM universities');
        this.logger.log(`${universitiesCount} universidades eliminadas`);
      }

      // Eliminar todos los usuarios (incluyendo admin y estudiantes)
      if (usersCount > 0) {
        await this.userRepository.query('DELETE FROM users');
        this.logger.log(`${usersCount} usuarios eliminados`);
      }

      this.logger.log('Unseed completado exitosamente!');
      return { message: 'Unseed ejecutado exitosamente' };
    } catch (error) {
      this.logger.error('Error durante el unseed:', error);
      throw error;
    }
  }
}
