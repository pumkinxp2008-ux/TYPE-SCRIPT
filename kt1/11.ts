type Hobby = "спорт" | "танцы" | "игры" | "музыка";
type Extra = "рисование" | "математика" | "кружок шахмат" | "театр";
type Facultative = Hobby | Extra;
type Age = 16 | 17 | 18 | 19;
type Group = "A" | "B" | "C";

class StudentClass {
  name: string;
  age: Age;
  facultative: Facultative;
  group: Group;

  constructor(name: string, age: Age, facultative: Facultative, group: Group) {
    this.name = name;
    this.age = age;
    this.facultative = facultative;
    this.group = group;
  }

  info(): string {
    return `${this.name}, ${this.age} лет, группа ${this.group}, факультатив: ${this.facultative}`;
  }
}

class School {
  students: StudentClass[] = [];

  addStudent(student: StudentClass): void {
    this.students.push(student);
  }

  listNames(): string[] {
    return this.students.map((s) => s.name);
  }

  countByFacultative(f: Facultative): number {
    return this.students.filter((s) => s.facultative === f).length;
  }
}

const school = new School();
school.addStudent(new StudentClass("Иван", 17, "спорт", "A"));
school.addStudent(new StudentClass("Мария", 18, "математика", "B"));
school.addStudent(new StudentClass("Алексей", 16, "спорт", "C"));
school.addStudent(new StudentClass("Дарья", 19, "музыка", "A"));

console.log("на спорте:", school.countByFacultative("спорт"));       // 2
console.log("на математике:", school.countByFacultative("математика")); // 1
