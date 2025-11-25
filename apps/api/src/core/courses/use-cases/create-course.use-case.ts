import { Course } from '../../../core/courses/entities/course.entity';
import { ICourseRepo } from '../../../core/courses/interfaces/course.repo';

export class CreateCourseUseCase {
    constructor(private courseRepo: ICourseRepo) { }

    async execute(input: {
        name: string;
        code: string;
        period: string;
        groupNumber: number;
        professorId: string;
    }): Promise<Course> {
        const course = Course.create({
            name: input.name,
            code: input.code,
            period: input.period,
            groupNumber: input.groupNumber,
            professorId: input.professorId,
        });

        await this.courseRepo.save(course);
        return course;
    }
}
