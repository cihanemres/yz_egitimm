"use server";

import { prisma } from "@/utils/prisma";
import { ai } from "@/utils/gemini";
import { auth } from "@/auth";

export async function generateQuestionsAction(topic: string, gradeLevel: string) {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") throw new Error("Yetkisiz erişim.");

  const prompt = `
  Sen bir ${gradeLevel} Bilişim Teknolojileri öğretmenisin. Konu: "${topic}".
  Öğrencilerine yönelteceğin 3 adet açık uçlu soru ve her bir soru için değerlendirme kriteri (rubric) oluşturmanı istiyorum.
  
  Sorular, öğrencilerin sadece ezber bilgilerini değil, eleştirel düşünme ve problem çözme becerilerini ölçecek nitelikte olmalıdır. 
  Lütfen yanıtı JSON formatında ver. Başka bir metin ekleme.
  
  Beklenen JSON formatı:
  {
    "questions": [
      {
        "text": "Soru metni",
        "rubric": "Bu soruya verilecek cevabın değerlendirme kriterleri",
        "maxScore": 10
      }
    ]
  }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  const result = JSON.parse(response.text || "{}");
  return result.questions || [];
}

export async function createExamAction(data: any) {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") return { error: "Yetkisiz erişim." };

  try {
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        topic: data.topic,
        gradeLevel: data.gradeLevel,
        isPublished: true,
        teacherId: session.user.id,
        questions: {
          create: data.questions.map((q: any, index: number) => ({
            text: q.text,
            rubric: q.rubric,
            order: index
          }))
        }
      }
    });
    return { success: true, examId: exam.id };
  } catch (error) {
    return { error: "Kaydedilirken hata oluştu." };
  }
}

export async function submitExamAction(examId: string, answers: { questionId: string, responseText: string }[]) {
  const session = await auth();
  if (session?.user?.role !== "STUDENT") return { error: "Yetkisiz erişim." };

  try {
    const questions = await prisma.question.findMany({ where: { examId } });
    
    let totalScore = 0;
    const evaluatedAnswers = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const prompt = `
      Sen bir uzmansın. Aşağıdaki açık uçlu soruya öğrencinin verdiği cevabı değerlendireceksin.
      Soru: "${question.text}"
      Beklenen Değerlendirme Kriteri (Rubrik): "${question.rubric}"
      Öğrencinin Cevabı: "${answer.responseText}"

      Lütfen bu cevaba 0 ile 100 arasında bir puan ver ve öğrenciye cesaretlendirici, yapıcı ve kısa bir geri bildirim yaz.
      
      Yanıtı JSON formatında ver. 
      Format:
      {
        "score": 85,
        "feedback": "Kısa geri bildirim metni"
      }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || "{}");
      const score = typeof result.score === 'number' ? result.score : 0;
      totalScore += score;
      
      evaluatedAnswers.push({
        questionId: question.id,
        text: answer.responseText,
        score,
        feedback: result.feedback || "Değerlendirme yapılamadı."
      });
    }

    const avgScore = Math.round(totalScore / questions.length);

    const overallPrompt = `
    Öğrenci bir açık uçlu sınavı tamamladı. Ortalama puanı: ${avgScore}/100.
    Ona sınav genelindeki başarısını yorumlayan kısa, motive edici bir genel sonuç cümlesi yaz. 
    JSON döndür: { "overallFeedback": "cümle" }
    `;
    const overallResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: overallPrompt,
      config: { responseMimeType: "application/json" }
    });
    const overallResult = JSON.parse(overallResponse.text || "{}");

    const attempt = await prisma.attempt.create({
      data: {
        studentId: session.user.id,
        examId,
        completedAt: new Date(),
        totalScore: avgScore,
        feedback: overallResult.overallFeedback,
        answers: {
          create: evaluatedAnswers
        }
      }
    });

    return { success: true, attemptId: attempt.id };
  } catch (error) {
    return { error: "Sınav değerlendirilirken hata oluştu." };
  }
}
