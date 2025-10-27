import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { CreateProfessorDto } from '../professors/dto/create-professor.dto';
import { Professor } from '../professors/entities/professor.entity';
import { ProfessorsService } from '../professors/professors.service';
import { Rating } from '../ratings/entities/rating.entity';
import { RatingsService } from '../ratings/ratings.service';
import { UsersService } from '../users/users.service';
import { SeedService } from './seed.service';

describe('SeedService', () => {
  let service: SeedService;
  let usersService: jest.Mocked<UsersService>;
  let professorsService: jest.Mocked<ProfessorsService>;
  let ratingsService: jest.Mocked<RatingsService>;
  let professorsRepository: jest.Mocked<Repository<Professor>>;
  let ratingsRepository: jest.Mocked<Repository<Rating>>;

  const usersServiceMock = (): jest.Mocked<UsersService> => ({
    findByEmail: jest.fn(),
    create: jest.fn(),
  }) as unknown as jest.Mocked<UsersService>;

  const professorsServiceMock = (): jest.Mocked<ProfessorsService> => ({
    create: jest.fn(),
  }) as unknown as jest.Mocked<ProfessorsService>;

  const ratingsServiceMock = (): jest.Mocked<RatingsService> => ({
    create: jest.fn(),
  }) as unknown as jest.Mocked<RatingsService>;

  const professorsRepositoryMock = (): jest.Mocked<Repository<Professor>> => ({
    findOne: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Professor>>;

  const ratingsRepositoryMock = (): jest.Mocked<Repository<Rating>> => ({
    findOne: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Rating>>;

  beforeEach(() => {
    usersService = usersServiceMock();
    professorsService = professorsServiceMock();
    ratingsService = ratingsServiceMock();
    professorsRepository = professorsRepositoryMock();
    ratingsRepository = ratingsRepositoryMock();

    service = new SeedService(
      usersService,
      professorsService,
      ratingsService,
      professorsRepository as unknown as Repository<Professor>,
      ratingsRepository as unknown as Repository<Rating>,
    );
  });

  it('should seed default data when missing', async () => {
    usersService.findByEmail.mockResolvedValueOnce(null); // admin
    usersService.findByEmail.mockResolvedValueOnce(null); // student
    usersService.findByEmail.mockResolvedValue(null); // fallback
    usersService.create.mockImplementation(async (dto) => ({ id: dto.email, ...dto } as any));

    const professors: CreateProfessorDto[] = [
      { fullName: 'Dr. João Pereira', department: 'Engenharia de Software' },
      { fullName: 'Dra. Ana Costa', department: 'Ciência da Computação' },
      { fullName: 'Prof. Carlos Souza', department: 'Matemática' },
    ];

    professorsRepository.findOne.mockResolvedValue(null);
    professorsService.create.mockImplementation(async (dto) => ({ id: dto.fullName, ...dto } as any));

    ratingsRepository.findOne.mockResolvedValue(null);
    ratingsService.create.mockResolvedValue({} as any);

    const result = await service.runSeed();

    expect(usersService.create).toHaveBeenCalledTimes(2);
    expect(professorsService.create).toHaveBeenCalledTimes(professors.length);
    expect(ratingsService.create).toHaveBeenCalledTimes(professors.length);
    expect(result.adminEmail).toBe('admin@example.com');
    expect(result.studentEmail).toBe('student@example.com');
  });

  it('should reuse existing professors and ratings', async () => {
    const admin = { id: 'admin', email: 'admin@example.com', role: UserRole.ADMIN } as any;
    const student = { id: 'student', email: 'student@example.com', role: UserRole.STUDENT } as any;
    usersService.findByEmail.mockResolvedValueOnce(admin);
    usersService.findByEmail.mockResolvedValueOnce(student);

    const professor = { id: 'prof', fullName: 'Dr. João Pereira', department: 'Engenharia de Software' } as any;
    professorsRepository.findOne.mockResolvedValue(professor);
    ratingsRepository.findOne.mockResolvedValue({ id: 'rate', professor, student } as any);

    const result = await service.runSeed();

    expect(usersService.create).not.toHaveBeenCalled();
    expect(professorsService.create).not.toHaveBeenCalled();
    expect(ratingsService.create).not.toHaveBeenCalled();
    expect(result.professors.length).toBeGreaterThan(0);
  });
});
