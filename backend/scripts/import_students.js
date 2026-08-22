import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Parse Date of Birth helper
function parseDOB(dobStr) {
  if (!dobStr) return new Date('2018-01-01');
  const parts = dobStr.trim().split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date('2018-01-01');
}

// Format Kenyan phone number to international standard +254...
function formatPhone(phoneStr) {
  if (!phoneStr) return null;
  const clean = String(phoneStr).trim().replace(/\D/g, '');
  if (clean.startsWith('254')) return `+${clean}`;
  if (clean.startsWith('0')) return `+254${clean.slice(1)}`;
  if (clean.startsWith('7') || clean.startsWith('1')) return `+254${clean}`;
  return `+254${clean}`;
}

// Split full name into first and last name
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

const ALL_STUDENTS_DATA = [
  // --- GRADE 1 ---
  { gradeLevel: 1, name: "TONNY MUEMA MUSEE", dob: "3.3.2019", parent: "MUSEE KITHIKII", idNo: "10435253", phone: "705231677", gender: "Male" },
  { gradeLevel: 1, name: "ANTONNY KITUTE KISINI", dob: "29.8.2019", parent: "KISINI KULA", idNo: "30261304", phone: "110406184", gender: "Male" },
  { gradeLevel: 1, name: "ANNALINE NATASHA NDINDA", dob: "9.2.2020", parent: "SIUSAN MUSYALA", idNo: "42987380", phone: "701072686", gender: "Female" },
  { gradeLevel: 1, name: "BRIGHTON KALUKI", dob: "20.10.2019", parent: "CHARITY KALUKI MUSYALA", idNo: "38649151", phone: "113091407", gender: "Male" },
  { gradeLevel: 1, name: "BYRON MUSYOKA NYAMAI", dob: "23.5.2019", parent: "NYAMAI NZYOKI", idNo: "13590440", phone: "727421403", gender: "Male" },
  { gradeLevel: 1, name: "SHANEL MUMBUA", dob: "30.1.2020", parent: "MUSYOKA MAREY", idNo: "33838198", phone: "797773320", gender: "Female" },
  { gradeLevel: 1, name: "MORRIS NZOKI", dob: "13.9.2019", parent: "NZOKI MUTUA", idNo: "41455062", phone: "717109523", gender: "Male" },
  { gradeLevel: 1, name: "DENNIS MERCY", dob: "17.7.2018", parent: "MERCY LOKO MUTUA", idNo: "41455836", phone: "710620911", gender: "Male" },
  { gradeLevel: 1, name: "MELLISA MBUVE ERICK", dob: "5.9.2020", parent: "ERICK NZUNGU PHILIP", idNo: "36479733", phone: "768424432", gender: "Female" },
  { gradeLevel: 1, name: "ANNOLD NDUNDA", dob: "23.7.2020", parent: "NDUNDA KAILU", idNo: "22720465", phone: "795562695", gender: "Male" },
  { gradeLevel: 1, name: "EUNICE KAKUTI SAMMY", dob: "7.5.2018", parent: "SAMMY MULWA", idNo: "13593767", phone: "741258453", gender: "Female" },
  { gradeLevel: 1, name: "JOY MUTINDI MUSYINGI", dob: "12.6.2019", parent: "MUSYINGI KASIVU", idNo: "31559380", phone: "715309244", gender: "Female" },
  { gradeLevel: 1, name: "PURITY MUTHEU WANZIA", dob: "12.6.2019", parent: "WAYUA NYAMAI", idNo: "32651756", phone: "740683504", gender: "Female" },
  { gradeLevel: 1, name: "MORRIS WATHI MULUKA", dob: "10.11.2019", parent: "MULUKA MWANZA", idNo: "21138656", phone: "114467188", gender: "Male" },
  { gradeLevel: 1, name: "JAMES KISANGI SIMON", dob: "20.5.2018", parent: "SAMSON JAMES", idNo: "41374743", phone: "795674372", gender: "Male" },
  { gradeLevel: 1, name: "PRECIOUS NGENA JOHN", dob: "16.3.2020", parent: "JOHN MUVEVA SYENGO", idNo: "34007542", phone: "723299590", gender: "Female" },
  { gradeLevel: 1, name: "IRENE KANINI KILUNDA", dob: "29.1.2019", parent: "KILUNDA MUSYOKA", idNo: "22814336", phone: "723299590", gender: "Female" },
  { gradeLevel: 1, name: "JOHN MANGUYE MAUTA", dob: "26.11.2018", parent: "MARY MUTUA", idNo: "38560872", phone: "798141697", gender: "Male" },
  { gradeLevel: 1, name: "ELKANAH MUMO MWILU", dob: "19.3.2019", parent: "VILITA MWILU", idNo: "37761542", phone: "702308907", gender: "Male" },
  { gradeLevel: 1, name: "AGNES KATHINGO KYANIA", dob: "7.4.2019", parent: "NICODEMUS KYANIA MUASYA", idNo: "11857067", phone: "725137627", gender: "Female" },
  { gradeLevel: 1, name: "MORIS KINYAI", dob: "19.8.2019", parent: "KINYAI NGULI", idNo: "25852568", phone: "711152101", gender: "Male" },

  // --- GRADE 2 ---
  { gradeLevel: 2, name: "GLADYS MUTHEU MBITI", dob: "28.12.2018", parent: "MBITI MUSYOKA", idNo: "24135718", phone: "111231090", gender: "Female" },
  { gradeLevel: 2, name: "BRIAN NZAMBA MWANGE", dob: "20.12.2018", parent: "MWANGE MANGEE", idNo: "20616326", phone: "706512766", gender: "Male" },
  { gradeLevel: 2, name: "MARTIN KYALO", dob: "1.1.2018", parent: "ELIZABETH PETER", idNo: "38649315", phone: "114852772", gender: "Male" },
  { gradeLevel: 2, name: "DENNIS MUSILI MALEVE", dob: "6.8.2018", parent: "MALEVE KISEMEI", idNo: "26703920", phone: "725405834", gender: "Male" },
  { gradeLevel: 2, name: "MITCHELLE NEKESA", dob: "13.1.2019", parent: "ESTHER KATINDI TITUS", idNo: "27027219", phone: "118553906", gender: "Female" },
  { gradeLevel: 2, name: "STANLEY MATHENGE MUKUTHU", dob: "17.11.2018", parent: "MUKUTHU KYAVULA", idNo: "22589803", phone: "716622162", gender: "Male" },
  { gradeLevel: 2, name: "PURITY TABITHA PETER", dob: "19.7.2018", parent: "PETER NGALI", idNo: "33112017", phone: "799181923", gender: "Female" },
  { gradeLevel: 2, name: "BRIAN KYALO RUEBEN", dob: "26.8.2018", parent: "RUEBEN KISEMEI", idNo: "28991400", phone: "743843250", gender: "Male" },
  { gradeLevel: 2, name: "MARK MUNUVE MBENZWA", dob: "28.8.2018", parent: "MBENZWA MUSANGO", idNo: "28439222", phone: "769050766", gender: "Male" },
  { gradeLevel: 2, name: "PETE MWANZIA MUSYMI", dob: "16.6.2018", parent: "MUSYIMI KATULA", idNo: "33792630", phone: "720834743", gender: "Male" },
  { gradeLevel: 2, name: "PRECIOUS KAVINYA KANINI", dob: "5.9.2017", parent: "KANINI KITHEKA", idNo: "41506049", phone: "704700447", gender: "Female" },
  { gradeLevel: 2, name: "NIMROD KITHOME WANZIA", dob: "10.6.2017", parent: "WANZIA NYAMAI", idNo: "32651756", phone: "7406835504", gender: "Male" },
  { gradeLevel: 2, name: "LICY KINYAI", dob: "17.4.2017", parent: "KINYAI NGULI", idNo: "25852568", phone: "711152101", gender: "Female" },
  { gradeLevel: 2, name: "RIZIKI SYOMBUA NAOMI", dob: "10.11.2019", parent: "NAOMI KINYUNZU", idNo: "37449263", phone: "740537476", gender: "Female" },

  // --- GRADE 3 ---
  { gradeLevel: 3, name: "ABIGAEL MUENI DAVID", dob: "28.8.2018", parent: "OBED DAVID SYENGO", idNo: "27054612", phone: "713213912", gender: "Female" },
  { gradeLevel: 3, name: "LILIAN KALUKI KITONGA", dob: "27.07.2017", parent: "KITONGA MULU", idNo: "21867694", phone: "715649280", gender: "Female" },
  { gradeLevel: 3, name: "FATUMA MUTHEU MUIMI", dob: "4.4.2019", parent: "MUIMI JAMES", idNo: "40350860", phone: "725465439", gender: "Female" },
  { gradeLevel: 3, name: "RACHAEL KATHEU MWANIA", dob: "27.7.2019", parent: "MWANIA SYENGO", idNo: "20799298", phone: "706770320", gender: "Female" },
  { gradeLevel: 3, name: "JEOSPHAT MUUO MWANGE", dob: "15.2.2017", parent: "MWANGE KINGUNGUI", idNo: "20463914", phone: "701837161", gender: "Male" },
  { gradeLevel: 3, name: "DEBORAH KAVINYA MUTUA", dob: "1.4.2017", parent: "NICODEMUS MUTUA SYENGO", idNo: "22537869", phone: "768179524", gender: "Female" },
  { gradeLevel: 3, name: "HADIJAH KALEE SAMMY", dob: "21.3.2017", parent: "SAMMY MULWA", idNo: "13583767", phone: "741258453", gender: "Female" },
  { gradeLevel: 3, name: "RIZIKI MWILU", dob: "7.4.2017", parent: "VILITA MULWA", idNo: "37761542", phone: "702308907", gender: "Female" },
  { gradeLevel: 3, name: "VERONICAH MUTHEU NGWASI", dob: "3.5.2018", parent: "NGWASI KITILI", idNo: "24018643", phone: "711194669", gender: "Female" },
  { gradeLevel: 3, name: "ALEX MULWA MAUTA", dob: "6.1.2017", parent: "MARY MUTUA", idNo: "38560872", phone: "798141697", gender: "Male" },
  { gradeLevel: 3, name: "DAVID MUYANGA SINZI", dob: "10.12.2016", parent: "JANE NZOKI MUSYOKA", idNo: "36529567", phone: "793632182", gender: "Male" },
  { gradeLevel: 3, name: "AMBROSE MUSYOKA WAMBUA", dob: "20.11.2016", parent: "KYAMA MUSYOKA", idNo: "36529567", phone: "793632182", gender: "Male" },
  { gradeLevel: 3, name: "SIMON KONGO JUMA", dob: "20.8.2016", parent: "JUMA MUSYOKA", idNo: "17256398", phone: "745009241", gender: "Male" },
  { gradeLevel: 3, name: "NIMROD MUTINDA", dob: "17.3.2017", parent: "MUTINDA MUTUVI", idNo: "32710092", phone: "742200410", gender: "Male" },
  { gradeLevel: 3, name: "MAURICE MUTONGOI KIRUNJA", dob: "31.10.2015", parent: "KITRUJA MWAMBUA", idNo: "24546911", phone: "799205470", gender: "Male" },

  // --- GRADE 4 ---
  { gradeLevel: 4, name: "MUEMA GRACE MUTHEU", dob: "24.5.2017", parent: "JEREMIAH MUEMA KAMANA", idNo: "26584278", phone: "719166258", gender: "Female" },
  { gradeLevel: 4, name: "MUTATI JOSHUA", dob: "23.7.2016", parent: "MUSEMBI MWIKYA", idNo: "11424103", phone: "757021952", gender: "Male" },
  { gradeLevel: 4, name: "PETER CHRISTINE NDANU", dob: "18.3.2016", parent: "PETER NGALI", idNo: "33112017", phone: "799181923", gender: "Female" },
  { gradeLevel: 4, name: "KITEME MOSES KALENGA", dob: "10.10.2016", parent: "CATHERINE MWENDE KITEME", idNo: "30260465", phone: "799240999", gender: "Male" },
  { gradeLevel: 4, name: "NZUVA SAMUEL KISANGI", dob: "17.3.2017", parent: "FERDNARD NZUVA", idNo: "38123751", phone: "798269535", gender: "Male" },
  { gradeLevel: 4, name: "MWANGU ELKANAH MUMO", dob: "13.08.2016", parent: "DOMINIC MWANGU MAKALI", idNo: "20702846", phone: "715017396", gender: "Male" },
  { gradeLevel: 4, name: "MUNYIVA EMMANUEL KITHOME", dob: "4.11.2016", parent: "MUNYIVA NZIOKI", idNo: "30634918", phone: "714175854", gender: "Male" },
  { gradeLevel: 4, name: "KYANIA MARY KALEE", dob: "30.7.2016", parent: "NICODEMUS KYANIA MUASYA", idNo: "11857067", phone: "725137627", gender: "Female" },
  { gradeLevel: 4, name: "KANZA JOYCE KALEE", dob: "28.5.2016", parent: "KANZA MUTHUI", idNo: "39265329", phone: "791077584", gender: "Female" },
  { gradeLevel: 4, name: "MWANGE JOHN MAUNDU", dob: "26.02.2016", parent: "MWANGE MANGEE", idNo: "20616326", phone: "706512766", gender: "Male" },
  { gradeLevel: 4, name: "MWANGU MORRIS", dob: "21.9.2016", parent: "MWANGU KULA", idNo: "12961599", phone: "738762963", gender: "Male" },
  { gradeLevel: 4, name: "MWIKYA JONATHAN SAMMY", dob: "18.6.2016", parent: "SAMMY MULWA", idNo: "13593767", phone: "741258453", gender: "Male" },
  { gradeLevel: 4, name: "ANITA JULIUS NGAO", dob: "18.12.2015", parent: "ANITA MULONZYA", idNo: "33200179", phone: "745399012", gender: "Female" },
  { gradeLevel: 4, name: "MWANIA TOM MUTISO", dob: "11.11.2014", parent: "MWANIA SYENGO", idNo: "20799298", phone: "706770320", gender: "Male" },
  { gradeLevel: 4, name: "KIOKO JOHN MATUKU", dob: "13.2.2016", parent: "ALEX KIOKO MALUKI", idNo: "21567103", phone: "787551309", gender: "Male" },
  { gradeLevel: 4, name: "MUSYIMI JOSPHAT MUTATI", dob: "12.2.2016", parent: "MUSYIMI KATULA", idNo: "33792930", phone: "720834743", gender: "Male" },
  { gradeLevel: 4, name: "MULI CATHERINE KATANU", dob: "12.2.2016", parent: "NYIVA MALOMBE", idNo: "38649152", phone: "115023085", gender: "Female" },
  { gradeLevel: 4, name: "NYALO JOHN VAATI", dob: "7.4.2016", parent: "MALIA MUSEMBI", idNo: "38649150", phone: "715017390", gender: "Male" },
  { gradeLevel: 4, name: "MWENDWA SIMON", dob: "12.8.2016", parent: "MWENDWA MUTHOKA", idNo: "21196045", phone: "705168385", gender: "Male" },
  { gradeLevel: 4, name: "ASHLAY NATALIA", dob: "11.5.2017", parent: "SUSAN MUSYALA", idNo: "42987380", phone: "701072686", gender: "Female" },
  { gradeLevel: 4, name: "JOSIAH MWATAHNI MWANGE", dob: "24.08.2014", parent: "MWANGE KINGUNGUI", idNo: "20463914", phone: "701837161", gender: "Male" },
  { gradeLevel: 4, name: "ELIJAH KYUSYA MBENZWA", dob: "17.1.2017", parent: "KATUKU KYUSYA", idNo: "28432222", phone: "769050766", gender: "Male" },

  // --- GRADE 5 (NEMIS Register) ---
  { gradeLevel: 5, name: "Benedetta Kamene Kyania", uli: "KEN202615126ZJLE2-0", assessmentNumber: "B005105012", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 5, name: "CALEB MUTHUI SINZI", uli: "KEN2026154M0XX47G-8", assessmentNumber: "B005238709", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "BENSON KIMWELE MUSEE", uli: "KEN2026154R8BM0QL-7", assessmentNumber: "B006365118", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "EVANS SOLOMON NGUMBAU", uli: "KEN2026156E3IB3U3-4", assessmentNumber: "B005759113", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "NAOMI MUTHEU MUTUA", uli: "KEN20261593INWYF3-3", assessmentNumber: "B005239541", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 5, name: "BRIAN MUSILA WANZIA", uli: "KEN202615988N4ZON-8", assessmentNumber: "B006365104", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "PETER KAMANA MATUKU", uli: "KEN2026159L8DOZJN-6", assessmentNumber: "B006048302", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "BENARD SYENGO KITONGA", uli: "KEN202615AI4YAPCE-5", assessmentNumber: "B006048331", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "MAURINE KASELE MAUTA", uli: "KEN202615AMR511WC-2", assessmentNumber: "B005924819", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 5, name: "ROBERT KALANI KINYAI", uli: "KEN202615EN1WWMPG-5", assessmentNumber: "B006594206", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "BRIAN MWENDWA", uli: "KEN202615GYN9XEE6-2", assessmentNumber: "B005104892", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "Philip Kitheka Kisinga", uli: "KEN202615I1IIOIGA-2", assessmentNumber: "B005705356", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "JACOB NGALA BENARD", uli: "KEN202615IN66FF0F-7", assessmentNumber: "B006048351", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "KELVIN MULATYA MUNGAMI", uli: "KEN202615JZ165BL9-0", assessmentNumber: "B005244082", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "BRIAN MUTATI", uli: "KEN202615K6O145PD-3", assessmentNumber: "B005461675", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "FELISTUS MUTHEU MATHITU", uli: "KEN202615MGEGYRHR-7", assessmentNumber: "B005105382", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 5, name: "ANNNAH MWENDE NGOVI", uli: "KEN202615N5DOVBRR-2", assessmentNumber: "B006048311", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 5, name: "SIMON KYANGU MBITI", uli: "KEN202615SFIHNFTC-0", assessmentNumber: "B005104682", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "ANNA MULEWA KITEME", uli: "KEN202615TRN8NG16-1", assessmentNumber: "B005498859", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 5, name: "WILLY MUMO REUBEN", uli: "KEN202615TUAVIGCW-9", assessmentNumber: "B005262825", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "Solomon Musila Mwilu", uli: "KEN202615TVYBJUSL-0", assessmentNumber: "B006048344", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "EMANUEL KALONZO MUMO", uli: "KEN202615UDPABLCD-4", assessmentNumber: "B005461401", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "PHILIP MUTUA MERCY", uli: "KEN202615VW0C922U-8", assessmentNumber: "B005239121", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "SIMON VETELO WAMBUA", uli: "KEN202615VXA4SUOV-2", assessmentNumber: "B006586275", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "JUNIOR MUTINDA", uli: "KEN202615YNJCD13K-7", assessmentNumber: "B006415192", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 5, name: "NYIVA IVUTHA", uli: "KEN202615ZDAKAL0V-8", assessmentNumber: "B006028892", sneStatus: "NO", gender: "Female" },

  // --- GRADE 6 (NEMIS Register) ---
  { gradeLevel: 6, name: "Mary Kalunde Wambua", uli: "KEN2026150LT1OLL9-4", assessmentNumber: "B004983623", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "JOSIAH KIOKO MUTUA", uli: "KEN2026151J6ZPGOU-4", assessmentNumber: "B003788335", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "BENJAMIN MANDELA MWANGE", uli: "KEN2026152J26ZG6D-8", assessmentNumber: "B003814305", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "Amos King'ung'ui Ndithya", uli: "KEN2026153PE6XAL2-5", assessmentNumber: "B003814208", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "FAITH KALUKI PETER", uli: "KEN202615472W3DCQ-4", assessmentNumber: "B003812274", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "Simon Musyoka Musyimi", uli: "KEN2026158UTZDC6Z-0", assessmentNumber: "B003814245", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "LILIAN KANINI WANZIA", uli: "KEN2026159K77ENCF-2", assessmentNumber: "B003823279", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "FRANCIS KILONZI KITONGA", uli: "KEN2026159LGODYND-8", assessmentNumber: "B003814323", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "DORCAS MBETI KILUNDA", uli: "KEN202615ALSJXEA4-4", assessmentNumber: "B003814200", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "MERCY MAWIA SYENGO", uli: "KEN202615FBXASYZM-1", assessmentNumber: "B003812260", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "Stephen Musya Mwangu", uli: "KEN202615G7PNT833-1", assessmentNumber: "B003814215", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "CATHERINE MUTUNE NYAMAI", uli: "KEN202615KMQQOVIZ-0", assessmentNumber: "B003814281", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "Agnes Kavutha Muli", uli: "KEN202615L6IB1FHW-2", assessmentNumber: "B003812240", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "JEREMIAH MWANIA BENARD", uli: "KEN202615N887GWXQ-5", assessmentNumber: "B003814294", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "BONIFACE MUOKI MWANZIA", uli: "KEN202615PNUCKX1T-3", assessmentNumber: "B003812213", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "ROSE NDUNDA", uli: "KEN202615QB91WNXP-8", assessmentNumber: "B003814314", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "Meshack Mutisya Ngwasi", uli: "KEN202615QGPSMOCL-3", assessmentNumber: "B003814233", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "LUCY NZEMBI MUSYA", uli: "KEN202615R282BWRC-4", assessmentNumber: "B004045373", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "BENSON MUENI MWANZIA", uli: "KEN202615R6521BSO-2", assessmentNumber: "B004046365", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "CAROL MUENI KISINI", uli: "KEN202615S9J1JTXU-8", assessmentNumber: "B004350357", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 6, name: "STEPHEN KALONZO KISEMEI", uli: "KEN202615SKK38FQJ-2", assessmentNumber: "B003814267", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 6, name: "Joshua Kitonga Mwema", uli: "KEN202615XAGH4QGW-4", assessmentNumber: "B003814256", sneStatus: "NO", gender: "Male" },

  // --- GRADE 7 (NEMIS Register) ---
  { gradeLevel: 7, name: "Emmanuel Kitonga", uli: "KEN2026153U3EZ6RH-2", assessmentNumber: "B003078655", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "DAVID MWANZIA MWILU", uli: "KEN20261580QT3XQW-4", assessmentNumber: "B002506564", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "STEPHEN PETER MUSEMBI", uli: "KEN20261581HMWC8E-2", assessmentNumber: "B002485738", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "BONFACE KING'EE SAMMY", uli: "KEN202615A957CB9Y-0", assessmentNumber: "B003291035", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "ANDERSON KASELE MWANZIA", uli: "KEN202615ABG3RXFK-9", assessmentNumber: "B002485185", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "NANCY MUENI KANINI", uli: "KEN202615ACTHU4LD-9", assessmentNumber: "B002478354", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 7, name: "MUKUTI REUBEN", uli: "KEN202615AI4Y5HSC-1", assessmentNumber: "B003291160", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "VICTOR MWENDWA MWANGANGI", uli: "KEN202615AN1PJ2Q6-4", assessmentNumber: "B002485924", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "CALEB MUMO DAVID", uli: "KEN202615CAR44KY1-6", assessmentNumber: "B002484964", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "DORCUS MUENI SOLOMON", uli: "KEN202615FXYQFGEB-6", assessmentNumber: "B002479790", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 7, name: "LUCY MBETI MBUNGI", uli: "KEN202615G29VZ11W-7", assessmentNumber: "B002506399", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 7, name: "HANNAH MUENI KANG'ATA", uli: "KEN202615HMOEOZQ4-0", assessmentNumber: "B002671727", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 7, name: "FESTUS MWANZIA KIMBUI", uli: "KEN202615ITPFND0L-1", assessmentNumber: "B002486899", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "RUTH Muthini Mauta", uli: "KEN202615JAZPHZOW-7", assessmentNumber: "B003290530", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 7, name: "KELVIN KISENGESE WANZIA", uli: "KEN202615KRFGH9JH-1", assessmentNumber: "B002480246", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "JOSEPH KIOKO KIKWATHA", uli: "KEN202615L0YGOTMK-0", assessmentNumber: "B002506594", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "MERCY KANINI KINYAI", uli: "KEN202615ODTYMLQX-3", assessmentNumber: "B002506658", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 7, name: "PAUL MUTUKU TITUS", uli: "KEN202615P8ZCKXF4-6", assessmentNumber: "B002486032", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "STANLEY MUSYOKA SINZI", uli: "KEN202615PK2C7Z9V-8", assessmentNumber: "B002506503", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "MAINA MUTINDA", uli: "KEN202615QPJ0TLPL-8", assessmentNumber: "B003291097", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "BRIAN NZIOKI MUNYIVA", uli: "KEN202615SJGKJ321-2", assessmentNumber: "B002506629", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "Victor Wambua Mbenzwa", uli: "KEN202615T1G6J8X0-7", assessmentNumber: "B003078810", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "KELVIN KIMANTHI MWAMBEKO", uli: "KEN202615U4L5VBE5-3", assessmentNumber: "B002506444", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 7, name: "JOHN MUTUKU KIKWATHA", uli: "KEN202615V4A7XERD-8", assessmentNumber: "B002506420", sneStatus: "NO", gender: "Male" },

  // --- GRADE 9 (NEMIS Register) ---
  { gradeLevel: 9, name: "NAOMI KAVUTHA NGOVI", uli: "KEN2026153LAHIA7M-2", assessmentNumber: "B000170254", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "JONATHAN MBUTI KIOKO", uli: "KEN2026153SENUCAM-6", assessmentNumber: "B000170900", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "FAITH VELESI KILUNDA", uli: "KEN2026155V3BOSA1-1", assessmentNumber: "B000171187", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "LUCIANA MUTHINI KITEME", uli: "KEN2026157FY8B1JA-3", assessmentNumber: "B000170757", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "Moses Kivuitu Maleve", uli: "KEN2026158WQPJGDB-9", assessmentNumber: "B000172715", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "BENNIEN NZAMBI KINYAI", uli: "KEN20261594WUYG7X-7", assessmentNumber: "B000171438", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "JANE VAATI KAMANA", uli: "KEN2026159HYT1SKR-4", assessmentNumber: "B000174969", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "DANIEL MBUYI MWANIA", uli: "KEN2026159Y4EEUOP-3", assessmentNumber: "B000171020", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "Emanuel Kamana Muema", uli: "KEN202615A9VI7H17-7", assessmentNumber: "B000169934", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "Obama Mia Mwangangi", uli: "KEN202615AFX3ZXAU-1", assessmentNumber: "B000170622", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "MESHARK MUOKI MWANGU", uli: "KEN202615BY12PWYR-7", assessmentNumber: "B000172992", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "NICHOLUS KAMUVYA MUNGAMI", uli: "KEN202615EH6ETEHF-7", assessmentNumber: "B000172870", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "AGNES KALUKI BENARD", uli: "KEN202615FS9YWQED-1", assessmentNumber: "B000205437", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "John Kimwele Kyania", uli: "KEN202615FYN2YD92-0", assessmentNumber: "B000170141", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "JOSHUA MUSIMBA MWANGE", uli: "KEN202615GBULYCBJ-9", assessmentNumber: "B000302606", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "DELICAH NDANU MUTUA", uli: "KEN202615I7URTOYS-7", assessmentNumber: "B000173783", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "RUTH KASUU SAMMY", uli: "KEN202615JDE44SRO-6", assessmentNumber: "B000172342", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "FAITH IVUTHA", uli: "KEN202615N2CYH7FI-6", assessmentNumber: "B000701524", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "CELIN MONICAH MUTISYA", uli: "KEN202615PFDYEXAB-8", assessmentNumber: "B000325871", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "KENNEDY KATIBA SOLOMON", uli: "KEN202615Q8GWQQR3-2", assessmentNumber: "B000172625", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "CAROL MUINDI NGWASI", uli: "KEN202615Q90P2NB0-6", assessmentNumber: "B000172093", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "JOSHUA KALONZO NDUNDA", uli: "KEN202615QWATCOIQ-8", assessmentNumber: "B000171619", sneStatus: "NO", gender: "Male" },
  { gradeLevel: 9, name: "JUDY MALOVOO", uli: "KEN202615SL3OY5TP-3", assessmentNumber: "B001838384", sneStatus: "NO", gender: "Female" },
  { gradeLevel: 9, name: "ANNAH MUENI MATUKU", uli: "KEN202615WS5SPWRB-6", assessmentNumber: "B000174855", sneStatus: "NO", gender: "Female" },
];

async function main() {
  console.log(`Starting import of ${ALL_STUDENTS_DATA.length} students with MAT/2026 admission numbers...`);

  // Clean existing students & guardians to allow idempotent re-running
  await prisma.studentGuardian.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany({
    where: {
      role: { in: ['STUDENT', 'PARENT'] }
    }
  });

  const defaultPassword = await bcrypt.hash('admin', 12);

  // Fetch classes keyed by level
  const classes = await prisma.class.findMany({
    include: { grade: true }
  });
  const classMap = {};
  for (const c of classes) {
    classMap[c.grade.level] = c;
  }

  let admCounter = 1;

  for (const s of ALL_STUDENTS_DATA) {
    const admNo = `MAT/2026/${String(admCounter).padStart(4, '0')}`;
    const targetClass = classMap[s.gradeLevel] || classMap[1];
    const { firstName, lastName } = splitName(s.name);
    const dob = s.dob ? parseDOB(s.dob) : new Date(2017 - s.gradeLevel, 0, 1);
    const parentPhone = formatPhone(s.phone);

    const email = `student.${admCounter}@matundu.ac.ke`;

    // 1. Create Student User
    const user = await prisma.user.create({
      data: {
        email,
        password: defaultPassword,
        role: 'STUDENT',
        phone: null
      }
    });

    // 2. Create Student Record
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        admissionNumber: admNo,
        firstName,
        lastName,
        gender: s.gender === 'Female' || s.gender === 'F' ? 'Female' : 'Male',
        dateOfBirth: dob,
        admissionDate: new Date('2026-01-05'),
        classId: targetClass?.id || null,
        admissionStatus: 'APPROVED',
        upiNumber: s.uli || null,
        assessmentNumber: s.assessmentNumber || null,
        sneStatus: s.sneStatus || 'NO'
      }
    });

    // 3. Create or Link Parent/Guardian if provided
    if (s.parent) {
      const parentName = splitName(s.parent);
      
      let guardian = null;
      if (s.idNo) {
        guardian = await prisma.guardian.findFirst({
          where: { nationalId: s.idNo }
        });
      }
      if (!guardian && parentPhone) {
        const existingParentUser = await prisma.user.findFirst({
          where: { phone: parentPhone }
        });
        if (existingParentUser) {
          guardian = await prisma.guardian.findFirst({
            where: { userId: existingParentUser.id }
          });
        }
      }

      if (!guardian) {
        let userPhone = parentPhone;
        if (userPhone) {
          const phoneInUse = await prisma.user.findFirst({ where: { phone: userPhone } });
          if (phoneInUse) userPhone = null;
        }

        const parentUser = await prisma.user.create({
          data: {
            email: `parent.${admCounter}@matundu.ac.ke`,
            password: defaultPassword,
            role: 'PARENT',
            phone: userPhone
          }
        });

        guardian = await prisma.guardian.create({
          data: {
            userId: parentUser.id,
            firstName: parentName.firstName,
            lastName: parentName.lastName,
            nationalId: s.idNo || null,
            relationship: 'PARENT'
          }
        });
      }

      await prisma.studentGuardian.create({
        data: {
          studentId: student.id,
          guardianId: guardian.id,
          isPrimary: true
        }
      });
    }

    console.log(`[${admCounter}/${ALL_STUDENTS_DATA.length}] Registered ${admNo}: ${s.name} (${s.gender}) -> ${targetClass?.name || 'Unassigned'} | UPI: ${s.uli || 'N/A'}`);
    admCounter++;
  }

  console.log(`\nSuccessfully imported ${ALL_STUDENTS_DATA.length} students into Matundu Primary School!`);
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
