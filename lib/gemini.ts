import 'server-only';

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

// Google, gemini-2.5-flash'i yeni API anahtarlarına kapattı (çağrı 404 döner).
// Gerekirse GEMINI_MODEL ile değiştirilebilir, örn. gemini-flash-latest.
const MODEL_ADI = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';

const SISTEM_YONERGESI =
  'Sen bir Bilişim Teknolojileri ve Yazılım öğretmenisin. Ortaokul öğrencilerine Türkçe, teşvik edici ve somut geri bildirim verirsin. Yalnızca geçerli JSON döndür.';

/** Kullanıcıya gösterilebilecek, anlaşılır hata tipi. */
export class GeminiHatasi extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiHatasi';
  }
}

function modelAl(): GenerativeModel {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiHatasi(
      'Yapay zeka servisi yapılandırılmamış. Lütfen sunucu ayarlarında GEMINI_API_KEY değerini tanımlayın.'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: MODEL_ADI,
    systemInstruction: SISTEM_YONERGESI,
  });
}

/** Modelden gelen metni JSON'a çevirir; olası kod bloğu işaretlerini temizler. */
function jsonAyristir<T>(ham: string): T {
  let metin = ham.trim();

  if (metin.startsWith('`')) {
    metin = metin
      .replace(/^`{3}(?:json)?\s*/i, '')
      .replace(/`{3}\s*$/, '')
      .trim();
  }

  // Modelin JSON dışına metin eklemesine karşı koruma
  const ilkKoseli = metin.indexOf('[');
  const ilkSuslu = metin.indexOf('{');
  const baslangic =
    ilkKoseli === -1 ? ilkSuslu : ilkSuslu === -1 ? ilkKoseli : Math.min(ilkKoseli, ilkSuslu);
  if (baslangic > 0) metin = metin.slice(baslangic);

  const sonKoseli = metin.lastIndexOf(']');
  const sonSuslu = metin.lastIndexOf('}');
  const bitis = Math.max(sonKoseli, sonSuslu);
  if (bitis !== -1 && bitis < metin.length - 1) metin = metin.slice(0, bitis + 1);

  return JSON.parse(metin) as T;
}

/**
 * Gemini'ye JSON modunda istek atar. Başarısız olursa bir kez yeniden dener.
 */
async function jsonUret<T>(prompt: string, hataMesaji: string): Promise<T> {
  const model = modelAl();

  let sonHata: unknown = null;

  for (let deneme = 0; deneme < 2; deneme++) {
    try {
      const sonuc = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: 4096,
        },
      });

      const metin = sonuc.response.text();
      if (!metin) throw new Error('Boş yanıt');

      return jsonAyristir<T>(metin);
    } catch (hata) {
      sonHata = hata;
      // Kısa bir bekleme sonrası tek seferlik yeniden deneme
      if (deneme === 0) await new Promise((r) => setTimeout(r, 800));
    }
  }

  console.error('[Gemini] İstek başarısız:', sonHata);
  throw new GeminiHatasi(hataMesaji);
}

/* ------------------------------------------------------------------ */
/* Tipler                                                              */
/* ------------------------------------------------------------------ */

export type UretilenSoru = {
  text: string;
  rubric: string;
  maxScore: number;
};

export type Degerlendirme = {
  score: number;
  feedback: string;
  strengths: string;
  improvements: string;
};

/* ------------------------------------------------------------------ */
/* 1) Soru üretimi                                                     */
/* ------------------------------------------------------------------ */

export async function generateQuestions(
  topic: string,
  gradeLevel: string,
  count: number
): Promise<UretilenSoru[]> {
  const prompt = `Bilişim Teknolojileri ve Yazılım dersi için ${gradeLevel} seviyesine uygun, "${topic}" konusunda ${count} adet AÇIK UÇLU sınav sorusu hazırla.

Kurallar:
- Sorular Türkçe ve öğrenci seviyesine uygun olmalı.
- Her soru açık uçlu olmalı; çoktan seçmeli, doğru/yanlış veya boşluk doldurma OLMAMALI.
- Her soru için ayrıntılı bir puanlama rubriği yaz. Rubrik, hangi ölçütün kaç puan getirdiğini açıkça belirtsin (toplam 10 puan).
- Sorular birbirinden farklı alt kavramları ölçsün.

Yanıtı SADECE şu yapıda geçerli bir JSON dizisi olarak döndür:
[
  { "text": "soru metni", "rubric": "puanlama rubriği", "maxScore": 10 }
]`;

  const veri = await jsonUret<unknown>(
    prompt,
    'Sorular üretilirken bir sorun oluştu. Lütfen birkaç saniye sonra tekrar deneyin.'
  );

  if (!Array.isArray(veri)) {
    throw new GeminiHatasi('Yapay zeka beklenen biçimde soru üretemedi. Lütfen tekrar deneyin.');
  }

  const sorular: UretilenSoru[] = veri
    .map((ham) => {
      const s = ham as Partial<UretilenSoru>;
      return {
        text: String(s.text ?? '').trim(),
        rubric: String(s.rubric ?? '').trim(),
        maxScore:
          Number.isFinite(Number(s.maxScore)) && Number(s.maxScore) > 0
            ? Math.round(Number(s.maxScore))
            : 10,
      };
    })
    .filter((s) => s.text.length > 0 && s.rubric.length > 0);

  if (sorular.length === 0) {
    throw new GeminiHatasi('Yapay zeka geçerli bir soru üretemedi. Lütfen tekrar deneyin.');
  }

  return sorular.slice(0, count);
}

/* ------------------------------------------------------------------ */
/* 2) Yanıt değerlendirme                                              */
/* ------------------------------------------------------------------ */

export async function evaluateAnswer(
  question: string,
  rubric: string,
  maxScore: number,
  responseText: string
): Promise<Degerlendirme> {
  const yanit = (responseText ?? '').trim();

  // Boş yanıt için modele gitmeye gerek yok: kural gereği 0 puan.
  if (yanit.length === 0) {
    return {
      score: 0,
      feedback:
        'Bu soruya yanıt vermemişsin. Bir sonraki sefere bildiğin kadarıyla da olsa yazmayı dene; kısmi puan alabilirsin.',
      strengths: 'Yanıt verilmediği için değerlendirilecek bir yön bulunamadı.',
      improvements:
        'Soruyu dikkatlice oku, anahtar kavramı kendi cümlelerinle tanımla ve bir örnek ekle.',
    };
  }

  const prompt = `Aşağıdaki açık uçlu soruya bir ortaokul öğrencisinin verdiği yanıtı, verilen rubriğe SIKI SIKIYA bağlı kalarak puanla.

SORU:
${question}

PUANLAMA RUBRİĞİ:
${rubric}

TAM PUAN: ${maxScore}

ÖĞRENCİ YANITI:
${yanit}

Kurallar:
- Puan 0 ile ${maxScore} arasında olmalı. Yarım puan verebilirsin.
- Rubrikteki her ölçüt için karşılığı olan puanı ver; rubrikte olmayan bir şeyi puanlama.
- Yanıt boşsa, anlamsızsa veya soruyla ilgisizse puan 0 olmalı.
- Geri bildirim Türkçe, teşvik edici, somut ve öğrenci seviyesine uygun olmalı.
- "feedback" 2-3 cümle olsun ve puanın neden verildiğini açıklasın.
- "strengths" yanıtın doğru/iyi yönlerini 1-2 cümlede belirtsin.
- "improvements" yanıtın nasıl geliştirilebileceğini 1-2 cümlede somut olarak söylesin.

Yanıtı SADECE şu yapıda geçerli bir JSON nesnesi olarak döndür:
{ "score": 0, "feedback": "...", "strengths": "...", "improvements": "..." }`;

  const veri = await jsonUret<Partial<Degerlendirme>>(
    prompt,
    'Yanıtın değerlendirilmesi sırasında bir sorun oluştu. Lütfen tekrar deneyin.'
  );

  const hamPuan = Number(veri.score);
  const puan = Number.isFinite(hamPuan) ? Math.min(Math.max(hamPuan, 0), maxScore) : 0;

  return {
    score: Math.round(puan * 2) / 2,
    feedback: String(veri.feedback ?? 'Geri bildirim oluşturulamadı.').trim(),
    strengths: String(veri.strengths ?? '-').trim(),
    improvements: String(veri.improvements ?? '-').trim(),
  };
}

/* ------------------------------------------------------------------ */
/* 3) Genel değerlendirme                                              */
/* ------------------------------------------------------------------ */

export type GenelGirdi = {
  question: string;
  responseText: string;
  score: number;
  maxScore: number;
};

export async function generateOverallFeedback(answers: GenelGirdi[]): Promise<string> {
  const toplam = answers.reduce((t, a) => t + a.score, 0);
  const tamPuan = answers.reduce((t, a) => t + a.maxScore, 0);

  const ozet = answers
    .map(
      (a, i) =>
        `${i + 1}. Soru: ${a.question}\n   Alınan puan: ${a.score}/${a.maxScore}\n   Öğrenci yanıtı: ${
          a.responseText.trim() || '(boş bırakılmış)'
        }`
    )
    .join('\n\n');

  const prompt = `Bir ortaokul öğrencisinin Bilişim Teknolojileri ve Yazılım dersi açık uçlu testindeki tüm yanıtları aşağıdadır.

${ozet}

TOPLAM: ${toplam}/${tamPuan}

Bu öğrenciye 3-4 cümlelik genel bir değerlendirme yaz. Türkçe, teşvik edici ve somut olsun: genel başarı düzeyine değin, en iyi olduğu noktayı vurgula ve çalışması gereken 1-2 konuyu açıkça söyle. Öğrenciye doğrudan "sen" diye hitap et.

Yanıtı SADECE şu yapıda geçerli bir JSON nesnesi olarak döndür:
{ "overallFeedback": "..." }`;

  try {
    const veri = await jsonUret<{ overallFeedback?: string }>(
      prompt,
      'Genel değerlendirme oluşturulamadı.'
    );
    const metin = String(veri.overallFeedback ?? '').trim();
    if (metin) return metin;
  } catch (hata) {
    console.error('[Gemini] Genel değerlendirme başarısız:', hata);
  }

  // Genel değerlendirme kritik değil: başarısız olursa yedek metin üretilir.
  const yuzde = tamPuan > 0 ? Math.round((toplam / tamPuan) * 100) : 0;
  return `Testi ${toplam}/${tamPuan} puanla tamamladın (%${yuzde}). Soru bazındaki geri bildirimleri okuyarak eksik kalan noktaları gözden geçirebilirsin.`;
}
