// Utility to convert Devanagari Hindi student names to clean English script

const DEVANAGARI_NAME_MAP = {
  "रमन": "Raman",
  "रमन की": "Raman",
  "अमन": "Aman",
  "अमन की": "Aman",
  "राहुल": "Rahul",
  "अनन्या": "Ananya",
  "कबीर": "Kabir",
  "आर्यन": "Aryan",
  "कविता": "Kavita",
  "रोहन": "Rohan",
  "प्रिया": "Priya",
  "नेहा": "Neha",
  "पूजा": "Pooja",
  "अमित": "Amit",
  "सुमित": "Sumit",
  "विकास": "Vikas"
};

export function formatStudentNameInEnglish(rawName = "") {
  if (!rawName || typeof rawName !== "string") return "Student";
  const trimmed = rawName.trim();

  // 1. Direct map lookup check
  if (DEVANAGARI_NAME_MAP[trimmed]) {
    return DEVANAGARI_NAME_MAP[trimmed];
  }

  // 2. Strip possessive suffix "की" / "का"
  const cleanSuffix = trimmed.replace(/\s+(की|का)$/i, "").trim();
  if (DEVANAGARI_NAME_MAP[cleanSuffix]) {
    return DEVANAGARI_NAME_MAP[cleanSuffix];
  }

  // 3. Simple character-by-character Devanagari phonetics fallback if unknown Devanagari name
  const isDevanagari = /[\u0900-\u097F]/.test(cleanSuffix);
  if (isDevanagari) {
    const devToEng = {
      'अ': 'A', 'आ': 'Aa', 'इ': 'I', 'ई': 'Ee', 'उ': 'U', 'ऊ': 'Oo', 'ए': 'E', 'ऐ': 'Ai', 'ओ': 'O', 'औ': 'Au',
      'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ट': 't', 'ठ': 'th',
      'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n', 'प': 'p', 'फ': 'ph',
      'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's',
      'ह': 'h', 'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
      'ं': 'n', '्': ''
    };

    let result = "";
    for (let char of cleanSuffix) {
      result += devToEng[char] || char;
    }

    // Capitalize first letter
    return result ? result.charAt(0).toUpperCase() + result.slice(1) : cleanSuffix;
  }

  // 4. English name capitalization
  return cleanSuffix.charAt(0).toUpperCase() + cleanSuffix.slice(1);
}
