import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_SIFRE = '123456';
const TEST_SIFRE = 'test123';

async function main() {
  console.log('Seed başlıyor...');

  const passwordHash = await bcrypt.hash(DEMO_SIFRE, 10);
  const testHash = await bcrypt.hash(TEST_SIFRE, 10);

  // 1 öğretmen
  const ogretmen = await prisma.user.upsert({
    where: { email: 'ogretmen@test.com' },
    update: {},
    create: {
      name: 'Ayşe Öğretmen',
      email: 'ogretmen@test.com',
      passwordHash,
      role: Role.TEACHER,
    },
  });

  // 2 öğrenci
  await prisma.user.upsert({
    where: { email: 'ogrenci1@test.com' },
    update: {},
    create: {
      name: 'Elif Yılmaz',
      email: 'ogrenci1@test.com',
      passwordHash,
      role: Role.STUDENT,
    },
  });

  await prisma.user.upsert({
    where: { email: 'ogrenci2@test.com' },
    update: {},
    create: {
      name: 'Mert Demir',
      email: 'ogrenci2@test.com',
      passwordHash,
      role: Role.STUDENT,
    },
  });

  // Hızlı deneme hesabı
  await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: { passwordHash: testHash },
    create: {
      name: 'Test Kullanıcısı',
      email: 'test@test.com',
      passwordHash: testHash,
      role: Role.TEACHER,
    },
  });

  // Hazır test — daha önce eklenmişse tekrar ekleme
  const mevcut = await prisma.exam.findFirst({
    where: { title: 'Algoritma ve Problem Çözme', teacherId: ogretmen.id },
  });

  if (!mevcut) {
    await prisma.exam.create({
      data: {
        title: 'Algoritma ve Problem Çözme',
        topic: 'Algoritma',
        gradeLevel: '6. Sınıf',
        description:
          'Algoritma, akış şeması, değişken ve döngü kavramlarını ölçen açık uçlu değerlendirme testi.',
        isPublished: true,
        teacherId: ogretmen.id,
        questions: {
          create: [
            {
              order: 1,
              maxScore: 10,
              text: 'Algoritma nedir? Kendi cümlelerinle açıkla ve günlük hayattan bir örnek ver.',
              rubric:
                "Algoritmanın 'bir problemi çözmek için izlenen sıralı adımlar' olduğu belirtilmeli (5 puan). Günlük hayattan uygun bir örnek verilmeli, örn. yemek tarifi, diş fırçalama (5 puan).",
            },
            {
              order: 2,
              maxScore: 10,
              text: 'Akış şemasında elmas (karar) sembolü ne işe yarar? Bir örnekle açıkla.',
              rubric:
                "Karar sembolünün evet/hayır veya doğru/yanlış şeklinde dallanma sağladığı belirtilmeli (5 puan). Uygun bir örnek verilmeli, örn. 'Yağmur yağıyor mu?' (5 puan).",
            },
            {
              order: 3,
              maxScore: 10,
              text: "Bir programda 'değişken' ne demektir? Neden kullanırız?",
              rubric:
                'Değişkenin veri saklayan, adı olan bir bellek alanı olduğu belirtilmeli (5 puan). Verinin değişebilmesi / tekrar kullanılabilmesi gibi bir kullanım gerekçesi verilmeli (5 puan).',
            },
            {
              order: 4,
              maxScore: 10,
              text: 'Döngü (tekrar) yapısı nedir? Hangi durumlarda kullanılır, bir örnek ver.',
              rubric:
                "Döngünün bir işlem grubunu belirli koşula veya sayıya kadar tekrarlattığı belirtilmeli (5 puan). Uygun bir örnek verilmeli, örn. 1'den 10'a kadar sayma (5 puan).",
            },
          ],
        },
      },
    });
    console.log('Hazır test oluşturuldu: Algoritma ve Problem Çözme');
  } else {
    console.log('Hazır test zaten mevcut, atlandı.');
  }

  console.log('Seed tamamlandı.');
  console.log('  Öğretmen : ogretmen@test.com / 123456');
  console.log('  Öğrenci 1: ogrenci1@test.com / 123456');
  console.log('  Öğrenci 2: ogrenci2@test.com / 123456');
  console.log('  Test     : test@test.com / test123 (öğretmen)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
