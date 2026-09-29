// Query key factory: key đi từ rộng → hẹp để invalidate theo tiền tố.

export const qk = {
  config: ["config"],
  auth: {
    all: ["auth"],
    me: ["auth", "me"],
  },
  events: {
    all: ["events"],
    list: (params) => ["events", "list", params],
    featured: ["events", "featured"],
    upcoming: (limit) => ["events", "upcoming", limit],
    facets: ["events", "facets"],
    detail: (idOrSlug) => ["events", "detail", idOrSlug],
    related: (idOrSlug, limit) => ["events", "related", idOrSlug, limit],
    moreFromOrganizer: (idOrSlug, limit) => ["events", "more-from-organizer", idOrSlug, limit],
  },
  organizers: {
    all: ["organizers"],
    featured: (size) => ["organizers", "featured", size],
    detail: (idOrSlug) => ["organizers", "detail", idOrSlug],
    events: (idOrSlug, params) => ["organizers", "events", idOrSlug, params],
  },
  organizer: {
    all: ["organizer"],
    profile: ["organizer", "profile"],
    events: {
      all: ["organizer", "events"],
      list: (params) => ["organizer", "events", "list", params],
      detail: (id) => ["organizer", "events", "detail", id],
      orders: (id, params) => ["organizer", "events", "orders", id, params],
    },
    dashboard: {
      all: ["organizer", "dashboard"],
      summary: (params) => ["organizer", "dashboard", "summary", params],
      sales: (params) => ["organizer", "dashboard", "sales", params],
      revenue: (params) => ["organizer", "dashboard", "revenue", params],
      topEvents: (params) => ["organizer", "dashboard", "top-events", params],
    },
  },
  orders: {
    all: ["orders"],
    detail: (id) => ["orders", "detail", id],
    refunds: (id) => ["orders", "refunds", id],
  },
  refunds: {
    all: ["refunds"],
    detail: (id) => ["refunds", "detail", id],
  },
  me: {
    all: ["me"],
    orders: (params) => ["me", "orders", params],
    tickets: {
      all: ["me", "tickets"],
      list: (params) => ["me", "tickets", "list", params],
      detail: (id) => ["me", "tickets", "detail", id],
    },
  },
};

export const USER_SCOPED_KEYS = [qk.auth.all, qk.me.all, qk.organizer.all, qk.orders.all, qk.refunds.all];
