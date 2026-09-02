import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = "Sen bir Bilişim Teknolojileri ve Yazılım öğretmenisin. Ortaokul öğrencilerine Türkçe, teşvik edici ve somut geri bildirim verirsin. Yalnızca geçerli JSON döndür.";

export async function generateQuestions(topic: string, gradeLevel: string, count: number) {
  const prompt = `${gradeLevel} düzeyindeki öğrenciler için "${topic}" konusunda ${count} adet açık uçlu soru üret.
Her soru için rubric (değerlendirme anahtarı) ve maxScore (maksimum puan, genellikle 10) belirle.
Aşağıdaki JSON dizisi formatında döndür:
[
  {
    "text": "Soru metni",
    "rubric": "Değerlendirme anahtarı detayları",
    "maxScore": 10
  }
]`;

  let retries = 1;
  while (retries >= 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
        }
      });
      
      const text = response.text || "[]";
      return JSON.parse(text);
    } catch (error) {
      if (retries === 0) throw new Error("Gemini ile soru üretilirken hata oluştu.");
      retries--;
    }
  }
}

export async function evaluateAnswer(question: string, rubric: string, maxScore: number, responseText: string) {
  const prompt = `Aşağıdaki soruyu ve rubriği kullanarak öğrencinin yanıtını değerlendir.
Eğer yanıt tamamen boşsa veya soruyla tamamen alakasızsa 0 puan ver.
Yanıt: "${responseText}"
Soru: "${question}"
Rubrik: "${rubric}"
Maksimum Puan: ${maxScore}

Aşağıdaki JSON formatında döndür:
{
  "score": Puan (Sayı),
  "feedback": "Öğrenciye yönelik kısa, yapıcı ve teşvik edici geri bildirim",
  "strengths": "Yanıtın güçlü yönleri",
  "improvements": "Geliştirilebilecek yönler"
}`;

  let retries = 1;
  while (retries >= 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
        }
      });
      
      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        feedback: parsed.feedback || "Değerlendirme yapılamadı.",
        strengths: parsed.strengths || "-",
        improvements: parsed.improvements || "-",
      };
    } catch (error) {
      if (retries === 0) {
        return {
          score: 0,
          feedback: "Değerlendirme sırasında bir hata oluştu.",
          strengths: "-",
          improvements: "Lütfen daha sonra tekrar deneyin.",
        };
      }
      retries--;
    }
  }
}

export async function generateOverallFeedback(answers: any[]) {
  const prompt = `Öğrencinin sınavdaki tüm sorulara verdiği yanıtların bir özetini değerlendir ve genel bir geri bildirim (3-4 cümle) yaz. Öğrenciyi motive et.
Yanıtlar: ${JSON.stringify(answers)}
Sadece aşağıdaki JSON formatında döndür:
{
  "overallFeedback": "Genel geri bildirim metni"
}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });
    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return parsed.overallFeedback || "Sınavı tamamladın, tebrikler!";
  } catch (error) {
    return "Sınavı tamamladın. Geri bildirim oluşturulurken hata oluştu.";
  }
}
