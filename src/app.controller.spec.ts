import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status ok', () => {
      const result = controller.getHealth();

      expect(result).toEqual({
        status: 'ok',
        message: 'Controller working!',
      });
    });

    it('should have status property', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('ok');
    });

    it('should have message property', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Controller working!');
    });
  });
});
