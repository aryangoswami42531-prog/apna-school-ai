// 11 Supported Languages & Locale Mapping for Web Speech API

export const SUPPORTED_LANGUAGES = [
  { id: "English", name: "English", native: "English", speechLocale: "en-US" },
  { id: "Hindi", name: "Hindi", native: "हिन्दी", speechLocale: "hi-IN" },
  { id: "Tamil", name: "Tamil", native: "தமிழ்", speechLocale: "ta-IN" },
  { id: "Telugu", name: "Telugu", native: "తెలుగు", speechLocale: "te-IN" },
  { id: "Marathi", name: "Marathi", native: "मराठी", speechLocale: "mr-IN" },
  { id: "Bengali", name: "Bengali", native: "বাংলা", speechLocale: "bn-IN" },
  { id: "Gujarati", name: "Gujarati", native: "ગુજરાતી", speechLocale: "gu-IN" },
  { id: "Punjabi", name: "Punjabi", native: "ਪੰਜਾਬੀ", speechLocale: "pa-IN" },
  { id: "Kannada", name: "Kannada", native: "கன்னட", speechLocale: "kn-IN" },
  { id: "Malayalam", name: "Malayalam", native: "മലയാളം", speechLocale: "ml-IN" },
  { id: "Urdu", name: "Urdu", native: "اردو", speechLocale: "ur-PK" }
];

export const UI_TRANSLATIONS = {
  English: {
    appTitle: "XYZ AI Assistant",
    appSubtitle: "Autonomous School ERP Intelligence",
    selectRole: "Switch Active Role Context",
    securityStatus: "Security Guardrails Active",
    placeholder: "Ask XYZ AI about attendance, records, or request assistance...",
    send: "Send",
    listening: "Listening...",
    escalateBtn: "Request Teacher Call",
    confirmEscalationTitle: "Confirm Human Teacher Escalation",
    confirmEscalationBody: "Would you like XYZ AI to register an official call request with Ms. Manya?",
    yesConfirm: "Yes, Request Call",
    cancel: "Cancel",
    suggestedQueries: "Quick Actions:"
  },
  Hindi: {
    appTitle: "XYZ AI सहायक",
    appSubtitle: "स्वायत्त स्कूल ERP बुद्धिमत्ता",
    selectRole: "सक्रिय भूमिका बदलें",
    securityStatus: "सुरक्षा गार्डरेल्स सक्रिय",
    placeholder: "उपस्थिति, रिकॉर्ड या सहायता के लिए प्रश्न पूछें...",
    send: "भेजें",
    listening: "सुन रहा हूँ...",
    escalateBtn: "शिक्षक से संपर्क करें",
    confirmEscalationTitle: "शिक्षक कॉल अनुरोध की पुष्टि करें",
    confirmEscalationBody: "क्या आप चाहते हैं कि XYZ AI सुश्री मान्या के साथ आधिकारिक कॉल अनुरोध दर्ज करे?",
    yesConfirm: "हाँ, कॉल का अनुरोध करें",
    cancel: "रद्द करें",
    suggestedQueries: "त्वरित कार्रवाई:"
  }
};

export function getUIText(key, language = "English") {
  const dict = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;
  return dict[key] || UI_TRANSLATIONS.English[key] || key;
}
