import type { Lang } from "./client-api";

/**
 * Every user-facing string, in English and Hindi. Hindi terms follow the vocabulary the official
 * Cane UP portal and the e-Ganna app use (e.g. सप्लाई टिकट, बेसिक कोटा, पक्ष योग).
 */
const L = {
  // app shell
  appTitle: { en: "caneup", hi: "caneup" },
  appSub: {
    en: "Supply tickets, payments, calendar and survey for Uttar Pradesh cane growers.",
    hi: "उत्तर प्रदेश के गन्ना किसानों के लिए सप्लाई टिकट, भुगतान, कैलेंडर और सर्वे।",
  },
  unofficial: { en: "Unofficial viewer", hi: "अनौपचारिक व्यूअर" },
  skip: { en: "Skip to main content", hi: "मुख्य सामग्री पर जाएं" },
  language: { en: "Language", hi: "भाषा" },
  visitors: { en: "Total visits", hi: "कुल विज़िट" },
  footer: {
    en: "Unofficial viewer. All data belongs to the Sugar Industry & Cane Development Department, Uttar Pradesh. Grower helpline (toll free):",
    hi: "अनौपचारिक व्यूअर। सारा डेटा चीनी उद्योग एवं गन्ना विकास विभाग, उत्तर प्रदेश का है। किसान हेल्पलाइन (टोल फ्री):",
  },

  // finder
  finderTitle: { en: "Find Your Account", hi: "अपना खाता खोजें" },
  savedTitle: { en: "Saved Farmers", hi: "सहेजे गए किसान" },
  season: { en: "Crushing season", hi: "पेराई सत्र" },
  district: { en: "District", hi: "जनपद" },
  factory: { en: "Sugar mill", hi: "चीनी मिल" },
  village: { en: "Village", hi: "गांव" },
  grower: { en: "Grower", hi: "कृषक" },
  select: { en: "Select…", hi: "चुनें…" },
  searchGrower: { en: "Type a name or code…", hi: "नाम या कोड लिखें…" },
  loading: { en: "Loading…", hi: "लोड हो रहा है…" },
  noMatches: {
    en: "No matches. Try fewer letters.",
    hi: "कोई नतीजा नहीं। कम अक्षर लिखकर देखें।",
  },
  noFactories: {
    en: "No sugar mills found in this district.",
    hi: "इस जनपद में कोई चीनी मिल नहीं मिली।",
  },
  noVillages: {
    en: "No villages found for this season.",
    hi: "इस सत्र के लिए कोई गांव नहीं मिला।",
  },
  noGrowers: {
    en: "No growers found in this village.",
    hi: "इस गांव में कोई कृषक नहीं मिला।",
  },
  showingOf: {
    en: "Showing {n} of {total}. Keep typing to narrow down.",
    hi: "{total} में से {n} दिख रहे हैं। छोटा करने के लिए लिखते रहें।",
  },
  viewData: { en: "View Data", hi: "विवरण देखें" },
  fetching: { en: "Fetching…", hi: "लाया जा रहा है…" },
  fetchingLong: {
    en: "Fetching your data from the Cane UP server. This can take a few seconds…",
    hi: "गन्ना विभाग के सर्वर से आपका डेटा लाया जा रहा है। कुछ सेकंड लग सकते हैं…",
  },
  liveNote: {
    en: "Data is read live from the Cane UP server.",
    hi: "डेटा सीधे गन्ना विभाग के सर्वर से लिया जाता है।",
  },
  changeFarmer: { en: "Change Farmer", hi: "किसान बदलें" },
  saveFarmer: { en: "Save Farmer", hi: "किसान सहेजें" },
  saved: { en: "Saved", hi: "सहेजा गया" },
  tryAgain: { en: "Try Again", hi: "फिर कोशिश करें" },
  errorTitle: {
    en: "Couldn’t Load This Farmer",
    hi: "इस किसान का डेटा नहीं मिला",
  },
  errorFix: {
    en: "Check your connection and try again. If it keeps failing, the Cane UP server may be down.",
    hi: "इंटरनेट जांचकर फिर कोशिश करें। बार-बार विफल हो तो गन्ना विभाग का सर्वर बंद हो सकता है।",
  },
  updated: { en: "Server data updated", hi: "सर्वर डेटा अपडेट" },
  loadedFor: {
    en: "Loaded data for {name}.",
    hi: "{name} का डेटा लोड हो गया।",
  },
  pickField: { en: "Choose a {field} first.", hi: "पहले {field} चुनें।" },

  // tabs
  tabOverview: { en: "Overview", hi: "सारांश" },
  tabSupply: { en: "Supply Tickets", hi: "सप्लाई टिकट" },
  tabPayments: { en: "Payments", hi: "भुगतान" },
  tabLoans: { en: "Loans", hi: "ऋण" },
  tabSurvey: { en: "Survey", hi: "सर्वे" },
  tabCalendar: { en: "Calendar", hi: "कैलेंडर" },
  tabMore: { en: "Receipts & More", hi: "रसीद व अन्य" },
  tabsLabel: { en: "Farmer data sections", hi: "किसान डेटा के भाग" },

  // overview
  basicQuota: { en: "Basic quota", hi: "बेसिक कोटा" },
  generalQuota: { en: "General quota", hi: "सामान्य कोटा" },
  totalBonding: { en: "Total bonding", hi: "कुल बॉन्डिंग" },
  cultivable: { en: "Cultivable area", hi: "कृषि योग्य क्षेत्रफल" },
  qtl: { en: "qtl", hi: "क्विंटल" },
  ha: { en: "ha", hi: "हे." },
  aboutFarmer: { en: "Farmer Details", hi: "किसान का विवरण" },
  bankContact: { en: "Bank and Contact", hi: "बैंक और संपर्क" },
  bondingTitle: { en: "Bonding", hi: "बॉन्डिंग" },
  father: { en: "Father / husband", hi: "पिता / पति" },
  society: { en: "Society", hi: "समिति" },
  centre: { en: "Centre", hi: "क्रय केंद्र" },
  supplyMode: { en: "Mode of supply", hi: "सप्लाई का माध्यम" },
  bank: { en: "Bank", hi: "बैंक" },
  account: { en: "Account no.", hi: "खाता संख्या" },
  mobile: { en: "Mobile", hi: "मोबाइल" },
  basicBonding: { en: "Basic bonding", hi: "बेसिक बॉन्डिंग" },
  addBonding: { en: "Additional bonding", hi: "अतिरिक्त बॉन्डिंग" },
  loanBonding: { en: "Loan bonding", hi: "ऋण बॉन्डिंग" },
  secondBonding: { en: "Second bonding", hi: "द्वितीय बॉन्डिंग" },
  maskedNote: {
    en: "Hidden for your privacy; only the last 4 digits show.",
    hi: "आपकी निजता के लिए छिपा है; केवल अंतिम 4 अंक दिखते हैं।",
  },

  // supply
  ticket: { en: "Ticket", hi: "टिकट" },
  ugc: { en: "UGC (unique grower code)", hi: "यू०जी०सी० (विशिष्ट किसान कोड)" },
  growerName: { en: "Grower name", hi: "किसान का नाम" },
  growerCode: { en: "Code (village / grower)", hi: "कोड (गाँव / किसान)" },
  ticketNumber: { en: "Ticket number", hi: "टिकट संख्या" },
  issuedType: { en: "Issued type", hi: "जारी प्रकार" },
  specDesc: { en: "Special description", hi: "विशेष विवरण" },
  calKind: { en: "Calendar type", hi: "कैलेंडर प्रकार" },
  calNormal: { en: "Calendar", hi: "कैलेंडर" },
  calAdditional: { en: "Additional calendar", hi: "अतिरिक्त कैलेंडर" },
  ticketDetails: { en: "Supply ticket", hi: "सप्लाई टिकट" },
  viewTicket: {
    en: "View details of ticket {no}",
    hi: "टिकट {no} का विवरण देखें",
  },
  close: { en: "Close", hi: "बंद करें" },
  copyDetails: { en: "Copy details", hi: "विवरण कॉपी करें" },
  copy: { en: "Copy", hi: "कॉपी" },
  copied: { en: "Copied", hi: "कॉपी हो गया" },
  copyFailed: { en: "Copy failed", hi: "कॉपी नहीं हुआ" },
  issued: { en: "Issued", hi: "जारी तिथि" },
  dispatch: { en: "Dispatch", hi: "भेजने की तिथि" },
  status: { en: "Status", hi: "स्थिति" },
  type: { en: "Type", hi: "प्रकार" },
  mode: { en: "Mode", hi: "माध्यम" },
  weighed: { en: "Weighed", hi: "तौल हो चुकी" },
  notWeighed: { en: "Not weighed", hi: "तौल बाकी" },
  cancelled: { en: "Cancelled", hi: "रद्द" },
  unknown: { en: "Unknown", hi: "अज्ञात" },
  noTickets: {
    en: "No supply tickets for this season yet.",
    hi: "इस सत्र में अभी कोई सप्लाई टिकट नहीं है।",
  },
  rawFields: { en: "Show raw ticket fields", hi: "टिकट के मूल फ़ील्ड दिखाएं" },
  rawFieldsNote: {
    en: "Column meanings are inferred from the Android app. Compare with these raw values if something looks off.",
    hi: "कॉलम का अर्थ एंड्रॉयड ऐप से अनुमानित है। कुछ गलत दिखे तो इन मूल मानों से मिलान करें।",
  },
  special: {
    en: "Special",
    hi: "विशेष",
  },
  specGeneral: { en: "General", hi: "सामान्य" },
  specAdjust: {
    en: "Additional weight adjustment",
    hi: "अतिरिक्त वज़न समायोजन",
  },
  specBurnt: { en: "Burnt", hi: "जला हुआ" },
  specCrop: { en: "Crop cutting", hi: "क्रॉप कटिंग" },
  specCancelled: { en: "Cancelled ticket", hi: "रद्द टिकट" },
  specLoan: { en: "Loan ticket", hi: "ऋण टिकट" },

  // payments & loans
  paymentSheets: { en: "Payment Sheets", hi: "भुगतान शीट" },
  paymentDetails: { en: "Payment by Supply", hi: "सप्लाई के अनुसार भुगतान" },
  sheetNo: { en: "Sheet no.", hi: "शीट संख्या" },
  date: { en: "Date", hi: "तिथि" },
  amountRs: { en: "Amount (₹)", hi: "राशि (₹)" },
  purchyNo: { en: "Purchy no.", hi: "पर्ची संख्या" },
  netWt: { en: "Net weight (qtl)", hi: "शुद्ध वज़न (क्विं.)" },
  loanRs: { en: "Loan (₹)", hi: "ऋण (₹)" },
  paidRs: { en: "Paid (₹)", hi: "भुगतान (₹)" },
  total: { en: "Total", hi: "कुल" },
  noPayments: {
    en: "No payment information yet.",
    hi: "अभी भुगतान की कोई जानकारी नहीं है।",
  },
  loanType: { en: "Loan type", hi: "ऋण का प्रकार" },
  deductionRs: { en: "Deduction (₹)", hi: "कटौती (₹)" },
  sNo: { en: "No.", hi: "क्र." },
  noLoans: { en: "No loans recorded.", hi: "कोई ऋण दर्ज नहीं है।" },

  // calendar
  fortnight: { en: "Fortnight", hi: "पक्ष" },
  fortnightShort: { en: "FN", hi: "पक्ष" },
  fortnightTotal: { en: "Fortnight total", hi: "पक्ष योग" },
  early: { en: "Early", hi: "शीघ्र" },
  general: { en: "General", hi: "सामान्य" },
  rejected: { en: "Rejected", hi: "अनुपयुक्त" },
  earlyVariety: { en: "Early variety", hi: "शीघ्र प्रजाति" },
  supplied: { en: "Supplied", hi: "आपूर्ति" },
  overweight: { en: "Over-weight", hi: "अधिक वज़न" },
  remaining: { en: "Remaining", hi: "शेष" },
  all: { en: "All", hi: "सभी" },
  basic: { en: "Basic quota", hi: "बेसिक कोटा" },
  extra: { en: "Extra bond", hi: "अतिरिक्त बॉन्डिंग" },
  calendar: { en: "Calendar", hi: "गन्ना कैलेंडर" },
  additional: {
    en: "Additional (satta) calendar",
    hi: "अतिरिक्त सट्टा कैलेंडर",
  },
  quotaGroup: { en: "Quota group", hi: "कोटा समूह" },
  calendarType: { en: "Calendar type", hi: "कैलेंडर का प्रकार" },
  noCalendar: {
    en: "No calendar data for this selection.",
    hi: "इस चयन के लिए कैलेंडर डेटा उपलब्ध नहीं है।",
  },
  calendarHelp: {
    en: "Each row of numbers is one fortnight. Columns 01 to 15 are the days of that fortnight.",
    hi: "हर पक्ष की तीन पंक्तियां हैं। 01 से 15 उस पक्ष के दिन हैं।",
  },

  // survey
  plots: { en: "No. of plots", hi: "प्लॉट की संख्या" },
  caneArea: { en: "Cane area", hi: "गन्ना क्षेत्रफल" },
  sn: { en: "SN", hi: "क्र.सं." },
  plotSrNo: { en: "Plot Sr No", hi: "प्लॉट क्र." },
  plotVillage: { en: "Plot village", hi: "प्लॉट गांव" },
  variety: { en: "Variety", hi: "प्रजाति" },
  east: { en: "East (m)", hi: "पूर्व (मी.)" },
  west: { en: "West (m)", hi: "पश्चिम (मी.)" },
  north: { en: "North (m)", hi: "उत्तर (मी.)" },
  south: { en: "South (m)", hi: "दक्षिण (मी.)" },
  area: { en: "Area (ha)", hi: "क्षेत्रफल (हे.)" },
  noSurvey: {
    en: "No survey data for this season.",
    hi: "इस सत्र के लिए सर्वे डेटा उपलब्ध नहीं है।",
  },

  // more
  moreNote: {
    en: "These sections are shown exactly as the server sends them. Easier-to-read versions are still being built.",
    hi: "ये भाग वैसे ही दिख रहे हैं जैसे सर्वर भेजता है। इनके आसान रूप अभी बन रहे हैं।",
  },
  moreEmpty: {
    en: "Nothing else to show for this farmer.",
    hi: "इस किसान के लिए और कुछ दिखाने को नहीं है।",
  },
  secNextDue: { en: "Next due", hi: "अगला देय" },
  secReceipts: { en: "Sugarcane receipts", hi: "गन्ना रसीद" },
  secSurvey: { en: "Survey", hi: "सर्वे" },
  secCalendar: { en: "Calendar", hi: "कैलेंडर" },
  secAdvance: {
    en: "Additional (satta) calendar",
    hi: "अतिरिक्त सट्टा कैलेंडर",
  },
  secCal1: { en: "Calendar 1", hi: "कैलेंडर 1" },
  secCal2: { en: "Calendar 2", hi: "कैलेंडर 2" },
} as const;

export type LabelKey = keyof typeof L;

/** Translate a key; `{name}` placeholders are filled from `vars`. */
export function t(
  key: LabelKey,
  lang: Lang,
  vars?: Record<string, string | number>,
): string {
  const s: string = L[key][lang];
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "")) : s;
}
