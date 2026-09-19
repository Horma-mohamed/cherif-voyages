import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt } from 'crypto';

const prisma = new PrismaClient();

// Duplicated from src/lib/auth.ts on purpose — this script runs standalone
// via tsx, outside the Next.js server runtime, so it avoids importing
// anything that touches next/headers.
function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
  });
}

const ADMIN_EMAIL = 'admin@cherifvoyages.mr';
const ADMIN_SEED_PASSWORD = 'ChangeMe123!';

const packages = [
  {
    slug: 'omra-essentielle',
    kickerFr: 'Chaabane · 12 jours',
    kickerAr: 'شعبان · 12 يوماً',
    titleFr: 'Omra Essentielle',
    titleAr: 'العمرة الأساسية',
    descriptionFr:
      'Vol direct Mauritania Airlines, hôtel 3★ à 800 m du Haram, transferts, visa et accompagnement religieux depuis Nouakchott.',
    descriptionAr:
      'رحلة مباشرة مع موريتانيا للطيران، فندق 3 نجوم على بعد 800 م من الحرم، تنقلات، تأشيرة ومرافقة دينية من نواكشوط.',
    departureCityFr: 'Nouakchott',
    departureCityAr: 'نواكشوط',
    durationDays: 12,
    priceMru: 96000,
    priceEur: 2400,
    depositPercent: 30,
    seatsTotal: 50,
    seatsBooked: 22,
    departureDate: new Date('2027-02-08'),
    programSteps: [
      { order: 1, daysLabelFr: 'Jours 1—2', daysLabelAr: 'اليوم 1—2', textFr: 'Départ de Nouakchott, arrivée à Djeddah, transfert et installation à Makkah.', textAr: 'المغادرة من نواكشوط، الوصول إلى جدة، التنقل والإقامة بمكة.' },
      { order: 2, daysLabelFr: 'Jours 3—10', daysLabelAr: 'اليوم 3—10', textFr: 'Omra, prières au Haram et visites des lieux saints de Makkah.', textAr: 'أداء العمرة، الصلاة بالحرم وزيارة المعالم بمكة.' },
      { order: 3, daysLabelFr: 'Jours 11—12', daysLabelAr: 'اليوم 11—12', textFr: 'Retour Djeddah — Nouakchott.', textAr: 'العودة جدة — نواكشوط.' }
    ],
    inclusions: [
      { order: 1, itemFr: 'Vol aller-retour', itemAr: 'تذكرة ذهاب وإياب', valueFr: 'Direct, bagage 2 × 23 kg', valueAr: 'مباشرة، أمتعة 2 × 23 كغ', highlight: false },
      { order: 2, itemFr: 'Hébergement Makkah', itemAr: 'الإقامة بمكة', valueFr: '3★, chambre quadruple, 10 nuits', valueAr: '3 نجوم، غرفة رباعية، 10 ليالٍ', highlight: false },
      { order: 3, itemFr: 'Visa et assurance', itemAr: 'التأشيرة والتأمين', valueFr: 'Inclus, dossier traité par l’agence', valueAr: 'مشمولة، الملف تعالجه الوكالة', highlight: true },
      { order: 4, itemFr: 'Encadrement', itemAr: 'الإشراف', valueFr: 'Guide francophone et arabophone', valueAr: 'مرشد بالعربية والفرنسية', highlight: false }
    ]
  },
  {
    slug: 'omra-ramadan',
    kickerFr: 'Ramadan 1448 · 15 jours',
    kickerAr: 'رمضان 1448 · 15 يوماً',
    titleFr: 'Omra Ramadan',
    titleAr: 'عمرة رمضان',
    descriptionFr:
      'Vol direct Mauritania Airlines, hôtel 4★ à Makkah avec vue sur le Haram, cinq nuits à Médine, visa, transferts et accompagnement religieux depuis Nouakchott.',
    descriptionAr:
      'رحلة مباشرة مع موريتانيا للطيران، فندق 4 نجوم بمكة بإطلالة على الحرم، خمس ليالٍ بالمدينة، تأشيرة وتنقلات ومرافقة دينية من نواكشوط.',
    departureCityFr: 'Nouakchott',
    departureCityAr: 'نواكشوط',
    durationDays: 15,
    priceMru: 128000,
    priceEur: 3200,
    depositPercent: 30,
    seatsTotal: 60,
    seatsBooked: 46,
    departureDate: new Date('2027-03-12'),
    programSteps: [
      { order: 1, daysLabelFr: 'Jours 1—2', daysLabelAr: 'اليوم 1—2', textFr: 'Départ de Nouakchott, arrivée à Djeddah, transfert et installation à Makkah.', textAr: 'المغادرة من نواكشوط، الوصول إلى جدة، التنقل والإقامة بمكة.' },
      { order: 2, daysLabelFr: 'Jours 3—9', daysLabelAr: 'اليوم 3—9', textFr: 'Omra, prières au Haram, cours quotidiens et visites des lieux saints de Makkah.', textAr: 'أداء العمرة، الصلاة بالحرم، دروس يومية وزيارة المعالم بمكة.' },
      { order: 3, daysLabelFr: 'Jours 10—14', daysLabelAr: 'اليوم 10—14', textFr: 'Route vers Médine, cinq nuits près du Masjid an-Nabawi, visites de Quba et Uhud.', textAr: 'التوجه إلى المدينة، خمس ليالٍ قرب المسجد النبوي، زيارة قباء وأحد.' },
      { order: 4, daysLabelFr: 'Jour 15', daysLabelAr: 'اليوم 15', textFr: 'Retour Djeddah — Nouakchott.', textAr: 'العودة جدة — نواكشوط.' }
    ],
    inclusions: [
      { order: 1, itemFr: 'Vol aller-retour', itemAr: 'تذكرة ذهاب وإياب', valueFr: 'Direct, bagage 2 × 23 kg', valueAr: 'مباشرة، أمتعة 2 × 23 كغ', highlight: false },
      { order: 2, itemFr: 'Hébergement Makkah', itemAr: 'الإقامة بمكة', valueFr: '4★, chambre quadruple, 9 nuits', valueAr: '4 نجوم، غرفة رباعية، 9 ليالٍ', highlight: false },
      { order: 3, itemFr: 'Hébergement Médine', itemAr: 'الإقامة بالمدينة', valueFr: '4★, 5 nuits, pension complète', valueAr: '4 نجوم، 5 ليالٍ، إقامة كاملة', highlight: false },
      { order: 4, itemFr: 'Visa et assurance', itemAr: 'التأشيرة والتأمين', valueFr: 'Inclus, dossier traité par l’agence', valueAr: 'مشمولة، الملف تعالجه الوكالة', highlight: true },
      { order: 5, itemFr: 'Encadrement', itemAr: 'الإشراف', valueFr: 'Guide francophone et arabophone', valueAr: 'مرشد بالعربية والفرنسية', highlight: false }
    ]
  },
  {
    slug: 'hajj-complet',
    kickerFr: 'Hajj 1448 · 30 jours',
    kickerAr: 'الحج 1448 · 30 يوماً',
    titleFr: 'Hajj complet',
    titleAr: 'الحج الكامل',
    descriptionFr:
      'Quota officiel, vol direct, hôtels à Makkah et Médine, camp Mina climatisé et encadrement religieux complet depuis Nouakchott.',
    descriptionAr:
      'حصة رسمية، رحلة مباشرة، فنادق بمكة والمدينة، مخيم منى مكيف وإشراف ديني كامل من نواكشوط.',
    departureCityFr: 'Nouakchott',
    departureCityAr: 'نواكشوط',
    durationDays: 30,
    priceMru: 240000,
    priceEur: 6000,
    depositPercent: 40,
    seatsTotal: 40,
    seatsBooked: 26,
    departureDate: new Date('2027-05-20'),
    programSteps: [
      { order: 1, daysLabelFr: 'Jours 1—3', daysLabelAr: 'اليوم 1—3', textFr: 'Départ de Nouakchott, arrivée à Djeddah, installation à Makkah.', textAr: 'المغادرة من نواكشوط، الوصول إلى جدة، الإقامة بمكة.' },
      { order: 2, daysLabelFr: 'Jours 4—18', daysLabelAr: 'اليوم 4—18', textFr: 'Rites du Hajj, camp de Mina, Arafat et Muzdalifa, encadrement religieux quotidien.', textAr: 'شعائر الحج، مخيم منى، عرفات ومزدلفة، إشراف ديني يومي.' },
      { order: 3, daysLabelFr: 'Jours 19—27', daysLabelAr: 'اليوم 19—27', textFr: 'Route vers Médine, prières au Masjid an-Nabawi, visites de Quba et Uhud.', textAr: 'التوجه إلى المدينة، الصلاة بالمسجد النبوي، زيارة قباء وأحد.' },
      { order: 4, daysLabelFr: 'Jours 28—30', daysLabelAr: 'اليوم 28—30', textFr: 'Retour Djeddah — Nouakchott.', textAr: 'العودة جدة — نواكشوط.' }
    ],
    inclusions: [
      { order: 1, itemFr: 'Vol aller-retour', itemAr: 'تذكرة ذهاب وإياب', valueFr: 'Direct, bagage 2 × 23 kg', valueAr: 'مباشرة، أمتعة 2 × 23 كغ', highlight: false },
      { order: 2, itemFr: 'Hébergement Makkah & Médine', itemAr: 'الإقامة بمكة والمدينة', valueFr: '4★, chambre quadruple', valueAr: '4 نجوم، غرفة رباعية', highlight: false },
      { order: 3, itemFr: 'Camp de Mina', itemAr: 'مخيم منى', valueFr: 'Climatisé, quota officiel', valueAr: 'مكيف، حصة رسمية', highlight: false },
      { order: 4, itemFr: 'Visa et assurance', itemAr: 'التأشيرة والتأمين', valueFr: 'Inclus, dossier traité par l’agence', valueAr: 'مشمولة، الملف تعالجه الوكالة', highlight: true },
      { order: 5, itemFr: 'Encadrement', itemAr: 'الإشراف', valueFr: 'Guide francophone et arabophone', valueAr: 'مرشد بالعربية والفرنسية', highlight: false }
    ]
  }
];

async function main() {
  for (const pkg of packages) {
    const { programSteps, inclusions, seatsBooked: _seedSeatsBooked, ...contentData } = pkg;
    // seatsBooked is deliberately excluded from `update` — it's live
    // operational state driven by real bookings, and re-running this seed
    // (e.g. to tweak copy or add a package) must not reset it. Only a
    // brand-new package starts from the seed literal.
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {
        ...contentData,
        programSteps: { deleteMany: {}, create: programSteps },
        inclusions: { deleteMany: {}, create: inclusions }
      },
      create: {
        ...contentData,
        seatsBooked: _seedSeatsBooked,
        programSteps: { create: programSteps },
        inclusions: { create: inclusions }
      }
    });
  }
  console.log(`Seeded ${packages.length} packages.`);

  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: 'Agence Cherif Voyages',
      passwordHash: await hashPassword(ADMIN_SEED_PASSWORD)
    }
  });
  console.log(`Seeded admin account (${ADMIN_EMAIL} / ${ADMIN_SEED_PASSWORD} — change this).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
