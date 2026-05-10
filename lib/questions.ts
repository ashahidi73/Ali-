export type AssessmentQuestion = {
  id: string;
  label: string;
  category: string;
};

export type ProgramCharacteristic = {
  id: string;
  label: string;
};

export const assessmentSections: { key: string; title: string; description: string; questions: AssessmentQuestion[] }[] = [
  {
    key: "content",
    title: "جودة المحتوى والرسالة",
    description: "يقيس وضوح الرسالة، دقة المعلومات، وملاءمة المحتوى للجمهور اليمني.",
    questions: [
      { id: "content_accuracy", label: "دقة المعلومات والتحقق من مصادرها", category: "جودة المحتوى" },
      { id: "content_relevance", label: "ارتباط البرامج باحتياجات المجتمع المحلي", category: "جودة المحتوى" },
      { id: "content_balance", label: "التوازن والحياد في تناول القضايا العامة", category: "جودة المحتوى" },
    ],
  },
  {
    key: "production",
    title: "الإنتاج والتقديم",
    description: "يركز على جودة الصوت، الإخراج، أداء المذيعين، وإدارة الوقت.",
    questions: [
      { id: "production_audio", label: "وضوح الصوت واستقرار البث", category: "الإنتاج والتقديم" },
      { id: "production_presenters", label: "احترافية المذيعين وقدرتهم على التفاعل", category: "الإنتاج والتقديم" },
      { id: "production_format", label: "تنوع القوالب الإذاعية وجاذبية الإخراج", category: "الإنتاج والتقديم" },
    ],
  },
  {
    key: "audience",
    title: "الجمهور والأثر",
    description: "يتناول مشاركة الجمهور، الشمول، والأثر التنموي للمحطة.",
    questions: [
      { id: "audience_engagement", label: "مستوى تفاعل الجمهور عبر الاتصالات والمنصات الرقمية", category: "الجمهور والأثر" },
      { id: "audience_inclusion", label: "تمثيل النساء والشباب والفئات المهمشة", category: "الجمهور والأثر" },
      { id: "audience_impact", label: "الأثر المجتمعي والتنموي للبرامج", category: "الجمهور والأثر" },
    ],
  },
  {
    key: "governance",
    title: "الإدارة والاستدامة",
    description: "يفحص التخطيط التحريري، الالتزام المهني، واستدامة الموارد.",
    questions: [
      { id: "governance_policy", label: "وجود سياسة تحريرية واضحة ومعلنة", category: "الإدارة والاستدامة" },
      { id: "governance_ethics", label: "الالتزام بمدونات السلوك وأخلاقيات العمل الإعلامي", category: "الإدارة والاستدامة" },
      { id: "governance_sustainability", label: "قدرة المحطة على الاستدامة المالية والتقنية", category: "الإدارة والاستدامة" },
    ],
  },
];

export const programCharacteristics: ProgramCharacteristic[] = [
  { id: "has_news_bulletins", label: "نشرات إخبارية منتظمة" },
  { id: "has_live_call_ins", label: "برامج تفاعلية مباشرة" },
  { id: "has_women_programs", label: "برامج موجهة للنساء" },
  { id: "has_youth_programs", label: "برامج للشباب" },
  { id: "has_public_service", label: "رسائل خدمة عامة وتوعية" },
  { id: "has_local_dialects", label: "استخدام اللهجات المحلية" },
];

export const allQuestions = assessmentSections.flatMap((section) => section.questions);
