import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'ogretmen@test.com' },
    update: {},
    create: {
      email: 'ogretmen@test.com',
      name: 'Öğretmen Ali',
      passwordHash,
      role: 'TEACHER',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'ogrenci1@test.com' },
    update: {},
    create: {
      email: 'ogrenci1@test.com',
      name: 'Öğrenci Ayşe',
      passwordHash,
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'ogrenci2@test.com' },
    update: {},
    create: {
      email: 'ogrenci2@test.com',
      name: 'Öğrenci Mehmet',
      passwordHash,
      role: 'STUDENT',
    },
  });

  const existingExam = await prisma.exam.findFirst({ where: { title: "Algoritma ve Problem Çözme" } });
  
  if (!existingExam) {
    await prisma.exam.create({
      data: {
        title: "Algoritma ve Problem Çözme",
        topic: "Algoritma",
        gradeLevel: "6. Sınıf",
        description: "Algoritma, değişkenler ve karar yapıları üzerine açık uçlu test.",
        isPublished: true,
        teacherId: teacher.id,
        questions: {
          create: [
            {
              text: "Algoritma nedir? Kendi cümlelerinle açıkla ve günlük hayattan bir örnek ver.",
              rubric: "Algoritmanın 'bir problemi çözmek için izlenen sıralı adımlar' olduğu belirtilmeli (5 puan). Günlük hayattan uygun bir örnek verilmeli, örn. yemek tarifi, diş fırçalama (5 puan).",
              maxScore: 10,
              order: 1
            },
            {
              text: "Akış şemasında elmas (karar) sembolü ne işe yarar? Bir örnekle açıkla.",
              rubric: "Karar sembolünün evet/hayır veya doğru/yanlış şeklinde dallanma sağladığı belirtilmeli (5 puan). Uygun bir örnek verilmeli, örn. 'Yağmur yağıyor mu?' (5 puan).",
              maxScore: 10,
              order: 2
            },
            {
              text: "Bir programda 'değişken' ne demektir? Neden kullanırız?",
              rubric: "Değişkenin veri saklayan, adı olan bir bellek alanı olduğu belirtilmeli (5 puan). Verinin değişebilmesi / tekrar kullanılabilmesi gibi bir kullanım gerekçesi verilmeli (5 puan).",
              maxScore: 10,
              order: 3
            },
            {
              text: "Döngü (tekrar) yapısı nedir? Hangi durumlarda kullanılır, bir örnek ver.",
              rubric: "Döngünün bir işlem grubunu belirli koşula veya sayıya kadar tekrarlattığı belirtilmeli (5 puan). Uygun bir örnek verilmeli, örn. 1'den 10'a kadar sayma (5 puan).",
              maxScore: 10,
              order: 4
            }
          ]
        }
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
