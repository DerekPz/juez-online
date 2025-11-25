import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCourseDto, EnrollStudentDto, AssignChallengeDto } from './dto/course.dto';
import { CreateCourseUseCase } from '../../core/courses/use-cases/create-course.use-case';
import { ListCoursesUseCase } from '../../core/courses/use-cases/list-courses.use-case';
import { EnrollStudentUseCase } from '../../core/courses/use-cases/enroll-student.use-case';
import { AssignChallengeUseCase } from '../../core/courses/use-cases/assign-challenge.use-case';
import { ICourseRepo } from '../../core/courses/interfaces/course.repo';
import { Inject } from '@nestjs/common';

@Controller('courses')
export class CoursesController {
    constructor(
        private createCourse: CreateCourseUseCase,
        private listCourses: ListCoursesUseCase,
        private enrollStudent: EnrollStudentUseCase,
        private assignChallenge: AssignChallengeUseCase,
        @Inject('CourseRepo') private courseRepo: ICourseRepo,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
        // Only professors and admins can create courses
        if (user.role !== 'professor' && user.role !== 'admin') {
            throw new Error('Only professors and admins can create courses');
        }

        const course = await this.createCourse.execute({
            name: dto.name,
            code: dto.code,
            period: dto.period,
            groupNumber: dto.groupNumber,
            professorId: user.userId,
        });

        return {
            id: course.id,
            name: course.name,
            code: course.code,
            period: course.period,
            groupNumber: course.groupNumber,
            professorId: course.professorId,
            createdAt: course.createdAt,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async list(@CurrentUser() user: any) {
        const courses = await this.listCourses.execute({
            userId: user.userId,
            role: user.role,
        });

        return courses.map((c) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            period: c.period,
            groupNumber: c.groupNumber,
            professorId: c.professorId,
            createdAt: c.createdAt,
        }));
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getOne(@Param('id') id: string, @CurrentUser() user: any) {
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        // Check access: professor owns it, student is enrolled, or admin
        if (user.role === 'student') {
            const students = await this.courseRepo.getStudents(id);
            if (!students.includes(user.userId)) {
                throw new Error('Not enrolled in this course');
            }
        } else if (user.role === 'professor' && course.professorId !== user.userId) {
            throw new Error('Not your course');
        }

        return {
            id: course.id,
            name: course.name,
            code: course.code,
            period: course.period,
            groupNumber: course.groupNumber,
            professorId: course.professorId,
            createdAt: course.createdAt,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/students')
    async enroll(@Param('id') id: string, @Body() dto: EnrollStudentDto, @CurrentUser() user: any) {
        // Only professor of the course or admin can enroll students
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        if (user.role === 'professor' && course.professorId !== user.userId) {
            throw new Error('Not your course');
        }

        if (user.role !== 'professor' && user.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        await this.enrollStudent.execute(id, dto.studentId);
        return { message: 'Student enrolled successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/students/:studentId')
    async unenroll(@Param('id') id: string, @Param('studentId') studentId: string, @CurrentUser() user: any) {
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        if (user.role === 'professor' && course.professorId !== user.userId) {
            throw new Error('Not your course');
        }

        if (user.role !== 'professor' && user.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        await this.courseRepo.removeStudent(id, studentId);
        return { message: 'Student removed successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/challenges')
    async assignChallengeToourse(@Param('id') id: string, @Body() dto: AssignChallengeDto, @CurrentUser() user: any) {
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        if (user.role === 'professor' && course.professorId !== user.userId) {
            throw new Error('Not your course');
        }

        if (user.role !== 'professor' && user.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        await this.assignChallenge.execute(id, dto.challengeId);
        return { message: 'Challenge assigned successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/students')
    async getStudents(@Param('id') id: string, @CurrentUser() user: any) {
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        const students = await this.courseRepo.getStudents(id);
        return { students };
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/challenges')
    async getChallenges(@Param('id') id: string, @CurrentUser() user: any) {
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        const challenges = await this.courseRepo.getChallenges(id);
        return { challenges };
    }
}
