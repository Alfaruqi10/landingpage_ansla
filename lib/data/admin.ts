import { db } from "@/lib/db";

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export async function getAdminDashboardData() {
  const today = startOfDay(new Date());
  const trendStartDate = addDays(today, -6);
  const [
    productCount,
    categoryCount,
    testimonialCount,
    faqCount,
    bannerCount,
    orderCount,
    leadCount,
    contactCount,
    recentLeads,
    recentMessages,
    recentOrdersForTrend,
    recentLeadsForTrend,
    recentMessagesForTrend
  ] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.testimonial.count(),
    db.fAQ.count(),
    db.banner.count(),
    db.order.count(),
    db.lead.count(),
    db.contactMessage.count(),
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    db.order.findMany({
      where: {
        createdAt: {
          gte: trendStartDate
        }
      },
      select: {
        createdAt: true
      }
    }),
    db.lead.findMany({
      where: {
        createdAt: {
          gte: trendStartDate
        }
      },
      select: {
        createdAt: true
      }
    }),
    db.contactMessage.findMany({
      where: {
        createdAt: {
          gte: trendStartDate
        }
      },
      select: {
        createdAt: true
      }
    })
  ]);

  const trendMap = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(trendStartDate, index);
    const dateKey = startOfDay(date).toISOString().slice(0, 10);

    return {
      date,
      dateKey,
      shortLabel: new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short"
      }).format(date),
      orderCount: 0,
      leadCount: 0,
      messageCount: 0
    };
  });

  const trendIndex = new Map(trendMap.map((entry) => [entry.dateKey, entry]));

  recentOrdersForTrend.forEach((order) => {
    const dateKey = startOfDay(order.createdAt).toISOString().slice(0, 10);
    const entry = trendIndex.get(dateKey);

    if (entry) {
      entry.orderCount += 1;
    }
  });

  recentLeadsForTrend.forEach((lead) => {
    const dateKey = startOfDay(lead.createdAt).toISOString().slice(0, 10);
    const entry = trendIndex.get(dateKey);

    if (entry) {
      entry.leadCount += 1;
    }
  });

  recentMessagesForTrend.forEach((message) => {
    const dateKey = startOfDay(message.createdAt).toISOString().slice(0, 10);
    const entry = trendIndex.get(dateKey);

    if (entry) {
      entry.messageCount += 1;
    }
  });

  return {
    summary: {
      productCount,
      categoryCount,
      testimonialCount,
      faqCount,
      bannerCount,
      orderCount,
      leadCount,
      contactCount
    },
    trafficTrend: trendMap,
    recentLeads,
    recentMessages
  };
}

export async function getAdminProductsPageData() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    }),
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    })
  ]);

  return {
    products: products as Array<
      (typeof products)[number] & {
        galleryImages?: unknown;
        variantOptions?: unknown;
      }
    >,
    categories
  };
}

export async function getAdminCategoriesPageData() {
  return db.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });
}

export async function getAdminTestimonialsPageData() {
  return db.testimonial.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminFaqsPageData() {
  return db.fAQ.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
}

export async function getAdminBannersPageData() {
  return db.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
}

export async function getAdminVouchersPageData() {
  return db.voucher.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
  });
}

export async function getAdminLeadsPageData() {
  const [leads, messages] = await Promise.all([
    db.lead.findMany({
      orderBy: { createdAt: "desc" }
    }),
    db.contactMessage.findMany({
      orderBy: { createdAt: "desc" }
    })
  ]);

  return { leads, messages };
}

export async function getAdminOrdersPageData() {
  const orders = await db.order.findMany({
    include: {
      items: true,
      voucher: true
    },
    orderBy: { createdAt: "desc" }
  });

  return orders as Array<
    (typeof orders)[number] & {
      items: Array<
        (typeof orders)[number]["items"][number] & {
          sizeLabel?: string | null;
        }
      >;
    }
  >;
}
