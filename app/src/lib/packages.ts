import { prisma } from '@/lib/prisma';

export async function listPackages() {
  const packages = await prisma.package.findMany({ orderBy: { departureDate: 'asc' } });
  return packages.map((pkg) => ({
    slug: pkg.slug,
    kickerFr: pkg.kickerFr,
    kickerAr: pkg.kickerAr,
    titleFr: pkg.titleFr,
    titleAr: pkg.titleAr,
    descriptionFr: pkg.descriptionFr,
    descriptionAr: pkg.descriptionAr,
    departureCityFr: pkg.departureCityFr,
    departureCityAr: pkg.departureCityAr,
    durationDays: pkg.durationDays,
    priceMru: pkg.priceMru,
    priceEur: pkg.priceEur,
    departureDate: pkg.departureDate,
    seatsRemaining: pkg.seatsTotal - pkg.seatsBooked
  }));
}

export async function getPackageBySlug(slug: string) {
  const pkg = await prisma.package.findUnique({
    where: { slug },
    include: {
      programSteps: { orderBy: { order: 'asc' } },
      inclusions: { orderBy: { order: 'asc' } }
    }
  });

  if (!pkg) return null;

  return {
    slug: pkg.slug,
    kickerFr: pkg.kickerFr,
    kickerAr: pkg.kickerAr,
    titleFr: pkg.titleFr,
    titleAr: pkg.titleAr,
    descriptionFr: pkg.descriptionFr,
    descriptionAr: pkg.descriptionAr,
    departureCityFr: pkg.departureCityFr,
    departureCityAr: pkg.departureCityAr,
    durationDays: pkg.durationDays,
    priceMru: pkg.priceMru,
    priceEur: pkg.priceEur,
    depositPercent: pkg.depositPercent,
    seatsRemaining: pkg.seatsTotal - pkg.seatsBooked,
    seatsTotal: pkg.seatsTotal,
    departureDate: pkg.departureDate,
    programSteps: pkg.programSteps.map((step) => ({
      daysLabelFr: step.daysLabelFr,
      daysLabelAr: step.daysLabelAr,
      textFr: step.textFr,
      textAr: step.textAr
    })),
    inclusions: pkg.inclusions.map((inc) => ({
      itemFr: inc.itemFr,
      itemAr: inc.itemAr,
      valueFr: inc.valueFr,
      valueAr: inc.valueAr,
      highlight: inc.highlight
    }))
  };
}

export type PackageSummary = Awaited<ReturnType<typeof listPackages>>[number];
export type PackageDetail = NonNullable<Awaited<ReturnType<typeof getPackageBySlug>>>;
